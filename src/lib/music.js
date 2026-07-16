import {
  CHORD_FORMULAS,
  FLAT_NOTE_NAMES,
  QUALITIES,
  SHARP_NOTE_NAMES,
  VOICING_PROFILES,
} from '../data/music.js';

export const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const expandProgression = (progArray) =>
  progArray.map((chord) => ({
    id: makeId(),
    rootOffset: chord.r,
    quality: chord.q,
    durationBeats: chord.beats ?? 4,
    numeral: chord.numeral ?? '',
  }));

export const spellPitchClass = (pitchClass, accidental = 'sharp') => {
  const normalized = ((pitchClass % 12) + 12) % 12;
  return accidental === 'flat' ? FLAT_NOTE_NAMES[normalized] : SHARP_NOTE_NAMES[normalized];
};

export const midiNoteName = (midi, accidental = 'sharp') => {
  const octave = Math.floor(midi / 12) - 1;
  return `${spellPitchClass(midi, accidental)}${octave}`;
};

const keepInRange = (notes, min = 48, max = 84) => {
  let adjusted = [...notes];
  while (Math.max(...adjusted) > max) adjusted = adjusted.map((note) => note - 12);
  while (Math.min(...adjusted) < min) adjusted = adjusted.map((note) => note + 12);
  return adjusted;
};

const findGuideTone = (formula, candidates) => candidates.find((interval) => formula.includes(interval));

export const resolveVoicing = (rootMidi, quality, voicingId = 'right-hand') => {
  const formula = CHORD_FORMULAS[quality] ?? CHORD_FORMULAS.major;
  const fifth = findGuideTone(formula, [7, 6, 8]) ?? formula.at(-1) ?? 7;
  const third = findGuideTone(formula, [4, 3, 5, 2]);
  const seventh = findGuideTone(formula, [11, 10, 9]);
  const extension = formula.find((interval) => interval > 12);

  if (voicingId === 'two-hand') {
    const leftHandNotes = keepInRange([rootMidi - 12, rootMidi - 12 + fifth]);
    const rightHandNotes = keepInRange(formula.map((interval) => rootMidi + interval));
    return { leftHandNotes, rightHandNotes, midiNotes: [...leftHandNotes, ...rightHandNotes] };
  }

  if (voicingId === 'open-two-hand') {
    const leftHandNotes = keepInRange([rootMidi - 12]);
    const rightIntervals = [third, seventh, fifth, extension]
      .filter((interval, index, values) => interval != null && values.indexOf(interval) === index);
    const fallback = formula.length > 2 ? formula : [0, fifth, 12 + (third ?? 4)];
    const rightHandNotes = keepInRange((rightIntervals.length >= 2 ? rightIntervals : fallback).map((interval) => rootMidi + interval));
    return { leftHandNotes, rightHandNotes, midiNotes: [...leftHandNotes, ...rightHandNotes] };
  }

  if (voicingId === 'shell') {
    const leftHandNotes = keepInRange([rootMidi - 12]);
    const shellIntervals = [third, seventh, extension]
      .filter((interval, index, values) => interval != null && values.indexOf(interval) === index);
    const rightHandNotes = keepInRange((shellIntervals.length >= 2 ? shellIntervals : formula.slice(1)).map((interval) => rootMidi + interval));
    return { leftHandNotes, rightHandNotes, midiNotes: [...leftHandNotes, ...rightHandNotes] };
  }

  const rightHandNotes = keepInRange(formula.map((interval) => rootMidi + interval));
  return { leftHandNotes: [], rightHandNotes, midiNotes: rightHandNotes };
};

export const resolveProgression = (progression, key, voicingId = 'right-hand') =>
  progression.map((chord) => {
    let rootMidi = 60 + chord.rootOffset + key.offset;
    while (rootMidi > 71) rootMidi -= 12;
    while (rootMidi < 60) rootMidi += 12;

    const voicing = resolveVoicing(rootMidi, chord.quality, voicingId);
    const suffix = QUALITIES.find((quality) => quality.value === chord.quality)?.suffix ?? '';

    return {
      ...chord,
      rootMidi,
      ...voicing,
      displayName: `${spellPitchClass(rootMidi, key.accidental)}${suffix}`,
    };
  });

export const uniquePitchClasses = (notes) =>
  [...new Set(notes.map((note) => ((note % 12) + 12) % 12))].sort((a, b) => a - b);

