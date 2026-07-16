export const CHORD_FORMULAS = {
  power5: [0, 7],
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  minorAdd9: [0, 3, 7, 14],
  major6: [0, 4, 7, 9],
  minor6: [0, 3, 7, 9],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  diminished7: [0, 3, 6, 9],
  minor7b5: [0, 3, 6, 10],
  dominant9: [0, 4, 7, 10, 14],
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
};

export const QUALITIES = [
  { value: 'power5', label: 'Power 5', suffix: '5' },
  { value: 'major', label: 'Major', suffix: '' },
  { value: 'minor', label: 'Minor', suffix: 'm' },
  { value: 'sus2', label: 'Sus 2', suffix: 'sus2' },
  { value: 'sus4', label: 'Sus 4', suffix: 'sus4' },
  { value: 'add9', label: 'Add 9', suffix: 'add9' },
  { value: 'minorAdd9', label: 'Minor Add 9', suffix: 'm(add9)' },
  { value: 'major6', label: 'Major 6', suffix: '6' },
  { value: 'minor6', label: 'Minor 6', suffix: 'm6' },
  { value: 'major7', label: 'Maj 7', suffix: 'maj7' },
  { value: 'minor7', label: 'Min 7', suffix: 'm7' },
  { value: 'dominant7', label: 'Dom 7', suffix: '7' },
  { value: 'major9', label: 'Maj 9', suffix: 'maj9' },
  { value: 'minor9', label: 'Min 9', suffix: 'm9' },
  { value: 'dominant9', label: 'Dom 9', suffix: '9' },
  { value: 'diminished', label: 'Dim', suffix: 'dim' },
  { value: 'diminished7', label: 'Dim 7', suffix: 'dim7' },
  { value: 'minor7b5', label: 'Min 7♭5', suffix: 'm7♭5' },
  { value: 'augmented', label: 'Augmented', suffix: 'aug' },
];

export const SHARP_NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const FLAT_NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

export const KEYS = [
  { label: 'C', offset: 0, name: 'C', accidental: 'sharp' },
  { label: 'D♭', offset: 1, name: 'D♭', accidental: 'flat' },
  { label: 'D', offset: 2, name: 'D', accidental: 'sharp' },
  { label: 'E♭', offset: 3, name: 'E♭', accidental: 'flat' },
  { label: 'E', offset: 4, name: 'E', accidental: 'sharp' },
  { label: 'F', offset: 5, name: 'F', accidental: 'flat' },
  { label: 'F♯', offset: 6, name: 'F♯', accidental: 'sharp' },
  { label: 'G', offset: 7, name: 'G', accidental: 'sharp' },
  { label: 'A♭', offset: 8, name: 'A♭', accidental: 'flat' },
  { label: 'A', offset: 9, name: 'A', accidental: 'sharp' },
  { label: 'B♭', offset: 10, name: 'B♭', accidental: 'flat' },
  { label: 'B', offset: 11, name: 'B', accidental: 'sharp' },
];

export const MODES = [
  { id: 'major', label: 'Major', scale: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'minor', label: 'Minor', scale: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'dorian', label: 'Dorian', scale: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'mixolydian', label: 'Mixolydian', scale: [0, 2, 4, 5, 7, 9, 10] },
];

export const METERS = [
  {
    id: '4/4', numerator: 4, denominator: 4, label: '4/4', unitsPerPulse: 1,
    pulseLabel: 'quarter note', accentPattern: [1, 0.35, 0.65, 0.35],
  },
  {
    id: '3/4', numerator: 3, denominator: 4, label: '3/4', unitsPerPulse: 1,
    pulseLabel: 'quarter note', accentPattern: [1, 0.35, 0.35],
  },
  {
    id: '6/8', numerator: 6, denominator: 8, label: '6/8', unitsPerPulse: 3,
    pulseLabel: 'dotted quarter', accentPattern: [1, 0.2, 0.2, 0.7, 0.2, 0.2],
  },
  {
    id: '12/8', numerator: 12, denominator: 8, label: '12/8', unitsPerPulse: 3,
    pulseLabel: 'dotted quarter', accentPattern: [1, 0.18, 0.18, 0.62, 0.18, 0.18, 0.72, 0.18, 0.18, 0.62, 0.18, 0.18],
  },
];

