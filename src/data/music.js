export const CHORD_FORMULAS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  diminished: [0, 3, 6],
  diminished7: [0, 3, 6, 9],
  minor7b5: [0, 3, 6, 10],
  augmented: [0, 4, 8],
  sus4: [0, 5, 7],
};

export const QUALITIES = [
  { value: 'major', label: 'Major', suffix: '' },
  { value: 'minor', label: 'Minor', suffix: 'm' },
  { value: 'major7', label: 'Maj 7', suffix: 'maj7' },
  { value: 'minor7', label: 'Min 7', suffix: 'm7' },
  { value: 'dominant7', label: 'Dom 7', suffix: '7' },
  { value: 'diminished', label: 'Dim', suffix: 'dim' },
  { value: 'diminished7', label: 'Dim 7', suffix: 'dim7' },
  { value: 'minor7b5', label: 'Min 7b5', suffix: 'm7♭5' },
  { value: 'augmented', label: 'Augmented', suffix: 'aug' },
  { value: 'sus4', label: 'Sus 4', suffix: 'sus4' },
];

export const SHARP_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

export const KEYS = [
  { label: 'C Major', offset: 0, name: 'C', accidental: 'sharp' },
  { label: 'D Major', offset: 2, name: 'D', accidental: 'sharp' },
  { label: 'E♭ Major', offset: 3, name: 'E♭', accidental: 'flat' },
  { label: 'F Major', offset: 5, name: 'F', accidental: 'flat' },
  { label: 'G Major', offset: 7, name: 'G', accidental: 'sharp' },
  { label: 'A Major', offset: 9, name: 'A', accidental: 'sharp' },
  { label: 'B♭ Major', offset: 10, name: 'B♭', accidental: 'flat' },
];

export const METERS = [
  { id: '4/4', numerator: 4, denominator: 4, label: '4/4' },
  { id: '3/4', numerator: 3, denominator: 4, label: '3/4' },
  { id: '6/8', numerator: 6, denominator: 8, label: '6/8' },
];

const preset = (id, name, access, prog, description) => ({ id, name, access, prog, description });

