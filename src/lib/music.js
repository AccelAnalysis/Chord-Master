import { CHORD_FORMULAS, FLAT_NOTE_NAMES, QUALITIES, SHARP_NOTE_NAMES } from '../data/music.js';

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
  }));

export const spellPitchClass = (pitchClass, accidental = 'sharp') => {
  const normalized = ((pitchClass % 12) + 12) % 12;
  return accidental === 'flat' ? FLAT_NOTE_NAMES[normalized] : SHARP_NOTE_NAMES[normalized];
};

export const resolveProgression = (progression, key) =>
  progression.map((chord) => {
    let rootMidi = 48 + chord.rootOffset + key.offset;
    while (rootMidi > 59) rootMidi -= 12;
    while (rootMidi < 48) rootMidi += 12;

    const formula = CHORD_FORMULAS[chord.quality] ?? CHORD_FORMULAS.major;
    const midiNotes = formula.map((interval) => rootMidi + interval);
    const suffix = QUALITIES.find((quality) => quality.value === chord.quality)?.suffix ?? '';

    return {
      ...chord,
      rootMidi,
      midiNotes,
      displayName: `${spellPitchClass(rootMidi, key.accidental)}${suffix}`,
    };
  });

export const uniquePitchClasses = (notes) =>
  [...new Set(notes.map((note) => ((note % 12) + 12) % 12))].sort((a, b) => a - b);

export const pitchClassSetsMatch = (required, played) => {
  const expected = uniquePitchClasses(required);
  const actual = uniquePitchClasses(played);
  return expected.length === actual.length && expected.every((pitch, index) => pitch === actual[index]);
};

export const generateKeyboard = (startMidi = 48, endMidi = 72) => {
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