export const VOICING_PROFILES = [
  {
    id: 'right-hand', label: 'Right-Hand Chord', access: 'free',
    description: 'Chord tones in one comfortable right-hand position.',
  },
  {
    id: 'two-hand', label: 'Beginner Two-Hand', access: 'plus',
    description: 'Left-hand root and fifth with the chord in the right hand.',
  },
  {
    id: 'open-two-hand', label: 'Open Two-Hand', access: 'plus',
    description: 'A wider two-hand texture with reduced low-register doubling.',
  },
  {
    id: 'shell', label: 'Jazz Shell', access: 'pro',
    description: 'Root in the left hand with guide tones and extensions in the right.',
  },
];

export const EVALUATION_MODES = [
  {
    id: 'any-inversion', label: 'Chord Tones', access: 'free',
    description: 'Correct pitch classes in any octave or inversion.',
  },
  {
    id: 'root-in-bass', label: 'Root in Bass', access: 'plus',
    description: 'Correct chord tones with the root as the lowest note.',
  },
  {
    id: 'exact-voicing', label: 'Exact Voicing', access: 'pro',
    description: 'Match every displayed MIDI note exactly.',
  },
  {
    id: 'exact-hands', label: 'Exact Hands', access: 'pro',
    description: 'Match the displayed left- and right-hand note groups.',
  },
];

export const METRONOME_MODES = [
  { id: 'off', label: 'Off' },
  { id: 'count-in', label: 'Count-in only' },
  { id: 'full', label: 'Full playback' },
];

const preset = (id, name, access, prog, description, options = {}) => ({
  id,
  name,
  access,
  prog,
  description,
  mode: options.mode ?? 'major',
  meterId: options.meterId ?? '4/4',
  defaultTempo: options.defaultTempo ?? 90,
  feel: options.feel ?? 'Straight',
  voicingId: options.voicingId ?? 'right-hand',
  theoryFocus: options.theoryFocus ?? '',
});

