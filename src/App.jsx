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
import { KEYS, METERS, PROGRESSION_LIBRARY } from './data/music.js';
import { SimpleSynth } from './lib/audio.js';
import {
  canAccessPreset,
  canUsePremiumAccess,
  loadEntitlements,
  mockPurchasePack,
  mockPurchasePlan,
} from './lib/billing.js';
import {
  expandProgression,
  makeId,
  pitchClassSetsMatch,
  resolveProgression,
} from './lib/music.js';

const PRACTICE_PHASES = {
  IDLE: 'idle',
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
  const [tempo, setTempo] = useState(90);
  const [keyOffset, setKeyOffset] = useState(0);
  const [meterId, setMeterId] = useState('4/4');
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState(styleNames[0]);
  const [selectedProgIndex, setSelectedProgIndex] = useState(0);
  const [customProgression, setCustomProgression] = useState(() => expandProgression(firstPreset.prog));
  const [isModified, setIsModified] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [activeChordIndex, setActiveChordIndex] = useState(-1);
  const [expectedNotes, setExpectedNotes] = useState([]);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const [entitlements, setEntitlements] = useState(loadEntitlements);
  const [midiStatus, setMidiStatus] = useState('Not connected');

  const requestRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentDemoChordRef = useRef(-1);
  const lastBeatRef = useRef(-1);
  const successTimerRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const midiAccessRef = useRef(null);
  const noteOwnersRef = useRef(new Map());

  const currentKey = KEYS.find((key) => key.offset === keyOffset) ?? KEYS[0];
  const meter = METERS.find((item) => item.id === meterId) ?? METERS[0];
  const hasPremium = canUsePremiumAccess(entitlements);

  const activeProgression = useMemo(
    () => resolveProgression(customProgression, currentKey),
    [customProgression, currentKey],
  );

  const totalBeats = useMemo(
    () => activeProgression.reduce((sum, chord) => sum + chord.durationBeats, 0),
    [activeProgression],
  );

  const selectedPreset = PROGRESSION_LIBRARY[selectedStyle]?.[selectedProgIndex] ?? firstPreset;
  const progressionTitle = `${currentKey.name} • ${isModified ? 'Custom Progression' : selectedPreset.name}`;

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
    setPhase(PRACTICE_PHASES.IDLE);
    setPlaybackProgress(0);
    setActiveChordIndex(-1);
    setExpectedNotes([]);
    setFeedbackMsg('');
    currentDemoChordRef.current = -1;
    lastBeatRef.current = -1;
    startTimeRef.current = null;
  }, [clearPracticeTimers]);

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
    setIsModified(false);
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

  const handleProgressionChange = (event) => {
    setPreset(selectedStyle, Number(event.target.value));
  };

  const setPressedStateFromOwners = useCallback(() => {
    setPressedKeys(new Set([...noteOwnersRef.current.entries()].filter(([, owners]) => owners.size > 0).map(([midi]) => midi)));
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

  const releaseMidiNotes = useCallback(() => {
    for (const [midi, owners] of [...noteOwnersRef.current.entries()]) {
      for (const source of [...owners]) {
        if (source.startsWith('midi:')) handleNoteOff(midi, source);
      }
    }
  }, [handleNoteOff]);

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

      const attachInput = (input) => {
        input.onmidimessage = (message) => {
          const [status, note, velocity] = message.data;
          const command = status & 0xf0;
          const source = `midi:${input.id}`;
          if (command === 0x90) {
            if (velocity > 0) handleNoteOn(note, source, Math.max(0.08, velocity / 127));
            else handleNoteOff(note, source);
          } else if (command === 0x80) {
            handleNoteOff(note, source);
          }
        };
      };

      for (const input of access.inputs.values()) attachInput(input);
      access.onstatechange = (event) => {
        if (event.port.type !== 'input') return;
        if (event.port.state === 'connected') attachInput(event.port);
        if (event.port.state === 'disconnected') releaseMidiNotes();
        const connected = [...access.inputs.values()].filter((input) => input.state === 'connected');
        setMidiStatus(connected.length ? connected.map((input) => input.name || 'MIDI input').join(', ') : 'Not connected');
      };

      const connected = [...access.inputs.values()].filter((input) => input.state === 'connected');
      setMidiStatus(connected.length ? connected.map((input) => input.name || 'MIDI input').join(', ') : 'No input found');
    } catch {
      setMidiStatus('Permission denied');
    }
  }, [handleNoteOff, handleNoteOn, hasPremium, releaseMidiNotes]);

  const animateTransport = useCallback((time) => {
    if (startTimeRef.current === null) startTimeRef.current = time;

    const elapsedMs = time - startTimeRef.current;
    const beatDurationMs = (60 / tempo) * 1000;
    const totalDurationMs = Math.max(1, totalBeats * beatDurationMs);

    if (elapsedMs >= totalDurationMs) {
      stopTransport();
      return;
    }

    const currentBeat = elapsedMs / beatDurationMs;
    setPlaybackProgress(elapsedMs / totalDurationMs);

    const beatIndex = Math.floor(currentBeat);
    if (metronomeEnabled && beatIndex !== lastBeatRef.current) {
      const beatInMeasure = beatIndex % meter.numerator;
      synth.playClick(beatInMeasure === 0);
      lastBeatRef.current = beatIndex;
    }

    let accumulatedBeats = 0;
    let chordIndex = 0;
    for (let index = 0; index < activeProgression.length; index += 1) {
      const chord = activeProgression[index];
      if (currentBeat >= accumulatedBeats && currentBeat < accumulatedBeats + chord.durationBeats) {
        chordIndex = index;
        break;
      }
      accumulatedBeats += chord.durationBeats;
    }

    if (chordIndex !== currentDemoChordRef.current) {
      if (currentDemoChordRef.current >= 0) {
        activeProgression[currentDemoChordRef.current]?.midiNotes.forEach((midi) => synth.noteOff(midi, 'demo'));
      }
      activeProgression[chordIndex]?.midiNotes.forEach((midi) => synth.noteOn(midi, 0.72, 'demo').catch(() => {}));
      currentDemoChordRef.current = chordIndex;
      setActiveChordIndex(chordIndex);
      setExpectedNotes(activeProgression[chordIndex]?.midiNotes ?? []);
    }

    requestRef.current = requestAnimationFrame(animateTransport);
  }, [activeProgression, meter.numerator, metronomeEnabled, stopTransport, tempo, totalBeats]);

  const startDemo = async () => {
    stopTransport();
    if (!activeProgression.length) return;
    await synth.init().catch(() => {});
    setPhase(PRACTICE_PHASES.DEMONSTRATING);
    startTimeRef.current = null;
    lastBeatRef.current = -1;
    requestRef.current = requestAnimationFrame(animateTransport);
  };

  const startImitate = async () => {
    stopTransport();
    if (!activeProgression.length) return;
    await synth.init().catch(() => {});
    setPhase(PRACTICE_PHASES.WAITING_IMITATE);
    setActiveChordIndex(0);
    setExpectedNotes(activeProgression[0].midiNotes);
    setFeedbackMsg('PLAY THE CHORD');
  };

  const advancePractice = useCallback(() => {
    const nextIndex = activeChordIndex + 1;
    if (nextIndex < activeProgression.length) {
      setActiveChordIndex(nextIndex);
      setExpectedNotes(activeProgression[nextIndex].midiNotes);
      setFeedbackMsg('PLAY THE NEXT CHORD');
      setPhase(PRACTICE_PHASES.WAITING_IMITATE);
      return;
    }

    setFeedbackMsg('COMPLETE!');
    completionTimerRef.current = window.setTimeout(() => {
      setFeedbackMsg('');
      setPhase(PRACTICE_PHASES.IDLE);
      setActiveChordIndex(-1);
      setExpectedNotes([]);
    }, 1400);
  }, [activeChordIndex, activeProgression]);

  useEffect(() => {
    if (phase !== PRACTICE_PHASES.WAITING_IMITATE || activeChordIndex < 0) return;
    const currentChord = activeProgression[activeChordIndex];
    if (!currentChord || pressedKeys.size === 0) return;

    if (pitchClassSetsMatch(currentChord.midiNotes, [...pressedKeys])) {
      setPhase(PRACTICE_PHASES.TRANSITIONING);
      setFeedbackMsg('GREAT!');
      successTimerRef.current = window.setTimeout(() => {
        setPhase(PRACTICE_PHASES.WAITING_RELEASE);
        setFeedbackMsg('RELEASE KEYS');
      }, 450);
    }
  }, [activeChordIndex, activeProgression, phase, pressedKeys]);

  useEffect(() => {
    if (phase !== PRACTICE_PHASES.WAITING_RELEASE || pressedKeys.size !== 0) return;
    advanceTimerRef.current = window.setTimeout(advancePractice, 220);
    return () => window.clearTimeout(advanceTimerRef.current);
  }, [advancePractice, phase, pressedKeys.size]);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.clearTimeout(successTimerRef.current);
      window.clearTimeout(advanceTimerRef.current);
      window.clearTimeout(completionTimerRef.current);
      if (midiAccessRef.current) {
        for (const input of midiAccessRef.current.inputs.values()) input.onmidimessage = null;
        midiAccessRef.current.onstatechange = null;
      }
      synth.stopAll();
    };
  }, []);

  const handleMeterChange = (event) => {
    const nextMeter = event.target.value;
    if (nextMeter !== '4/4' && !hasPremium) {
      setIsStoreOpen(true);
      return;
    }
    stopTransport();
    setMeterId(nextMeter);
  };

  const toggleMetronome = () => {
    if (!hasPremium) {
      setIsStoreOpen(true);
      return;
    }
    setMetronomeEnabled((enabled) => !enabled);
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
      { id: makeId(), rootOffset: 0, quality: 'major', durationBeats: 4 },
    ]);
    setIsModified(true);
  };

  const deleteChord = (index) => {
    setCustomProgression((progression) => progression.length <= 1 ? progression : progression.filter((_, chordIndex) => chordIndex !== index));
    setIsModified(true);
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

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 md:px-8 md:py-6">
        <section className="relative mb-5 text-center">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <h2 className="text-sm font-bold tracking-[0.12em] text-cyan-100 drop-shadow-md md:text-base md:tracking-[0.15em]">{progressionTitle}</h2>
            {selectedPreset.access !== 'free' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
                <LockKeyhole className="h-3 w-3" /> Premium
              </span>
            )}
          </div>
          <p className="mb-4 text-xs text-slate-500">{selectedPreset.description}</p>

          <div className="relative mx-auto flex h-20 w-full max-w-4xl items-center border-b border-cyan-800/40 pb-4 md:h-24">
            <div className="absolute -left-7 top-0 flex h-full flex-col justify-center font-mono text-xs text-cyan-700 opacity-70">
              <span>{meter.numerator}</span><span>{meter.denominator}</span>
            </div>

            <div className="flex h-full w-full gap-1.5 md:gap-2">
              {activeProgression.map((chord, index) => {
                const isActive = activeChordIndex === index;
                const isPast = activeChordIndex > index && [PRACTICE_PHASES.WAITING_IMITATE, PRACTICE_PHASES.TRANSITIONING, PRACTICE_PHASES.WAITING_RELEASE].includes(phase);
                return (
                  <div key={chord.id} className="relative flex h-full min-w-[3rem] items-center justify-center transition-all duration-300" style={{ flexGrow: chord.durationBeats, flexBasis: 0 }}>
                    <div className={`flex h-full w-full flex-col items-center justify-center rounded-xl border-2 text-lg font-bold transition-all duration-300 md:text-2xl ${isActive ? 'scale-[1.03] border-orange-400 bg-orange-500/20 text-orange-300 shadow-[0_0_25px_rgba(249,115,22,0.5)]' : isPast ? 'border-green-700/50 bg-green-500/10 text-green-300/60' : 'border-cyan-800/30 bg-cyan-900/20 text-cyan-100/40'}`}>
                      <span>{chord.displayName}</span>
                      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider opacity-60">{chord.durationBeats} beats</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {phase === PRACTICE_PHASES.DEMONSTRATING && (
              <div className="pointer-events-none absolute bottom-4 top-0 z-20 w-[3px] bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,1)]" style={{ left: `${playbackProgress * 100}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-cyan-300" />
                <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-cyan-300" />
              </div>
            )}

            {feedbackMsg && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" aria-live="polite">
                <span className="rounded-full bg-[#050B14]/90 px-5 py-3 text-xl font-black tracking-widest text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.35)] md:px-8 md:text-4xl">{feedbackMsg}</span>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto mb-7 flex w-full max-w-4xl flex-col gap-4 rounded-3xl border border-cyan-800/50 bg-[#0a1628]/60 p-4 shadow-xl backdrop-blur-xl md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <button type="button" onClick={phase === PRACTICE_PHASES.DEMONSTRATING ? stopTransport : startDemo} disabled={!activeProgression.length} aria-label={phase === PRACTICE_PHASES.DEMONSTRATING ? 'Stop demonstration' : 'Play demonstration'} className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-[#050B14] shadow-[0_0_20px_rgba(6,182,212,0.4)] transition hover:bg-cyan-400 disabled:opacity-50 md:h-14 md:w-14">
                {phase === PRACTICE_PHASES.DEMONSTRATING ? <Square className="h-5 w-5 fill-current md:h-6 md:w-6" /> : <Play className="ml-1 h-6 w-6 fill-current md:h-7 md:w-7" />}
              </button>
              <label className="flex flex-col">
                <span className="mb-1.5 text-[10px] font-bold tracking-widest text-cyan-300 md:text-xs">TEMPO: {tempo} BPM</span>
                <input type="range" min="40" max="200" value={tempo} disabled={phase === PRACTICE_PHASES.DEMONSTRATING} onChange={(event) => setTempo(Number(event.target.value))} className="h-2 w-28 cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 md:w-36" />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="rounded-2xl border border-cyan-800/50 bg-[#050B14]/60 px-3 py-2">
                <span className="sr-only">Select key</span>
                <select value={keyOffset} onChange={(event) => { stopTransport(); setKeyOffset(Number(event.target.value)); }} className="cursor-pointer appearance-none bg-transparent text-sm font-bold text-white outline-none">
                  {KEYS.map((key) => <option key={key.offset} value={key.offset}>{key.label}</option>)}
                </select>
              </label>

              <label className="rounded-2xl border border-cyan-800/50 bg-[#050B14]/60 px-3 py-2">
                <span className="sr-only">Select meter</span>
                <select value={meterId} onChange={handleMeterChange} className="cursor-pointer appearance-none bg-transparent text-sm font-bold text-white outline-none">
                  {METERS.map((item) => <option key={item.id} value={item.id}>{item.label}{item.id !== '4/4' && !hasPremium ? ' • Plus' : ''}</option>)}
                </select>
              </label>

              <button type="button" onClick={toggleMetronome} aria-pressed={metronomeEnabled} className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black tracking-wide transition ${metronomeEnabled ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300' : 'border-cyan-800/50 bg-[#050B14]/60 text-cyan-300 hover:border-cyan-500'}`}>
                {metronomeEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                METRONOME
              </button>
            </div>
          </div>

          <div className="grid gap-3 border-t border-cyan-900/40 pt-4 md:grid-cols-[1fr_1.4fr_auto]">
            <label className="flex items-center rounded-xl border border-cyan-800/40 bg-[#0f2038]/80 px-4 py-2.5 focus-within:border-cyan-500">
              <span className="sr-only">Style</span>
              <select value={selectedStyle} onChange={handleStyleChange} className="w-full cursor-pointer appearance-none truncate bg-transparent text-sm font-semibold text-cyan-100 outline-none">
                {styleNames.map((style) => {
                  const anyAccessible = PROGRESSION_LIBRARY[style].some((preset) => canAccessPreset(preset.access, entitlements));
                  return <option key={style} value={style}>{style}{anyAccessible ? '' : ' • Locked'}</option>;
                })}
              </select>
            </label>

            <label className="flex items-center rounded-xl border border-cyan-800/40 bg-[#0f2038]/80 px-4 py-2.5 focus-within:border-cyan-500">
              <span className="sr-only">Progression</span>
              <select value={selectedProgIndex} onChange={handleProgressionChange} className="w-full cursor-pointer appearance-none truncate bg-transparent text-sm font-semibold text-cyan-100 outline-none">
                {PROGRESSION_LIBRARY[selectedStyle].map((preset, index) => (
                  <option key={preset.id} value={index}>{preset.name}{canAccessPreset(preset.access, entitlements) ? '' : ' 🔒'}</option>
                ))}
              </select>
            </label>

            <button type="button" onClick={openEditor} className="rounded-xl border border-cyan-700 bg-cyan-900/30 px-5 py-2.5 text-xs font-bold tracking-wider text-cyan-300 shadow-[inset_0_0_10px_rgba(8,145,178,0.2)] transition hover:border-cyan-400 hover:bg-cyan-800/50 md:text-sm">EDIT PROG.</button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cyan-900/40 pt-4 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Music2 className="h-4 w-4 text-cyan-500" />
              <span>MIDI: <strong className="font-semibold text-slate-300">{midiStatus}</strong></span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={connectMidi} className="rounded-xl border border-cyan-800/60 bg-slate-950/30 px-3 py-2 font-bold text-cyan-300 transition hover:border-cyan-500">
                {hasPremium ? 'CONNECT MIDI' : 'CONNECT MIDI • PLUS'}
              </button>
              <button type="button" onClick={() => setIsStoreOpen(true)} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 font-black text-slate-950 transition hover:bg-cyan-400">
                <ShoppingBag className="h-4 w-4" /> STORE
              </button>
            </div>
          </div>
        </section>

        {phase === PRACTICE_PHASES.DEMONSTRATING && activeChordIndex === 0 && (
          <div className="pointer-events-none mx-auto mb-2 rounded-xl border-2 border-orange-500 bg-white px-4 py-2 text-xs font-black tracking-wide text-black shadow-xl">APP PLAYS…</div>
        )}

        <PianoKeyboard expectedNotes={expectedNotes} pressedKeys={pressedKeys} phase={phase} onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} accidental={currentKey.accidental} />

        <div className="safe-bottom z-30 mb-4 flex justify-center">
          {[PRACTICE_PHASES.WAITING_IMITATE, PRACTICE_PHASES.TRANSITIONING, PRACTICE_PHASES.WAITING_RELEASE].includes(phase) ? (
            <div className="animate-pulse-soft rounded-full border-2 border-orange-500 bg-orange-500/10 px-8 py-3 text-sm font-extrabold tracking-[0.16em] text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)] md:px-12 md:py-4 md:text-lg md:tracking-[0.2em]">
              {phase === PRACTICE_PHASES.WAITING_RELEASE ? 'RELEASE THE KEYS' : 'WAITING FOR INPUT…'}
            </div>
          ) : (
            <button type="button" onClick={startImitate} disabled={!activeProgression.length} className="rounded-full border-2 border-cyan-400 bg-[#0a1628]/90 px-8 py-3 text-sm font-extrabold tracking-[0.16em] text-white shadow-[0_0_25px_rgba(34,211,238,0.4),inset_0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md transition hover:scale-105 hover:bg-cyan-900/60 disabled:opacity-50 md:px-12 md:py-4 md:text-lg md:tracking-[0.2em]">IMITATE NOW!</button>
          )}
        </div>
      </main>

      {isEditorOpen && (
        <ProgressionEditor progression={customProgression} currentKey={currentKey} onAdd={addChord} onUpdate={updateChord} onDelete={deleteChord} onClose={() => setIsEditorOpen(false)} />
      )}

      {isStoreOpen && (
        <StoreModal entitlements={entitlements} onClose={() => setIsStoreOpen(false)} onChoosePlan={choosePlan} onBuyPack={buyPack} />
      )}
    </div>
  );
}
