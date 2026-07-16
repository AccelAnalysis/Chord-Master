import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Crown,
  Grid,
  LockKeyhole,
  Menu,
  Music2,
  Play,
  RotateCcw,
  Settings,
  ShoppingBag,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import PianoKeyboard from './components/PianoKeyboard.jsx';
import ProgressionEditor from './components/ProgressionEditor.jsx';
import StoreModal from './components/StoreModal.jsx';
import {
  EVALUATION_MODES,
  KEYS,
  METERS,
  METRONOME_MODES,
  MODES,
  PROGRESSION_LIBRARY,
  VOICING_PROFILES,
} from './data/music.js';
import { SimpleSynth } from './lib/audio.js';
import {
  canAccessPreset,
  canAccessRequirement,
  canUsePremiumAccess,
  loadEntitlements,
  mockPurchasePack,
  mockPurchasePlan,
} from './lib/billing.js';
import {
  deleteCustomProgression,
  loadCustomProgressions,
  saveCustomProgression,
} from './lib/customProgressions.js';
import {
  buildTimeline,
  evaluateChord,
  expandProgression,
  formatDurationLabel,
  formatEvaluationFeedback,
  getMetronomeEvents,
  getUnitDurationSeconds,
  makeId,
  resolveProgression,
} from './lib/music.js';

const PRACTICE_PHASES = {
  IDLE: 'idle',
  COUNT_IN: 'count_in',
  DEMONSTRATING: 'demonstrating',
  WAITING_IMITATE: 'waiting_imitate',
  TRANSITIONING: 'transitioning',
  WAITING_RELEASE: 'waiting_release',
};

const synth = new SimpleSynth();
const styleNames = Object.keys(PROGRESSION_LIBRARY);
const firstPreset = PROGRESSION_LIBRARY[styleNames[0]][0];
const formatPlan = (plan) => plan.charAt(0).toUpperCase() + plan.slice(1);