export const PROGRESSION_LIBRARY = {
  'Jazz / Bebop': [
    preset('jazz-basic-251', 'Basic ii–V–I', 'free', [
      { r: 2, q: 'minor7', beats: 4, numeral: 'ii7' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
      { r: 0, q: 'major7', beats: 8, numeral: 'Imaj7' },
    ], 'A foundational major-key cadence.', { defaultTempo: 110, feel: 'Swing', theoryFocus: 'Dominant resolution' }),
    preset('jazz-minor-251', 'Minor iiø–V–i', 'jazz-pack', [
      { r: 2, q: 'minor7b5', beats: 4, numeral: 'iiø7' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
      { r: 0, q: 'minor7', beats: 8, numeral: 'i7' },
    ], 'Minor-key cadence with a half-diminished ii chord.', { mode: 'minor', defaultTempo: 95, feel: 'Swing', voicingId: 'shell', theoryFocus: 'Minor dominant resolution' }),
    preset('jazz-turnaround', 'I–vi–ii–V Turnaround', 'jazz-pack', [
      { r: 0, q: 'major7', beats: 2, numeral: 'Imaj7' },
      { r: 9, q: 'minor7', beats: 2, numeral: 'vi7' },
      { r: 2, q: 'minor7', beats: 2, numeral: 'ii7' },
      { r: 7, q: 'dominant7', beats: 2, numeral: 'V7' },
    ], 'Compact turnaround used in jazz and traditional pop.', { defaultTempo: 130, feel: 'Swing', theoryFocus: 'Circle movement' }),
    preset('jazz-tritone', 'Tritone Substitute Resolve', 'jazz-pack', [
      { r: 2, q: 'minor7', beats: 4, numeral: 'ii7' },
      { r: 1, q: 'dominant7', beats: 4, numeral: '♭II7' },
      { r: 0, q: 'major7', beats: 8, numeral: 'Imaj7' },
    ], 'A chromatic dominant substitute resolving by half step.', { defaultTempo: 105, feel: 'Swing', theoryFocus: 'Tritone substitution' }),
  ],
  'Neo Soul / R&B': [
    preset('rnb-vi-ii', 'Classic vi–ii Vamp', 'neo-soul-pack', [
      { r: 9, q: 'minor9', beats: 8, numeral: 'vi9' },
      { r: 2, q: 'minor9', beats: 8, numeral: 'ii9' },
    ], 'A spacious two-chord minor vamp.', { defaultTempo: 74, feel: 'Laid-back', voicingId: 'open-two-hand', theoryFocus: 'Extended minor harmony' }),
    preset('rnb-descending', 'Descending R&B', 'neo-soul-pack', [
      { r: 5, q: 'major9', beats: 4, numeral: 'IVmaj9' },
      { r: 4, q: 'dominant9', beats: 4, numeral: 'III9' },
      { r: 9, q: 'minor9', beats: 8, numeral: 'vi9' },
    ], 'Chromatic dominant movement into vi.', { defaultTempo: 76, feel: 'Pocket', voicingId: 'open-two-hand', theoryFocus: 'Chromatic dominant approach' }),
    preset('rnb-passing-dim', 'Passing Diminished', 'neo-soul-pack', [
      { r: 0, q: 'major9', beats: 4, numeral: 'Imaj9' },
      { r: 1, q: 'diminished7', beats: 4, numeral: '♯I°7' },
      { r: 2, q: 'minor9', beats: 4, numeral: 'ii9' },
      { r: 7, q: 'dominant9', beats: 4, numeral: 'V9' },
    ], 'A diminished passing chord links I to ii.', { defaultTempo: 82, feel: 'Pocket', voicingId: 'open-two-hand', theoryFocus: 'Chromatic passing harmony' }),
    preset('rnb-minor-color', 'Minor Color Vamp', 'neo-soul-pack', [
      { r: 0, q: 'minor9', beats: 4, numeral: 'i9' },
      { r: 5, q: 'minor9', beats: 4, numeral: 'iv9' },
      { r: 10, q: 'major9', beats: 4, numeral: '♭VIImaj9' },
      { r: 7, q: 'dominant9', beats: 4, numeral: 'V9' },
    ], 'Minor harmony with modal color and dominant tension.', { mode: 'minor', defaultTempo: 72, feel: 'Laid-back', voicingId: 'open-two-hand', theoryFocus: 'Modal color' }),
  ],
  'Gospel / Soul': [
    preset('gospel-movement', 'I–iii–IV–V Movement', 'gospel-pack', [
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 4, q: 'minor7', beats: 4, numeral: 'iii7' },
      { r: 5, q: 'major7', beats: 4, numeral: 'IVmaj7' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
    ], 'A familiar ascending gospel and soul movement.', { defaultTempo: 88, feel: 'Soul', voicingId: 'two-hand', theoryFocus: 'Diatonic movement' }),
    preset('gospel-3625', 'Soulful iii–VI–ii–V', 'gospel-pack', [
      { r: 4, q: 'minor7', beats: 4, numeral: 'iii7' },
      { r: 9, q: 'dominant7', beats: 4, numeral: 'VI7' },
      { r: 2, q: 'minor7', beats: 4, numeral: 'ii7' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
    ], 'Circle movement with secondary-dominant color.', { defaultTempo: 92, feel: 'Soul', voicingId: 'two-hand', theoryFocus: 'Secondary dominant' }),
    preset('gospel-plagal-color', 'I–I7–IV–iv–I Color Move', 'gospel-pack', [
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 0, q: 'dominant7', beats: 4, numeral: 'I7' },
      { r: 5, q: 'major', beats: 4, numeral: 'IV' },
      { r: 5, q: 'minor', beats: 4, numeral: 'iv' },
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
    ], 'Plagal color using a borrowed minor iv before resolution.', { defaultTempo: 76, feel: 'Gospel ballad', voicingId: 'two-hand', theoryFocus: 'Borrowed minor iv' }),
    preset('gospel-68', '6/8 Worship Ballad I–V–vi–IV', 'plus', [
      { r: 0, q: 'add9', beats: 6, numeral: 'Iadd9' },
      { r: 7, q: 'major', beats: 6, numeral: 'V' },
      { r: 9, q: 'minor7', beats: 6, numeral: 'vi7' },
      { r: 5, q: 'add9', beats: 6, numeral: 'IVadd9' },
    ], 'A broad 6/8 worship and gospel-ballad progression.', { meterId: '6/8', defaultTempo: 72, feel: '6/8 ballad', voicingId: 'two-hand', theoryFocus: 'Compound-meter phrasing' }),
  ],
  'Funk / Fusion': [
    preset('funk-dorian', 'Dorian i7–IV7 Vamp', 'plus', [
      { r: 0, q: 'minor7', beats: 8, numeral: 'i7' },
      { r: 5, q: 'dominant7', beats: 8, numeral: 'IV7' },
    ], 'A modal two-chord vamp for groove practice.', { mode: 'dorian', defaultTempo: 104, feel: 'Syncopated', theoryFocus: 'Dorian mode' }),
    preset('funk-chromatic', 'Chromatic Descent', 'plus', [
      { r: 9, q: 'minor7', beats: 4, numeral: 'vi7' },
      { r: 8, q: 'dominant7', beats: 4, numeral: '♭VI7' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
      { r: 0, q: 'major7', beats: 4, numeral: 'Imaj7' },
    ], 'A colorful chromatic descent into the tonic.', { defaultTempo: 108, feel: 'Fusion', theoryFocus: 'Chromatic planing' }),
  ],
  'Rock / Classic Rock': [
    preset('rock-145', 'Blues-Rock I–IV–I–V', 'free', [
      { r: 0, q: 'dominant7', beats: 4, numeral: 'I7' },
      { r: 5, q: 'dominant7', beats: 4, numeral: 'IV7' },
      { r: 0, q: 'dominant7', beats: 4, numeral: 'I7' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
    ], 'A short blues-rock phrase.', { mode: 'mixolydian', defaultTempo: 112, feel: 'Straight eighths', theoryFocus: 'Dominant blues harmony' }),
    preset('rock-12bar', '12-Bar Blues', 'plus', [
      { r: 0, q: 'dominant7', beats: 16, numeral: 'I7 ×4' },
      { r: 5, q: 'dominant7', beats: 8, numeral: 'IV7 ×2' },
      { r: 0, q: 'dominant7', beats: 8, numeral: 'I7 ×2' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
      { r: 5, q: 'dominant7', beats: 4, numeral: 'IV7' },
      { r: 0, q: 'dominant7', beats: 8, numeral: 'I7 ×2' },
    ], 'The complete twelve-measure blues form grouped by harmonic region.', { mode: 'mixolydian', defaultTempo: 105, feel: 'Shuffle', theoryFocus: 'Twelve-bar form' }),
    preset('rock-descending', 'Descending Major Chords', 'plus', [
      { r: 0, q: 'power5', beats: 4, numeral: 'I5' },
      { r: 10, q: 'power5', beats: 4, numeral: '♭VII5' },
      { r: 8, q: 'power5', beats: 4, numeral: '♭VI5' },
      { r: 7, q: 'power5', beats: 4, numeral: 'V5' },
    ], 'A dramatic descending power-chord sequence.', { mode: 'minor', defaultTempo: 120, feel: 'Driving eighths', theoryFocus: 'Power-chord descent' }),
    preset('rock-arena', 'Arena Rock vi–IV–I–V', 'plus', [
      { r: 9, q: 'minor', beats: 4, numeral: 'vi' },
      { r: 5, q: 'major', beats: 4, numeral: 'IV' },
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 7, q: 'major', beats: 4, numeral: 'V' },
    ], 'A high-energy pop-rock rotation.', { defaultTempo: 118, feel: 'Driving', theoryFocus: 'Pop-rock rotation' }),
  ],
  'Pop / Top 40': [
    preset('pop-four-chords', 'Four Chords of Pop', 'free', [
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 7, q: 'major', beats: 4, numeral: 'V' },
      { r: 9, q: 'minor', beats: 4, numeral: 'vi' },
      { r: 5, q: 'major', beats: 4, numeral: 'IV' },
    ], 'The common I–V–vi–IV rotation.', { defaultTempo: 96, feel: 'Straight', theoryFocus: 'Diatonic pop harmony' }),
    preset('pop-doowop', '50s Doo-Wop', 'free', [
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 9, q: 'minor', beats: 4, numeral: 'vi' },
      { r: 5, q: 'major', beats: 4, numeral: 'IV' },
      { r: 7, q: 'major', beats: 4, numeral: 'V' },
    ], 'The I–vi–IV–V progression.', { defaultTempo: 84, feel: 'Triplet ballad', theoryFocus: 'Doo-wop turnaround' }),
    preset('pop-melancholy', 'Melancholy IV–I–vi–V', 'plus', [
      { r: 5, q: 'major', beats: 4, numeral: 'IV' },
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 9, q: 'minor', beats: 4, numeral: 'vi' },
      { r: 7, q: 'major', beats: 4, numeral: 'V' },
    ], 'A reflective pop progression beginning on IV.', { defaultTempo: 82, feel: 'Ballad', theoryFocus: 'Tonic delay' }),
  ],
  'Country / Folk': [
    preset('country-145', 'Honky-Tonk I–I–IV–V', 'free', [
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 5, q: 'major', beats: 4, numeral: 'IV' },
      { r: 7, q: 'dominant7', beats: 4, numeral: 'V7' },
    ], 'A simple country phrase for chord-change practice.', { defaultTempo: 116, feel: 'Boom-chick', theoryFocus: 'Primary chords' }),
    preset('country-ballad', 'Country Ballad I–vi–IV–V', 'plus', [
      { r: 0, q: 'major', beats: 4, numeral: 'I' },
      { r: 9, q: 'minor', beats: 4, numeral: 'vi' },
      { r: 5, q: 'major', beats: 4, numeral: 'IV' },
      { r: 7, q: 'major', beats: 4, numeral: 'V' },
    ], 'A warm ballad progression.', { defaultTempo: 76, feel: 'Country ballad', theoryFocus: 'Diatonic contrast' }),
    preset('folk-waltz', 'Folk Waltz I–IV–V–I', 'plus', [
      { r: 0, q: 'major', beats: 3, numeral: 'I' },
      { r: 5, q: 'major', beats: 3, numeral: 'IV' },
      { r: 7, q: 'dominant7', beats: 3, numeral: 'V7' },
      { r: 0, q: 'major', beats: 3, numeral: 'I' },
    ], 'A one-chord-per-measure progression in triple meter.', { meterId: '3/4', defaultTempo: 92, feel: 'Waltz', theoryFocus: 'Triple-meter cadence' }),
  ],
  'Cinematic / Classical': [
    preset('cinematic-epic', 'Epic ♭VI–♭VII–i', 'cinematic-pack', [
      { r: 8, q: 'major', beats: 4, numeral: '♭VI' },
      { r: 10, q: 'major', beats: 4, numeral: '♭VII' },
      { r: 0, q: 'minor', beats: 8, numeral: 'i' },
    ], 'A broad minor-key cinematic cadence.', { mode: 'minor', defaultTempo: 82, feel: 'Cinematic', voicingId: 'open-two-hand', theoryFocus: 'Modal-minor cadence' }),
    preset('cinematic-requiem', 'Requiem i–♭VI–♭III–♭VII', 'cinematic-pack', [
      { r: 0, q: 'minor', beats: 4, numeral: 'i' },
      { r: 8, q: 'major', beats: 4, numeral: '♭VI' },
      { r: 3, q: 'major', beats: 4, numeral: '♭III' },
      { r: 10, q: 'major', beats: 4, numeral: '♭VII' },
    ], 'A dark modal-minor sequence.', { mode: 'minor', defaultTempo: 68, feel: 'Slow cinematic', voicingId: 'open-two-hand', theoryFocus: 'Modal mixture' }),
  ],
};