const arraysEqual = (left, right) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export const evaluateChord = (chord, playedNotes, mode = 'any-inversion') => {
  const expectedNotes = [...chord.midiNotes].sort((a, b) => a - b);
  const actualNotes = [...playedNotes].sort((a, b) => a - b);
  const expectedPitches = uniquePitchClasses(expectedNotes);
  const actualPitches = uniquePitchClasses(actualNotes);
  const missingPitchClasses = expectedPitches.filter((pitch) => !actualPitches.includes(pitch));
  const extraPitchClasses = actualPitches.filter((pitch) => !expectedPitches.includes(pitch));
  const pitchClassesCorrect = missingPitchClasses.length === 0 && extraPitchClasses.length === 0;
  const rootInBass = actualNotes.length > 0 && actualNotes[0] % 12 === chord.rootMidi % 12;
  const exactVoicing = arraysEqual(expectedNotes, actualNotes);

  const expectedLeft = [...chord.leftHandNotes].sort((a, b) => a - b);
  const expectedRight = [...chord.rightHandNotes].sort((a, b) => a - b);
  const splitPoint = expectedLeft.length && expectedRight.length
    ? (Math.max(...expectedLeft) + Math.min(...expectedRight)) / 2
    : 60;
  const actualLeft = actualNotes.filter((note) => note < splitPoint);
  const actualRight = actualNotes.filter((note) => note >= splitPoint);
  const exactHands = arraysEqual(expectedLeft, actualLeft) && arraysEqual(expectedRight, actualRight);

  let correct = pitchClassesCorrect;
  if (mode === 'root-in-bass') correct = pitchClassesCorrect && rootInBass;
  if (mode === 'exact-voicing') correct = exactVoicing;
  if (mode === 'exact-hands') correct = exactHands;

  return {
    correct,
    pitchClassesCorrect,
    rootInBass,
    exactVoicing,
    exactHands,
    missingPitchClasses,
    extraPitchClasses,
    missingNotes: expectedNotes.filter((note) => !actualNotes.includes(note)),
    extraNotes: actualNotes.filter((note) => !expectedNotes.includes(note)),
  };
};

export const formatEvaluationFeedback = (result, accidental = 'sharp', mode = 'any-inversion') => {
  if (result.correct) return 'Correct';

  const details = [];
  if (mode === 'root-in-bass' && result.pitchClassesCorrect && !result.rootInBass) {
    details.push('Put the root in the bass');
  }

  if (mode === 'exact-voicing' || mode === 'exact-hands') {
    if (result.missingNotes.length) details.push(`Missing ${result.missingNotes.map((note) => midiNoteName(note, accidental)).join(', ')}`);
    if (result.extraNotes.length) details.push(`Extra ${result.extraNotes.map((note) => midiNoteName(note, accidental)).join(', ')}`);
  } else {
    if (result.missingPitchClasses.length) details.push(`Missing ${result.missingPitchClasses.map((pitch) => spellPitchClass(pitch, accidental)).join(', ')}`);
    if (result.extraPitchClasses.length) details.push(`Extra ${result.extraPitchClasses.map((pitch) => spellPitchClass(pitch, accidental)).join(', ')}`);
  }

  return details.join(' • ') || 'Keep building the chord';
};

export const buildTimeline = (progression, meter) => {
  let startUnit = 0;
  return progression.map((chord) => {
    const event = {
      ...chord,
      startUnit,
      endUnit: startUnit + chord.durationBeats,
      startMeasure: Math.floor(startUnit / meter.numerator),
      endMeasure: Math.ceil((startUnit + chord.durationBeats) / meter.numerator),
    };
    startUnit = event.endUnit;
    return event;
  });
};

export const getUnitDurationSeconds = (tempo, meter) => (60 / tempo) / (meter.unitsPerPulse ?? 1);

export const getMetronomeEvents = (totalUnits, meter, startTime, unitDurationSeconds) =>
  Array.from({ length: Math.ceil(totalUnits) }, (_, unitIndex) => ({
    time: startTime + unitIndex * unitDurationSeconds,
    strength: meter.accentPattern?.[unitIndex % meter.numerator] ?? (unitIndex % meter.numerator === 0 ? 1 : 0.3),
    unitIndex,
  }));

export const getVoicingProfile = (voicingId) =>
  VOICING_PROFILES.find((profile) => profile.id === voicingId) ?? VOICING_PROFILES[0];

export const formatDurationLabel = (durationUnits, meter) => {
  if (meter.denominator === 8) return `${durationUnits} eighth${durationUnits === 1 ? '' : 's'}`;
  return `${durationUnits} beat${durationUnits === 1 ? '' : 's'}`;
};

export const generateKeyboard = (startMidi = 48, endMidi = 84) => {
  const keys = [];
  for (let midi = startMidi; midi <= endMidi; midi += 1) {
    const noteClass = midi % 12;
    keys.push({
      midi,
      noteClass,
      isBlack: [1, 3, 6, 8, 10].includes(noteClass),
      octave: Math.floor(midi / 12) - 1,
    });
  }
  return keys;
};