export const PROGRESSION_LIBRARY = {
  'Jazz / Bebop': [
    preset('jazz-basic-251', 'Basic ii–V–I', 'free', [
      { r: 2, q: 'minor7', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
      { r: 0, q: 'major7', beats: 8 },
    ], 'A foundational major-key cadence.'),
    preset('jazz-minor-251', 'Minor ii–V–i', 'jazz-pack', [
      { r: 2, q: 'minor7b5', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
      { r: 0, q: 'minor7', beats: 8 },
    ], 'Minor-key cadence with a half-diminished ii chord.'),
    preset('jazz-turnaround', 'I–vi–ii–V Turnaround', 'jazz-pack', [
      { r: 0, q: 'major7', beats: 2 },
      { r: 9, q: 'minor7', beats: 2 },
      { r: 2, q: 'minor7', beats: 2 },
      { r: 7, q: 'dominant7', beats: 2 },
    ], 'Compact turnaround used in jazz and traditional pop.'),
    preset('jazz-tritone', 'Tritone Substitute Resolve', 'jazz-pack', [
      { r: 2, q: 'minor7', beats: 4 },
      { r: 1, q: 'dominant7', beats: 4 },
      { r: 0, q: 'major7', beats: 8 },
    ], 'A chromatic dominant substitute resolving by half step.'),
  ],
  'Neo Soul / R&B': [
    preset('rnb-vi-ii', 'Classic vi–ii Vamp', 'neo-soul-pack', [
      { r: 9, q: 'minor7', beats: 8 },
      { r: 2, q: 'minor7', beats: 8 },
    ], 'A spacious two-chord minor vamp.'),
    preset('rnb-descending', 'Descending R&B', 'neo-soul-pack', [
      { r: 5, q: 'major7', beats: 4 },
      { r: 4, q: 'dominant7', beats: 4 },
      { r: 9, q: 'minor7', beats: 8 },
    ], 'Chromatic dominant movement into vi.'),
    preset('rnb-passing-dim', 'Passing Diminished', 'neo-soul-pack', [
      { r: 0, q: 'major7', beats: 4 },
      { r: 1, q: 'diminished7', beats: 4 },
      { r: 2, q: 'minor7', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
    ], 'A diminished passing chord links I to ii.'),
    preset('rnb-minor-color', 'Minor Color Vamp', 'neo-soul-pack', [
      { r: 0, q: 'minor7', beats: 4 },
      { r: 5, q: 'minor7', beats: 4 },
      { r: 10, q: 'major7', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
    ], 'Minor harmony with modal color and dominant tension.'),
  ],
  'Gospel / Soul': [
    preset('gospel-movement', 'I–iii–IV–V Movement', 'gospel-pack', [
      { r: 0, q: 'major', beats: 4 },
      { r: 4, q: 'minor7', beats: 4 },
      { r: 5, q: 'major7', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
    ], 'A familiar ascending gospel and soul movement.'),
    preset('gospel-3625', 'Soulful iii–VI–ii–V', 'gospel-pack', [
      { r: 4, q: 'minor7', beats: 4 },
      { r: 9, q: 'dominant7', beats: 4 },
      { r: 2, q: 'minor7', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
    ], 'Circle movement with secondary-dominant color.'),
    preset('gospel-plagal-color', 'I–I7–IV–iv Color Move', 'gospel-pack', [
      { r: 0, q: 'major', beats: 4 },
      { r: 0, q: 'dominant7', beats: 4 },
      { r: 5, q: 'major', beats: 4 },
      { r: 5, q: 'minor', beats: 4 },
      { r: 0, q: 'major', beats: 4 },
    ], 'Plagal color using a borrowed minor iv before resolution.'),
  ],
  'Funk / Fusion': [
    preset('funk-dorian', 'Dorian i7–IV7 Vamp', 'plus', [
      { r: 0, q: 'minor7', beats: 8 },
      { r: 5, q: 'dominant7', beats: 8 },
    ], 'A modal two-chord vamp for groove practice.'),
    preset('funk-chromatic', 'Chromatic Descent', 'plus', [
      { r: 9, q: 'minor7', beats: 4 },
      { r: 8, q: 'dominant7', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
      { r: 0, q: 'major7', beats: 4 },
    ], 'A colorful chromatic descent into the tonic.'),
  ],
  'Rock / Classic Rock': [
    preset('rock-145', 'Blues-Rock I–IV–I–V', 'free', [
      { r: 0, q: 'dominant7', beats: 4 },
      { r: 5, q: 'dominant7', beats: 4 },
      { r: 0, q: 'dominant7', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
    ], 'A short blues-rock phrase.'),
    preset('rock-descending', 'Descending Major Chords', 'plus', [
      { r: 0, q: 'major', beats: 4 },
      { r: 10, q: 'major', beats: 4 },
      { r: 8, q: 'major', beats: 4 },
      { r: 7, q: 'major', beats: 4 },
    ], 'A dramatic descending major-chord sequence.'),
    preset('rock-arena', 'Arena Rock vi–IV–I–V', 'plus', [
      { r: 9, q: 'minor', beats: 4 },
      { r: 5, q: 'major', beats: 4 },
      { r: 0, q: 'major', beats: 4 },
      { r: 7, q: 'major', beats: 4 },
    ], 'A high-energy pop-rock rotation.'),
  ],
  'Pop / Top 40': [
    preset('pop-four-chords', 'Four Chords of Pop', 'free', [
      { r: 0, q: 'major', beats: 4 },
      { r: 7, q: 'major', beats: 4 },
      { r: 9, q: 'minor', beats: 4 },
      { r: 5, q: 'major', beats: 4 },
    ], 'The common I–V–vi–IV rotation.'),
    preset('pop-doowop', '50s Doo-Wop', 'free', [
      { r: 0, q: 'major', beats: 4 },
      { r: 9, q: 'minor', beats: 4 },
      { r: 5, q: 'major', beats: 4 },
      { r: 7, q: 'major', beats: 4 },
    ], 'The I–vi–IV–V progression.'),
    preset('pop-melancholy', 'Melancholy IV–I–vi–V', 'plus', [
      { r: 5, q: 'major', beats: 4 },
      { r: 0, q: 'major', beats: 4 },
      { r: 9, q: 'minor', beats: 4 },
      { r: 7, q: 'major', beats: 4 },
    ], 'A reflective pop progression beginning on IV.'),
  ],
  'Country / Folk': [
    preset('country-145', 'Honky-Tonk I–I–IV–V', 'free', [
      { r: 0, q: 'major', beats: 4 },
      { r: 0, q: 'major', beats: 4 },
      { r: 5, q: 'major', beats: 4 },
      { r: 7, q: 'dominant7', beats: 4 },
    ], 'A simple country phrase for chord-change practice.'),
    preset('country-ballad', 'Country Ballad I–vi–IV–V', 'plus', [
      { r: 0, q: 'major', beats: 4 },
      { r: 9, q: 'minor', beats: 4 },
      { r: 5, q: 'major', beats: 4 },
      { r: 7, q: 'major', beats: 4 },
    ], 'A warm ballad progression.'),
  ],
  'Cinematic / Classical': [
    preset('cinematic-epic', 'Epic ♭VI–♭VII–i', 'cinematic-pack', [
      { r: 8, q: 'major', beats: 4 },
      { r: 10, q: 'major', beats: 4 },
      { r: 0, q: 'minor', beats: 8 },
    ], 'A broad minor-key cinematic cadence.'),
    preset('cinematic-requiem', 'Requiem i–♭VI–♭III–♭VII', 'cinematic-pack', [
      { r: 0, q: 'minor', beats: 4 },
      { r: 8, q: 'major', beats: 4 },
      { r: 3, q: 'major', beats: 4 },
      { r: 10, q: 'major', beats: 4 },
    ], 'A dark modal-minor sequence.'),
  ],
};

export const PACKS = [
  {
    id: 'jazz-pack',
    name: 'Jazz Cadences Pack',
    price: '$8.99',
    styles: ['Jazz / Bebop'],
    description: 'Minor cadences, turnarounds, and tritone substitutions.',
  },
  {
    id: 'neo-soul-pack',
    name: 'Neo-Soul Progressions Pack',
    price: '$9.99',
    styles: ['Neo Soul / R&B'],
    description: 'Colorful vamps, passing diminished movement, and R&B harmony.',
  },
  {
    id: 'gospel-pack',
    name: 'Gospel & Soul Movement Pack',
    price: '$9.99',
    styles: ['Gospel / Soul'],
    description: 'Walkups, turnarounds, plagal color, and dominant movement.',
  },
  {
    id: 'cinematic-pack',
    name: 'Cinematic Harmony Pack',
    price: '$6.99',
    styles: ['Cinematic / Classical'],
    description: 'Minor-key cadences for dramatic and cinematic practice.',
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
      'Basic imitation mode',
      'One editable progression',
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
      'MIDI keyboard input',
      'Unlimited custom progressions',
      'Metronome and multiple meters',
      'Practice history and cloud sync (backend-ready)',
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
      'Advanced voicings and adaptive drills (roadmap)',
      'Detailed performance analytics (roadmap)',
      'Export and educator tools (roadmap)',
    ],
  },
];