export const PACKS = [
  {
    id: 'jazz-pack',
    name: 'Jazz Cadences Pack',
    price: '$8.99',
    styles: ['Jazz / Bebop'],
    description: 'Minor cadences, turnarounds, tritone substitutions, shell voicing guidance, and swing-oriented drills.',
  },
  {
    id: 'neo-soul-pack',
    name: 'Neo-Soul Progressions Pack',
    price: '$9.99',
    styles: ['Neo Soul / R&B'],
    description: 'Extended harmony, colorful vamps, passing diminished movement, and open two-hand voicings.',
  },
  {
    id: 'gospel-pack',
    name: 'Gospel & Soul Movement Pack',
    price: '$9.99',
    styles: ['Gospel / Soul'],
    description: 'Walkups, turnarounds, plagal color, dominant movement, and two-hand practice.',
  },
  {
    id: 'cinematic-pack',
    name: 'Cinematic Harmony Pack',
    price: '$6.99',
    styles: ['Cinematic / Classical'],
    description: 'Minor-key cadences, modal color, and wide-register voicings for dramatic practice.',
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: '$0',
    annual: '$0',
    tagline: 'Learn the core workflow.',
    features: [
      'Selected starter progressions',
      'Virtual keyboard and demo playback',
      'Chord-tone imitation mode',
      'One saved custom progression',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    monthly: '$6.99/mo',
    annual: '$59.99/yr',
    tagline: 'Practice without limits.',
    features: [
      'All standard progression libraries',
      'MIDI keyboard input and sustain pedal',
      'Unlimited saved custom progressions',
      'Two-hand voicings, metronome, count-in, and multiple meters',
      'Root-in-bass evaluation',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: '$12.99/mo',
    annual: '$99.99/yr',
    tagline: 'Advanced learning and creation.',
    features: [
      'Everything in Plus',
      'All premium packs included',
      'Jazz shell and exact-hand voicing drills',
      'Exact-voicing evaluation and diagnostic feedback',
      'Advanced analytics, export, and educator tools (roadmap)',
    ],
  },
];