export default function App() {
  const [phase, setPhase] = useState(PRACTICE_PHASES.IDLE);
  const [tempo, setTempo] = useState(firstPreset.defaultTempo);
  const [keyOffset, setKeyOffset] = useState(0);
  const [modeId, setModeId] = useState(firstPreset.mode);
  const [meterId, setMeterId] = useState(firstPreset.meterId);
  const [metronomeMode, setMetronomeMode] = useState('off');
  const [countInMeasures, setCountInMeasures] = useState(1);
  const [voicingId, setVoicingId] = useState('right-hand');
  const [evaluationMode, setEvaluationMode] = useState('any-inversion');

  const [selectedStyle, setSelectedStyle] = useState(styleNames[0]);
  const [selectedProgIndex, setSelectedProgIndex] = useState(0);
  const [customProgression, setCustomProgression] = useState(() => expandProgression(firstPreset.prog));
  const [isModified, setIsModified] = useState(false);
  const [customName, setCustomName] = useState(firstPreset.name);
  const [savedProgressions, setSavedProgressions] = useState(loadCustomProgressions);
  const [activeSavedId, setActiveSavedId] = useState(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackDetail, setFeedbackDetail] = useState('');
  const [countInLabel, setCountInLabel] = useState('');

  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [activeChordIndex, setActiveChordIndex] = useState(-1);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const [entitlements, setEntitlements] = useState(loadEntitlements);
  const [midiStatus, setMidiStatus] = useState('Not connected');
  const [midiInputs, setMidiInputs] = useState([]);
  const [selectedMidiInputId, setSelectedMidiInputId] = useState('');

  const requestRef = useRef(null);
  const transportKindRef = useRef('demo');
  const countInStartRef = useRef(0);
  const progressionStartRef = useRef(0);
  const unitDurationRef = useRef(0.5);
  const currentDemoChordRef = useRef(-1);
  const lastCountLabelRef = useRef('');
  const successTimerRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const midiAccessRef = useRef(null);
  const attachedMidiInputRef = useRef(null);
  const noteOwnersRef = useRef(new Map());
  const sustainBySourceRef = useRef(new Map());
  const deferredNoteOffRef = useRef(new Map());
  const lastDiagnosticSignatureRef = useRef('');

  const currentKey = KEYS.find((key) => key.offset === keyOffset) ?? KEYS[0];
  const currentMode = MODES.find((mode) => mode.id === modeId) ?? MODES[0];
  const meter = METERS.find((item) => item.id === meterId) ?? METERS[0];
  const hasPremium = canUsePremiumAccess(entitlements);

  const activeProgression = useMemo(
    () => resolveProgression(customProgression, currentKey, voicingId),
    [customProgression, currentKey, voicingId],
  );
  const timeline = useMemo(() => buildTimeline(activeProgression, meter), [activeProgression, meter]);
  const totalUnits = timeline.at(-1)?.endUnit ?? 0;
  const measureCount = Math.max(1, Math.ceil(totalUnits / meter.numerator));
  const activeChord = activeChordIndex >= 0 ? activeProgression[activeChordIndex] : null;
  const expectedNotes = activeChord?.midiNotes ?? [];
  const expectedLeftHandNotes = activeChord?.leftHandNotes ?? [];
  const expectedRightHandNotes = activeChord?.rightHandNotes ?? [];

  const selectedPreset = PROGRESSION_LIBRARY[selectedStyle]?.[selectedProgIndex] ?? firstPreset;
  const progressionName = isModified ? customName || 'Custom Progression' : selectedPreset.name;
  const progressionTitle = `${currentKey.name} ${currentMode.label} • ${progressionName}`;
  const isRunning = [PRACTICE_PHASES.COUNT_IN, PRACTICE_PHASES.DEMONSTRATING].includes(phase);

  const clearPracticeTimers = useCallback(() => {
    window.clearTimeout(successTimerRef.current);
    window.clearTimeout(advanceTimerRef.current);
    window.clearTimeout(completionTimerRef.current);
  }, []);

  const stopTransport = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = null;
    clearPracticeTimers();
    synth.stopSource('demo');
    synth.stopSource('metronome');
    setPhase(PRACTICE_PHASES.IDLE);
    setPlaybackProgress(0);
    setActiveChordIndex(-1);
    setFeedbackMsg('');
    setFeedbackDetail('');
    setCountInLabel('');
    currentDemoChordRef.current = -1;
    lastCountLabelRef.current = '';
    lastDiagnosticSignatureRef.current = '';
  }, [clearPracticeTimers]);

  const requireAccess = useCallback((access) => {
    if (canAccessRequirement(access, entitlements)) return true;
    setIsStoreOpen(true);
    return false;
  }, [entitlements]);

  const setPreset = useCallback((style, index) => {
    const preset = PROGRESSION_LIBRARY[style][index];
    if (!canAccessPreset(preset.access, entitlements)) {
      setIsStoreOpen(true);
      return false;
    }

    stopTransport();
    setSelectedStyle(style);
    setSelectedProgIndex(index);
    setCustomProgression(expandProgression(preset.prog));
    setCustomName(preset.name);
    setActiveSavedId(null);
    setIsModified(false);
    setTempo(preset.defaultTempo);
    setModeId(preset.mode);
    setMeterId(preset.meterId);

    const preferredVoicing = VOICING_PROFILES.find((profile) => profile.id === preset.voicingId) ?? VOICING_PROFILES[0];
    setVoicingId(canAccessRequirement(preferredVoicing.access, entitlements) ? preferredVoicing.id : 'right-hand');
    return true;
  }, [entitlements, stopTransport]);

  const handleStyleChange = (event) => {
    const style = event.target.value;
    const presets = PROGRESSION_LIBRARY[style];
    const accessibleIndex = presets.findIndex((preset) => canAccessPreset(preset.access, entitlements));
    if (accessibleIndex === -1) {
      setIsStoreOpen(true);
      return;
    }
    setPreset(style, accessibleIndex);
  };

  const handleProgressionChange = (event) => setPreset(selectedStyle, Number(event.target.value));

  const setPressedStateFromOwners = useCallback(() => {
    const sounding = [...noteOwnersRef.current.entries()]
      .filter(([, owners]) => owners.size > 0)
      .map(([midi]) => midi);
    setPressedKeys(new Set(sounding));
  }, []);

  const handleNoteOn = useCallback((midi, source = 'virtual', velocity = 0.78) => {
    const owners = noteOwnersRef.current.get(midi) ?? new Set();
    if (owners.has(source)) return;
    owners.add(source);
    noteOwnersRef.current.set(midi, owners);
    synth.noteOn(midi, velocity, source).catch(() => {});
    setPressedStateFromOwners();
  }, [setPressedStateFromOwners]);

  const handleNoteOff = useCallback((midi, source = 'virtual') => {
    const owners = noteOwnersRef.current.get(midi);
    if (!owners?.has(source)) return;
    owners.delete(source);
    if (owners.size === 0) noteOwnersRef.current.delete(midi);
    synth.noteOff(midi, source);
    setPressedStateFromOwners();
  }, [setPressedStateFromOwners]);

  const releaseMidiSource = useCallback((source) => {
    for (const [midi, owners] of [...noteOwnersRef.current.entries()]) {
      if (owners.has(source)) handleNoteOff(midi, source);
    }
    sustainBySourceRef.current.delete(source);
    deferredNoteOffRef.current.delete(source);
  }, [handleNoteOff]);

  const handleMidiNoteOff = useCallback((midi, source) => {
    if (sustainBySourceRef.current.get(source)) {
      const deferred = deferredNoteOffRef.current.get(source) ?? new Set();
      deferred.add(midi);
      deferredNoteOffRef.current.set(source, deferred);
      return;
    }
    handleNoteOff(midi, source);
  }, [handleNoteOff]);

  const handleSustainChange = useCallback((source, enabled) => {
    sustainBySourceRef.current.set(source, enabled);
    if (enabled) return;
    const deferred = deferredNoteOffRef.current.get(source) ?? new Set();
    deferred.forEach((midi) => handleNoteOff(midi, source));
    deferredNoteOffRef.current.delete(source);
  }, [handleNoteOff]);

  const attachMidiInput = useCallback((input) => {
    if (attachedMidiInputRef.current && attachedMidiInputRef.current !== input) {
      const oldSource = `midi:${attachedMidiInputRef.current.id}`;
      attachedMidiInputRef.current.onmidimessage = null;
      releaseMidiSource(oldSource);
    }
    if (!input) {
      attachedMidiInputRef.current = null;
      setMidiStatus('No input selected');
      return;
    }

    const source = `midi:${input.id}`;
    input.onmidimessage = (message) => {
      const [status, data1, data2] = message.data;
      const command = status & 0xf0;
      if (command === 0x90) {
        if (data2 > 0) {
          const deferred = deferredNoteOffRef.current.get(source);
          if (deferred?.has(data1)) {
            deferred.delete(data1);
            handleNoteOff(data1, source);
          }
          handleNoteOn(data1, source, Math.max(0.08, data2 / 127));
        } else {
          handleMidiNoteOff(data1, source);
        }
      } else if (command === 0x80) {
        handleMidiNoteOff(data1, source);
      } else if (command === 0xb0 && data1 === 64) {
        handleSustainChange(source, data2 >= 64);
      }
    };

    attachedMidiInputRef.current = input;
    setSelectedMidiInputId(input.id);
    setMidiStatus(input.name || 'MIDI input connected');
  }, [handleMidiNoteOff, handleNoteOff, handleNoteOn, handleSustainChange, releaseMidiSource]);

  const refreshMidiInputs = useCallback((access) => {
    const inputs = [...access.inputs.values()].filter((input) => input.state === 'connected');
    setMidiInputs(inputs.map((input) => ({ id: input.id, name: input.name || 'MIDI input' })));
    return inputs;
  }, []);

  const connectMidi = useCallback(async () => {
    if (!hasPremium) {
      setIsStoreOpen(true);
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      setMidiStatus('Web MIDI unavailable');
      return;
    }

    try {
      const access = await navigator.requestMIDIAccess();
      midiAccessRef.current = access;
      const inputs = refreshMidiInputs(access);
      attachMidiInput(inputs.find((input) => input.id === selectedMidiInputId) ?? inputs[0] ?? null);
      access.onstatechange = () => {
        const nextInputs = refreshMidiInputs(access);
        const selectedStillExists = nextInputs.find((input) => input.id === attachedMidiInputRef.current?.id);
        if (!selectedStillExists) attachMidiInput(nextInputs[0] ?? null);
      };
    } catch {
      setMidiStatus('Permission denied');
    }
  }, [attachMidiInput, hasPremium, refreshMidiInputs, selectedMidiInputId]);

  const selectMidiInput = (inputId) => {
    const input = midiAccessRef.current?.inputs.get(inputId);
    attachMidiInput(input ?? null);
  };

  const setActivePracticeChord = useCallback((index, prompt = 'PLAY THE CHORD') => {
    setActiveChordIndex(index);
    setFeedbackMsg(prompt);
    setFeedbackDetail('');
    lastDiagnosticSignatureRef.current = '';
  }, []);

  const animateTransport = useCallback(() => {
    const now = synth.currentTime;
    const progressionStart = progressionStartRef.current;
    const unitDuration = unitDurationRef.current;

    if (now < progressionStart) {
      const elapsedUnits = Math.max(0, Math.floor((now - countInStartRef.current) / unitDuration));
      const label = String((elapsedUnits % meter.numerator) + 1);
      if (label !== lastCountLabelRef.current) {
        lastCountLabelRef.current = label;
        setCountInLabel(label);
      }
      requestRef.current = requestAnimationFrame(animateTransport);
      return;
    }

    setCountInLabel('');
    if (transportKindRef.current === 'imitate') {
      requestRef.current = null;
      setPhase(PRACTICE_PHASES.WAITING_IMITATE);
      setActivePracticeChord(0);
      return;
    }

    setPhase(PRACTICE_PHASES.DEMONSTRATING);
    const elapsedUnits = (now - progressionStart) / unitDuration;
    if (elapsedUnits >= totalUnits) {
      stopTransport();
      return;
    }

    setPlaybackProgress(elapsedUnits / Math.max(1, totalUnits));
    const chordIndex = timeline.findIndex((event) => elapsedUnits >= event.startUnit && elapsedUnits < event.endUnit);
    if (chordIndex >= 0 && chordIndex !== currentDemoChordRef.current) {
      currentDemoChordRef.current = chordIndex;
      setActiveChordIndex(chordIndex);
    }
    requestRef.current = requestAnimationFrame(animateTransport);
  }, [meter.numerator, setActivePracticeChord, stopTransport, timeline, totalUnits]);

  const startTransport = async (kind) => {
    stopTransport();
    if (!activeProgression.length) return;
    await synth.init().catch(() => {});

    const unitDuration = getUnitDurationSeconds(tempo, meter);
    const countInUnits = metronomeMode === 'off' ? 0 : countInMeasures * meter.numerator;
    const countInStart = synth.currentTime + 0.1;
    const progressionStart = countInStart + countInUnits * unitDuration;

    transportKindRef.current = kind;
    countInStartRef.current = countInStart;
    progressionStartRef.current = progressionStart;
    unitDurationRef.current = unitDuration;
    currentDemoChordRef.current = -1;
    lastCountLabelRef.current = '';
    setPlaybackProgress(0);
    setActiveChordIndex(-1);
    setFeedbackDetail('');

    if (countInUnits > 0) {
      getMetronomeEvents(countInUnits, meter, countInStart, unitDuration)
        .forEach((event) => synth.scheduleClick(event.time, event.strength));
    }

    if (kind === 'demo') {
      timeline.forEach((event) => {
        synth.scheduleChord(
          event.midiNotes,
          progressionStart + event.startUnit * unitDuration,
          Math.max(0.12, event.durationBeats * unitDuration * 0.96),
          0.68,
          'demo',
        ).catch(() => {});
      });
      if (metronomeMode === 'full') {
        getMetronomeEvents(totalUnits, meter, progressionStart, unitDuration)
          .forEach((event) => synth.scheduleClick(event.time, event.strength));
      }
    }

    setPhase(countInUnits > 0 ? PRACTICE_PHASES.COUNT_IN : kind === 'demo' ? PRACTICE_PHASES.DEMONSTRATING : PRACTICE_PHASES.WAITING_IMITATE);
    if (countInUnits === 0 && kind === 'imitate') {
      setActivePracticeChord(0);
      return;
    }
    requestRef.current = requestAnimationFrame(animateTransport);
  };

  const advancePractice = useCallback(() => {
    const nextIndex = activeChordIndex + 1;
    if (nextIndex < activeProgression.length) {
      setPhase(PRACTICE_PHASES.WAITING_IMITATE);
      setActivePracticeChord(nextIndex, 'PLAY THE NEXT CHORD');
      return;
    }

    setFeedbackMsg('COMPLETE!');
    setFeedbackDetail('Progression completed with the selected voicing and evaluation rule.');
    completionTimerRef.current = window.setTimeout(() => {
      setFeedbackMsg('');
      setFeedbackDetail('');
      setPhase(PRACTICE_PHASES.IDLE);
      setActiveChordIndex(-1);
    }, 1800);
  }, [activeChordIndex, activeProgression.length, setActivePracticeChord]);

  useEffect(() => {
    if (phase !== PRACTICE_PHASES.WAITING_IMITATE || !activeChord || pressedKeys.size === 0) return;
    const result = evaluateChord(activeChord, [...pressedKeys], evaluationMode);
    const expectedCount = evaluationMode.startsWith('exact') ? activeChord.midiNotes.length : new Set(activeChord.midiNotes.map((note) => note % 12)).size;
    const signature = [...pressedKeys].sort((a, b) => a - b).join('-');

    if (result.correct) {
      setPhase(PRACTICE_PHASES.TRANSITIONING);
      setFeedbackMsg('GREAT!');
      setFeedbackDetail('Correct chord. Release the keys to continue.');
      successTimerRef.current = window.setTimeout(() => {
        setPhase(PRACTICE_PHASES.WAITING_RELEASE);
        setFeedbackMsg('RELEASE KEYS');
      }, 500);
      return;
    }

    if ((pressedKeys.size >= expectedCount || result.extraPitchClasses.length > 0) && signature !== lastDiagnosticSignatureRef.current) {
      lastDiagnosticSignatureRef.current = signature;
      setFeedbackDetail(formatEvaluationFeedback(result, currentKey.accidental, evaluationMode));
    }
  }, [activeChord, currentKey.accidental, evaluationMode, phase, pressedKeys]);

  useEffect(() => {
    if (phase !== PRACTICE_PHASES.WAITING_RELEASE || pressedKeys.size !== 0) return;
    advanceTimerRef.current = window.setTimeout(advancePractice, 220);
    return () => window.clearTimeout(advanceTimerRef.current);
  }, [advancePractice, phase, pressedKeys.size]);

  useEffect(() => {
    const selectedVoicing = VOICING_PROFILES.find((profile) => profile.id === voicingId);
    if (selectedVoicing && !canAccessRequirement(selectedVoicing.access, entitlements)) setVoicingId('right-hand');
    const selectedEvaluation = EVALUATION_MODES.find((item) => item.id === evaluationMode);
    if (selectedEvaluation && !canAccessRequirement(selectedEvaluation.access, entitlements)) setEvaluationMode('any-inversion');
    if (!hasPremium && meterId !== '4/4') setMeterId('4/4');
    if (!hasPremium && metronomeMode !== 'off') setMetronomeMode('off');
  }, [entitlements, evaluationMode, hasPremium, meterId, metronomeMode, voicingId]);

  useEffect(() => () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    clearPracticeTimers();
    if (attachedMidiInputRef.current) attachedMidiInputRef.current.onmidimessage = null;
    if (midiAccessRef.current) midiAccessRef.current.onstatechange = null;
    synth.stopAll();
  }, [clearPracticeTimers]);

  const handleMeterChange = (event) => {
    const nextMeter = event.target.value;
    if (nextMeter !== '4/4' && !requireAccess('plus')) return;
    stopTransport();
    setMeterId(nextMeter);
  };

  const handleMetronomeChange = (event) => {
    const nextMode = event.target.value;
    if (nextMode !== 'off' && !requireAccess('plus')) return;
    stopTransport();
    setMetronomeMode(nextMode);
  };

  const handleVoicingChange = (event) => {
    const nextId = event.target.value;
    const profile = VOICING_PROFILES.find((item) => item.id === nextId);
    if (!requireAccess(profile?.access)) return;
    stopTransport();
    setVoicingId(nextId);
  };

  const handleEvaluationChange = (event) => {
    const nextId = event.target.value;
    const mode = EVALUATION_MODES.find((item) => item.id === nextId);
    if (!requireAccess(mode?.access)) return;
    stopTransport();
    setEvaluationMode(nextId);
  };

  const openEditor = () => {
    stopTransport();
    setIsEditorOpen(true);
  };

  const updateChord = (index, field, value) => {
    setCustomProgression((progression) => progression.map((chord, chordIndex) => (
      chordIndex === index ? { ...chord, [field]: value } : chord
    )));
    setIsModified(true);
  };

  const addChord = () => {
    setCustomProgression((progression) => [
      ...progression,
      { id: makeId(), rootOffset: 0, quality: 'major', durationBeats: meter.numerator, numeral: 'I' },
    ]);
    setIsModified(true);
  };

  const deleteChord = (index) => {
    setCustomProgression((progression) => progression.length <= 1 ? progression : progression.filter((_, chordIndex) => chordIndex !== index));
    setIsModified(true);
  };

  const saveProgression = (name, savedId) => {
    const isNew = !savedId;
    if (isNew && !hasPremium && savedProgressions.length >= 1) {
      setIsStoreOpen(true);
      return;
    }
    const id = savedId ?? makeId();
    const next = saveCustomProgression(savedProgressions, {
      id,
      name,
      progression: customProgression,
      keyOffset,
      modeId,
      meterId,
      voicingId,
      evaluationMode,
      tempo,
    });
    setSavedProgressions(next);
    setActiveSavedId(id);
    setCustomName(name.trim() || 'Untitled Progression');
    setIsModified(true);
    setFeedbackMsg('SAVED');
    window.setTimeout(() => setFeedbackMsg(''), 1100);
  };

  const loadSavedProgression = (item) => {
    stopTransport();
    setCustomProgression(item.progression.map((chord) => ({ ...chord, id: chord.id ?? makeId() })));
    setKeyOffset(item.keyOffset ?? 0);
    setModeId(item.modeId ?? 'major');
    setMeterId(item.meterId ?? '4/4');
    setVoicingId(item.voicingId ?? 'right-hand');
    setEvaluationMode(item.evaluationMode ?? 'any-inversion');
    setTempo(item.tempo ?? 90);
    setCustomName(item.name);
    setActiveSavedId(item.id);
    setIsModified(true);
  };

  const removeSavedProgression = (progressionId) => {
    const next = deleteCustomProgression(savedProgressions, progressionId);
    setSavedProgressions(next);
    if (activeSavedId === progressionId) setActiveSavedId(null);
  };

  const choosePlan = (plan) => {
    const next = mockPurchasePlan(entitlements, plan);
    setEntitlements(next);
    setFeedbackMsg(`${formatPlan(plan).toUpperCase()} ACTIVE`);
    window.setTimeout(() => setFeedbackMsg(''), 1200);
  };

  const buyPack = (packId) => {
    const next = mockPurchasePack(entitlements, packId);
    setEntitlements(next);
    setFeedbackMsg('PACK UNLOCKED');
    window.setTimeout(() => setFeedbackMsg(''), 1200);
  };

  const timelineWidth = Math.max(760, measureCount * 150);

  return (
    <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-[#050B14] font-sans text-slate-200 selection:bg-cyan-500/30">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-600/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[40rem] w-[40rem] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <header className="safe-top z-20 flex items-center justify-between border-b border-cyan-900/30 bg-[#0a1628]/85 px-4 py-4 backdrop-blur-md md:px-6">
        <div className="flex gap-2 text-cyan-400 md:gap-4">
          <button type="button" aria-label="Open menu" className="rounded-lg p-1.5 transition hover:bg-cyan-900/40 hover:text-cyan-200"><Menu className="h-5 w-5 md:h-6 md:w-6" /></button>
          <button type="button" aria-label="Open progression library" className="rounded-lg p-1.5 transition hover:bg-cyan-900/40 hover:text-cyan-200"><Grid className="h-5 w-5 md:h-6 md:w-6" /></button>
        </div>

        <div className="text-center">
          <h1 className="text-lg font-black tracking-[0.16em] text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)] md:text-2xl md:tracking-[0.2em]">CHORD MASTER</h1>
          <button type="button" onClick={() => setIsStoreOpen(true)} className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-cyan-800/70 bg-cyan-950/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-300 transition hover:border-cyan-500">
            {entitlements.plan === 'pro' && <Crown className="h-3 w-3 text-amber-300" />}
            {formatPlan(entitlements.plan)} plan
          </button>
        </div>

        <div className="flex gap-2 text-cyan-400 md:gap-4">
          <button type="button" aria-label="Reset transport" onClick={stopTransport} className="rounded-lg p-1.5 transition hover:bg-cyan-900/40 hover:text-cyan-200"><RotateCcw className="h-5 w-5 md:h-6 md:w-6" /></button>
          <button type="button" aria-label="Open store and settings" onClick={() => setIsStoreOpen(true)} className="rounded-lg p-1.5 transition hover:bg-cyan-900/40 hover:text-cyan-200"><Settings className="h-5 w-5 md:h-6 md:w-6" /></button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 md:px-8 md:py-6">
        <section className="relative mb-5 text-center">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <h2 className="text-sm font-bold tracking-[0.12em] text-cyan-100 drop-shadow-md md:text-base md:tracking-[0.15em]">{progressionTitle}</h2>
            {!isModified && selectedPreset.access !== 'free' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
                <LockKeyhole className="h-3 w-3" /> Premium
              </span>
            )}
          </div>
          <div className="mb-4 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="rounded-full border border-cyan-900/50 bg-cyan-950/20 px-3 py-1">{meter.label}</span>
            <span className="rounded-full border border-cyan-900/50 bg-cyan-950/20 px-3 py-1">{isModified ? 'Custom' : selectedPreset.feel}</span>
            {!isModified && selectedPreset.theoryFocus && <span className="rounded-full border border-cyan-900/50 bg-cyan-950/20 px-3 py-1">Focus: {selectedPreset.theoryFocus}</span>}
          </div>
          <p className="mb-3 text-xs text-slate-500">{isModified ? 'Custom progression. Save it in the Progression Workshop to keep it.' : selectedPreset.description}</p>

          <div className="mx-auto w-full max-w-6xl overflow-x-auto pb-2">
            <div className="relative h-28 border-b border-cyan-800/40 pb-4" style={{ minWidth: `${timelineWidth}px` }}>
              {Array.from({ length: measureCount + 1 }, (_, index) => (
                <div key={`bar-${index}`} className="absolute bottom-4 top-0 border-l border-cyan-700/25" style={{ left: `${(index * meter.numerator / Math.max(1, totalUnits)) * 100}%` }}>
                  {index < measureCount && <span className="absolute left-1 top-1 text-[8px] font-bold text-cyan-700">M{index + 1}</span>}
                </div>
              ))}

              {timeline.map((chord, index) => {
                const isActive = activeChordIndex === index;
                const isPast = activeChordIndex > index && [PRACTICE_PHASES.WAITING_IMITATE, PRACTICE_PHASES.TRANSITIONING, PRACTICE_PHASES.WAITING_RELEASE].includes(phase);
                return (
                  <div key={chord.id} className="absolute bottom-4 top-0 p-1 transition-all duration-300" style={{ left: `${(chord.startUnit / Math.max(1, totalUnits)) * 100}%`, width: `${(chord.durationBeats / Math.max(1, totalUnits)) * 100}%` }}>
                    <div className={`flex h-full w-full min-w-[4rem] flex-col items-center justify-center rounded-xl border-2 px-1 text-base font-bold transition-all duration-300 md:text-xl ${isActive ? 'scale-[1.02] border-orange-400 bg-orange-500/20 text-orange-300 shadow-[0_0_25px_rgba(249,115,22,0.5)]' : isPast ? 'border-green-700/50 bg-green-500/10 text-green-300/60' : 'border-cyan-800/30 bg-cyan-900/20 text-cyan-100/50'}`}>
                      <span>{chord.displayName}</span>
                      {chord.numeral && <span className="mt-0.5 text-[10px] font-black text-cyan-400/80">{chord.numeral}</span>}
                      <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider opacity-60">{formatDurationLabel(chord.durationBeats, meter)}</span>
                    </div>
                  </div>
                );
              })}

              {phase === PRACTICE_PHASES.DEMONSTRATING && (
                <div className="pointer-events-none absolute bottom-4 top-0 z-20 w-[3px] bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,1)]" style={{ left: `${playbackProgress * 100}%`, transform: 'translateX(-50%)' }}>
                  <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-cyan-300" />
                  <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-cyan-300" />
                </div>
              )}

              {phase === PRACTICE_PHASES.COUNT_IN && (
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" aria-live="polite">
                  <span className="rounded-full border-2 border-cyan-400 bg-[#050B14]/95 px-8 py-3 text-4xl font-black text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.35)]">{countInLabel}</span>
                </div>
              )}

              {feedbackMsg && phase !== PRACTICE_PHASES.COUNT_IN && (
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" aria-live="polite">
                  <span className="rounded-full bg-[#050B14]/90 px-5 py-3 text-xl font-black tracking-widest text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.35)] md:px-8 md:text-4xl">{feedbackMsg}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mb-6 flex w-full max-w-6xl flex-col gap-4 rounded-3xl border border-cyan-800/50 bg-[#0a1628]/60 p-4 shadow-xl backdrop-blur-xl md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <button type="button" onClick={isRunning ? stopTransport : () => startTransport('demo')} disabled={!activeProgression.length} aria-label={isRunning ? 'Stop demonstration' : 'Play demonstration'} className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-[#050B14] shadow-[0_0_20px_rgba(6,182,212,0.4)] transition hover:bg-cyan-400 disabled:opacity-50 md:h-14 md:w-14">
                {isRunning ? <Square className="h-5 w-5 fill-current md:h-6 md:w-6" /> : <Play className="ml-1 h-6 w-6 fill-current md:h-7 md:w-7" />}
              </button>
              <label className="flex flex-col">
                <span className="mb-1.5 text-[10px] font-bold tracking-widest text-cyan-300 md:text-xs">TEMPO: {tempo} BPM</span>
                <input type="range" min="40" max="200" value={tempo} disabled={isRunning} onChange={(event) => setTempo(Number(event.target.value))} className="h-2 w-28 cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 md:w-36" />
                <span className="mt-1 text-[9px] text-slate-600">Pulse: {meter.pulseLabel}</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="rounded-2xl border border-cyan-800/50 bg-[#050B14]/60 px-3 py-2">
                <span className="sr-only">Select tonic</span>
                <select value={keyOffset} disabled={isRunning} onChange={(event) => { stopTransport(); setKeyOffset(Number(event.target.value)); }} className="cursor-pointer appearance-none bg-transparent text-sm font-bold text-white outline-none disabled:opacity-50">
                  {KEYS.map((key) => <option key={key.offset} value={key.offset}>{key.label}</option>)}
                </select>
              </label>
              <label className="rounded-2xl border border-cyan-800/50 bg-[#050B14]/60 px-3 py-2">
                <span className="sr-only">Select mode</span>
                <select value={modeId} disabled={isRunning} onChange={(event) => { stopTransport(); setModeId(event.target.value); }} className="cursor-pointer appearance-none bg-transparent text-sm font-bold text-white outline-none disabled:opacity-50">
                  {MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
                </select>
              </label>
              <label className="rounded-2xl border border-cyan-800/50 bg-[#050B14]/60 px-3 py-2">
                <span className="sr-only">Select meter</span>
                <select value={meterId} disabled={isRunning} onChange={handleMeterChange} className="cursor-pointer appearance-none bg-transparent text-sm font-bold text-white outline-none disabled:opacity-50">
                  {METERS.map((item) => <option key={item.id} value={item.id}>{item.label}{item.id !== '4/4' && !hasPremium ? ' • Plus' : ''}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-3 border-t border-cyan-900/40 pt-4 md:grid-cols-[1fr_1.4fr_auto]">
            <label className="flex items-center rounded-xl border border-cyan-800/40 bg-[#0f2038]/80 px-4 py-2.5 focus-within:border-cyan-500">
              <span className="sr-only">Style</span>
              <select value={selectedStyle} disabled={isRunning} onChange={handleStyleChange} className="w-full cursor-pointer appearance-none truncate bg-transparent text-sm font-semibold text-cyan-100 outline-none disabled:opacity-50">
                {styleNames.map((style) => {
                  const anyAccessible = PROGRESSION_LIBRARY[style].some((preset) => canAccessPreset(preset.access, entitlements));
                  return <option key={style} value={style}>{style}{anyAccessible ? '' : ' • Locked'}</option>;
                })}
              </select>
            </label>
            <label className="flex items-center rounded-xl border border-cyan-800/40 bg-[#0f2038]/80 px-4 py-2.5 focus-within:border-cyan-500">
              <span className="sr-only">Progression</span>
              <select value={selectedProgIndex} disabled={isRunning} onChange={handleProgressionChange} className="w-full cursor-pointer appearance-none truncate bg-transparent text-sm font-semibold text-cyan-100 outline-none disabled:opacity-50">
                {PROGRESSION_LIBRARY[selectedStyle].map((preset, index) => <option key={preset.id} value={index}>{preset.name}{canAccessPreset(preset.access, entitlements) ? '' : ' 🔒'}</option>)}
              </select>
            </label>
            <button type="button" onClick={openEditor} disabled={isRunning} className="rounded-xl border border-cyan-700 bg-cyan-900/30 px-5 py-2.5 text-xs font-bold tracking-wider text-cyan-300 shadow-[inset_0_0_10px_rgba(8,145,178,0.2)] transition hover:border-cyan-400 hover:bg-cyan-800/50 disabled:opacity-50 md:text-sm">PROGRESSION WORKSHOP</button>
          </div>

          <div className="grid gap-3 border-t border-cyan-900/40 pt-4 md:grid-cols-4">
            <label className="rounded-xl border border-cyan-800/40 bg-slate-950/25 px-3 py-2">
              <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-cyan-500">Voicing</span>
              <select value={voicingId} disabled={isRunning} onChange={handleVoicingChange} className="w-full cursor-pointer bg-transparent text-xs font-bold text-white outline-none disabled:opacity-50">
                {VOICING_PROFILES.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}{canAccessRequirement(profile.access, entitlements) ? '' : ` • ${profile.access}`}</option>)}
              </select>
            </label>
            <label className="rounded-xl border border-cyan-800/40 bg-slate-950/25 px-3 py-2">
              <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-cyan-500">Evaluation</span>
              <select value={evaluationMode} disabled={isRunning} onChange={handleEvaluationChange} className="w-full cursor-pointer bg-transparent text-xs font-bold text-white outline-none disabled:opacity-50">
                {EVALUATION_MODES.map((item) => <option key={item.id} value={item.id}>{item.label}{canAccessRequirement(item.access, entitlements) ? '' : ` • ${item.access}`}</option>)}
              </select>
            </label>
            <label className="rounded-xl border border-cyan-800/40 bg-slate-950/25 px-3 py-2">
              <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-cyan-500">Metronome</span>
              <select value={metronomeMode} disabled={isRunning} onChange={handleMetronomeChange} className="w-full cursor-pointer bg-transparent text-xs font-bold text-white outline-none disabled:opacity-50">
                {METRONOME_MODES.map((item) => <option key={item.id} value={item.id}>{item.label}{item.id !== 'off' && !hasPremium ? ' • Plus' : ''}</option>)}
              </select>
            </label>
            <label className="rounded-xl border border-cyan-800/40 bg-slate-950/25 px-3 py-2">
              <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-cyan-500">Count-in</span>
              <select value={countInMeasures} disabled={isRunning || metronomeMode === 'off'} onChange={(event) => setCountInMeasures(Number(event.target.value))} className="w-full cursor-pointer bg-transparent text-xs font-bold text-white outline-none disabled:opacity-40">
                <option value={1}>1 measure</option>
                <option value={2}>2 measures</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cyan-900/40 pt-4 text-xs">
            <div className="flex min-w-0 items-center gap-2 text-slate-400">
              <Music2 className="h-4 w-4 shrink-0 text-cyan-500" />
              <span className="truncate">MIDI: <strong className="font-semibold text-slate-300">{midiStatus}</strong></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {midiInputs.length > 1 && (
                <select value={selectedMidiInputId} onChange={(event) => selectMidiInput(event.target.value)} className="rounded-xl border border-cyan-800/60 bg-slate-950/50 px-3 py-2 text-xs font-bold text-cyan-200 outline-none">
                  {midiInputs.map((input) => <option key={input.id} value={input.id}>{input.name}</option>)}
                </select>
              )}
              <button type="button" onClick={connectMidi} className="rounded-xl border border-cyan-800/60 bg-slate-950/30 px-3 py-2 font-bold text-cyan-300 transition hover:border-cyan-500">{hasPremium ? 'CONNECT MIDI' : 'CONNECT MIDI • PLUS'}</button>
              <button type="button" onClick={() => setIsStoreOpen(true)} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 font-black text-slate-950 transition hover:bg-cyan-400"><ShoppingBag className="h-4 w-4" /> STORE</button>
            </div>
          </div>
        </section>

        {phase === PRACTICE_PHASES.DEMONSTRATING && activeChordIndex === 0 && (
          <div className="pointer-events-none mx-auto mb-2 rounded-xl border-2 border-orange-500 bg-white px-4 py-2 text-xs font-black tracking-wide text-black shadow-xl">APP PLAYS…</div>
        )}

        {voicingId !== 'right-hand' && (
          <div className="mx-auto mb-2 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />Left hand</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />Right hand</span>
          </div>
        )}

        <PianoKeyboard
          expectedNotes={expectedNotes}
          expectedLeftHandNotes={expectedLeftHandNotes}
          expectedRightHandNotes={expectedRightHandNotes}
          pressedKeys={pressedKeys}
          phase={phase}
          onNoteOn={handleNoteOn}
          onNoteOff={handleNoteOff}
          accidental={currentKey.accidental}
        />

        {feedbackDetail && (
          <div className="mx-auto mb-4 max-w-3xl rounded-2xl border border-orange-500/35 bg-orange-500/10 px-5 py-3 text-center text-sm font-semibold text-orange-200" aria-live="polite">
            {feedbackDetail}
          </div>
        )}

        <div className="safe-bottom z-30 mb-4 flex justify-center">
          {[PRACTICE_PHASES.WAITING_IMITATE, PRACTICE_PHASES.TRANSITIONING, PRACTICE_PHASES.WAITING_RELEASE].includes(phase) ? (
            <div className="animate-pulse-soft rounded-full border-2 border-orange-500 bg-orange-500/10 px-8 py-3 text-sm font-extrabold tracking-[0.16em] text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)] md:px-12 md:py-4 md:text-lg md:tracking-[0.2em]">
              {phase === PRACTICE_PHASES.WAITING_RELEASE ? 'RELEASE THE KEYS' : 'WAITING FOR INPUT…'}
            </div>
          ) : phase === PRACTICE_PHASES.COUNT_IN && transportKindRef.current === 'imitate' ? (
            <div className="rounded-full border-2 border-cyan-500 bg-cyan-500/10 px-8 py-3 text-sm font-extrabold tracking-[0.16em] text-cyan-300 md:px-12 md:py-4 md:text-lg">GET READY…</div>
          ) : (
            <button type="button" onClick={() => startTransport('imitate')} disabled={!activeProgression.length || isRunning} className="rounded-full border-2 border-cyan-400 bg-[#0a1628]/90 px-8 py-3 text-sm font-extrabold tracking-[0.16em] text-white shadow-[0_0_25px_rgba(34,211,238,0.4),inset_0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md transition hover:scale-105 hover:bg-cyan-900/60 disabled:opacity-50 md:px-12 md:py-4 md:text-lg md:tracking-[0.2em]">IMITATE NOW!</button>
          )}
        </div>
      </main>

      {isEditorOpen && (
        <ProgressionEditor
          progression={customProgression}
          currentKey={currentKey}
          onAdd={addChord}
          onUpdate={updateChord}
          onDelete={deleteChord}
          onClose={() => setIsEditorOpen(false)}
          savedProgressions={savedProgressions}
          activeSavedId={activeSavedId}
          initialName={customName}
          onSave={saveProgression}
          onLoadSaved={loadSavedProgression}
          onDeleteSaved={removeSavedProgression}
          canSaveUnlimited={hasPremium}
        />
      )}

      {isStoreOpen && (
        <StoreModal entitlements={entitlements} onClose={() => setIsStoreOpen(false)} onChoosePlan={choosePlan} onBuyPack={buyPack} />
      )}
    </div>
  );
}
