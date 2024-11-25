import { ColorMode } from "../components/types";
import {
  FLAT_CHROMATIC_KEYBOARD_MAP,
  KeyboardMapping,
  TRADITIONAL_KEYBOARD_MAP,
} from "../constants/keyboard";

export const createSequenceKeyboardMapping = (
  sequence: Array<{ note: number; octave: number }>,
  keys: string[]
): KeyboardMapping => {
  const mapping: KeyboardMapping = {};
  sequence.forEach(({ note, octave }, index) => {
    if (index < keys.length) {
      mapping[keys[index]] = { note, octave };
    }
  });
  return mapping;
};

export type ChromaticNote = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type TaskId = number;

export interface TaskConfig {
  title: string;
  keyboardMapping: KeyboardMapping;
  colorMode: ColorMode;
}

// First, let's create a type for our key mappings
export type NoteMapping = {
  note: ChromaticNote;
  octave: number;
  keys: string[]; // Array of keys that can trigger this note
};

// Create a function to generate both keyboard mapping and key display
export const createNoteMapping = (
  note: ChromaticNote,
  keys: [string, string, string, string] // Four keys for four octaves
): NoteMapping => ({
  note,
  octave: 0, // Base octave, will be adjusted in usage
  keys,
});

// Define our note mappings centrally
export const NOTE_MAPPINGS = {
  C: createNoteMapping(0, ["KeyZ", "KeyA", "KeyQ", "Digit1"]),
  D: createNoteMapping(2, ["KeyX", "KeyS", "KeyW", "Digit2"]),
  E: createNoteMapping(4, ["KeyC", "KeyD", "KeyE", "Digit3"]),
  F: createNoteMapping(5, ["KeyV", "KeyF", "KeyR", "Digit4"]),
  G: createNoteMapping(7, ["KeyB", "KeyG", "KeyT", "Digit5"]),
  A: createNoteMapping(9, ["KeyN", "KeyH", "KeyY", "Digit6"]),
  B: createNoteMapping(11, ["KeyM", "KeyJ", "KeyU", "Digit7"]),
} as const;

// Add new type for sequence checking
export type NoteInSequence = {
  note: ChromaticNote;
  octave: number;
};

// Create the ascending sequence starting from A0
const createAscendingChromaticSequence = (): NoteInSequence[] => {
  const sequence: NoteInSequence[] = [];
  let currentNote = 9 as ChromaticNote; // A
  let currentOctave = 0;

  while (!(currentNote === 0 && currentOctave === 8)) {
    sequence.push({ note: currentNote, octave: currentOctave });

    // Move to next note
    const nextNote = (currentNote + 1) % 12;
    currentNote = nextNote as ChromaticNote;
    if (nextNote === 0) {
      currentOctave++;
    }
  }

  // Add final C8
  sequence.push({ note: 0 as ChromaticNote, octave: 8 });

  return sequence;
};

// Create the ascending and descending sequences
const ascendingSequence = createAscendingChromaticSequence();

// Define key sequence for ascending (left to right)
const ASCENDING_KEY_SEQUENCE = [
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "Comma",
  "Period",
  "Slash",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "Semicolon",
  "Quote",
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",
  "KeyY",
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",
  "BracketLeft",
  "BracketRight",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "Minus",
  "Equal",
];

// Add helper function to create sequences with intervals
const createIntervalSequence = (
  startNote: ChromaticNote,
  startOctave: number,
  interval: number
): NoteInSequence[] => {
  const sequence: NoteInSequence[] = [];
  let currentNote = startNote;
  let currentOctave = startOctave;

  // Add safety limit to prevent infinite loops
  const maxLength = 100; // Reasonable maximum length

  while (sequence.length < maxLength && currentOctave < 8) {
    sequence.push({ note: currentNote, octave: currentOctave });

    // Calculate next note and octave
    let nextNote = currentNote + interval;
    let nextOctave = currentOctave;

    // If we cross over 11, we need to adjust both note and octave
    if (nextNote > 11) {
      nextNote = nextNote % 12;
      nextOctave++;
    }

    currentNote = nextNote as ChromaticNote;
    currentOctave = nextOctave;

    // Break if we reach or exceed C8
    if (currentOctave >= 8) {
      break;
    }
  }

  return sequence;
};

const majorSecondFromASharp0Sequence = createIntervalSequence(
  10 as ChromaticNote,
  0,
  2
); // Start from A#0

// Create keyboard mappings for the sequences
const createFlatChromaticMapping = (
  sequence: Array<{ note: number; octave: number }>
): KeyboardMapping => {
  const mapping: KeyboardMapping = {};
  const keySequence = [
    // Bottom row
    "KeyZ",
    "KeyX",
    "KeyC",
    "KeyV",
    "KeyB",
    "KeyN",
    "KeyM",
    "Comma",
    "Period",
    "Slash",
    // Middle row
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyF",
    "KeyG",
    "KeyH",
    "KeyJ",
    "KeyK",
    "KeyL",
    "Semicolon",
    "Quote",
    // Top row
    "KeyQ",
    "KeyW",
    "KeyE",
    "KeyR",
    "KeyT",
    "KeyY",
    "KeyU",
    "KeyI",
    "KeyO",
    "KeyP",
    "BracketLeft",
    "BracketRight",
    // Number row
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9",
    "Digit0",
    "Minus",
    "Equal",
  ];

  sequence.forEach(({ note, octave }, index) => {
    if (index < keySequence.length) {
      mapping[keySequence[index]] = { note, octave };
    }
  });

  return mapping;
};

// First define the scale sequences
const SCALE_SEQUENCES = {
  lydian: {
    notes: [
      { note: 0, octave: 2 }, // C
      { note: 2, octave: 2 }, // D
      { note: 4, octave: 2 }, // E
      { note: 6, octave: 2 }, // F#
      { note: 7, octave: 2 }, // G
      { note: 9, octave: 2 }, // A
      { note: 11, octave: 2 }, // B
      { note: 0, octave: 3 }, // C (preview of next scale)
    ],
    keys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "KeyA"],
  },
  major: {
    notes: [
      { note: 0, octave: 3 }, // C
      { note: 2, octave: 3 }, // D
      { note: 4, octave: 3 }, // E
      { note: 5, octave: 3 }, // F
      { note: 7, octave: 3 }, // G
      { note: 9, octave: 3 }, // A
      { note: 11, octave: 3 }, // B
      { note: 0, octave: 4 }, // C (preview of next scale)
    ],
    keys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyQ"],
  },
  mixolydian: {
    notes: [
      { note: 0, octave: 4 }, // C
      { note: 2, octave: 4 }, // D
      { note: 4, octave: 4 }, // E
      { note: 5, octave: 4 }, // F
      { note: 7, octave: 4 }, // G
      { note: 9, octave: 4 }, // A
      { note: 10, octave: 4 }, // Bb
      { note: 0, octave: 5 }, // C (preview of next scale)
    ],
    keys: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "Digit1"],
  },
  dorian: {
    notes: [
      { note: 0, octave: 5 }, // C
      { note: 2, octave: 5 }, // D
      { note: 3, octave: 5 }, // Eb
      { note: 5, octave: 5 }, // F
      { note: 7, octave: 5 }, // G
      { note: 9, octave: 5 }, // A
      { note: 10, octave: 5 }, // Bb
      { note: 0, octave: 6 }, // C (final)
    ],
    keys: [
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
      "Digit5",
      "Digit6",
      "Digit7",
      "Digit8",
    ],
  },
  dorianLow: {
    notes: [
      { note: 0, octave: 2 }, // C
      { note: 2, octave: 2 }, // D
      { note: 3, octave: 2 }, // Eb
      { note: 5, octave: 2 }, // F
      { note: 7, octave: 2 }, // G
      { note: 9, octave: 2 }, // A
      { note: 10, octave: 2 }, // Bb
      { note: 0, octave: 3 }, // C (preview of next scale)
    ],
    keys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "KeyA"],
  },
  minor: {
    notes: [
      { note: 0, octave: 3 }, // C
      { note: 2, octave: 3 }, // D
      { note: 3, octave: 3 }, // Eb
      { note: 5, octave: 3 }, // F
      { note: 7, octave: 3 }, // G
      { note: 8, octave: 3 }, // Ab
      { note: 10, octave: 3 }, // Bb
      { note: 0, octave: 4 }, // C (preview of next scale)
    ],
    keys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyQ"],
  },
  phrygian: {
    notes: [
      { note: 0, octave: 4 }, // C
      { note: 1, octave: 4 }, // Db
      { note: 3, octave: 4 }, // Eb
      { note: 5, octave: 4 }, // F
      { note: 7, octave: 4 }, // G
      { note: 8, octave: 4 }, // Ab
      { note: 10, octave: 4 }, // Bb
      { note: 0, octave: 5 }, // C (preview of next scale)
    ],
    keys: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "Digit1"],
  },
  locrian: {
    notes: [
      { note: 0, octave: 5 }, // C
      { note: 1, octave: 5 }, // Db
      { note: 3, octave: 5 }, // Eb
      { note: 5, octave: 5 }, // F
      { note: 6, octave: 5 }, // Gb
      { note: 8, octave: 5 }, // Ab
      { note: 10, octave: 5 }, // Bb
      { note: 0, octave: 6 }, // C (final)
    ],
    keys: [
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
      "Digit5",
      "Digit6",
      "Digit7",
      "Digit8",
    ],
  },
} as const;

// Helper to create cumulative keyboard mapping from scale definitions
const createScaleKeyboardMapping = (
  currentScale: (typeof SCALE_SEQUENCES)[keyof typeof SCALE_SEQUENCES],
  previousScales: Array<keyof typeof SCALE_SEQUENCES> = []
): KeyboardMapping => {
  const mapping: KeyboardMapping = {};

  // Add mappings from previous scales first
  previousScales.forEach((scaleName) => {
    const scale = SCALE_SEQUENCES[scaleName];
    scale.notes.slice(0, -1).forEach(({ note, octave }, index) => {
      // Exclude the last C
      mapping[scale.keys[index]] = { note, octave };
    });
  });

  // Add current scale's mappings
  currentScale.notes.forEach(({ note, octave }, index) => {
    mapping[currentScale.keys[index]] = { note, octave };
  });

  return mapping;
};

// Add this before TASK_CONFIGS
const createTonicChordMapping = (): KeyboardMapping => {
  const mapping: KeyboardMapping = {};

  // Map G notes (G1-G7)
  ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU"].forEach(
    (key, index) => {
      mapping[key] = { note: 7, octave: index + 1 };
    }
  );

  // Map C notes (C1-C8)
  ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK"].forEach(
    (key, index) => {
      mapping[key] = { note: 0, octave: index + 1 };
    }
  );

  // Map E notes (E1-E7)
  [
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
  ].forEach((key, index) => {
    mapping[key] = { note: 4, octave: index + 1 };
  });

  // Map Eb notes (Eb1-Eb7)
  ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM"].forEach(
    (key, index) => {
      mapping[key] = { note: 3, octave: index + 1 };
    }
  );

  return mapping;
};

// Remove the createTaskConfig function and directly define TASK_CONFIGS
export const TASK_CONFIGS: TaskConfig[] = [
  {
    title: "White Keys",
    keyboardMapping: (() => {
      const fullMapping: KeyboardMapping = {};
      const whiteKeyMappings = [
        NOTE_MAPPINGS.C,
        NOTE_MAPPINGS.D,
        NOTE_MAPPINGS.E,
        NOTE_MAPPINGS.F,
        NOTE_MAPPINGS.G,
        NOTE_MAPPINGS.A,
        NOTE_MAPPINGS.B,
      ];

      whiteKeyMappings.forEach((noteMapping) => {
        noteMapping.keys.forEach((key, octaveOffset) => {
          fullMapping[key] = {
            note: noteMapping.note,
            octave: octaveOffset + 2,
          };
        });
      });

      return fullMapping;
    })(),
    colorMode: "chromatic",
  },
  {
    title: "Chromatic Sequences",
    keyboardMapping: createSequenceKeyboardMapping(
      ascendingSequence,
      ASCENDING_KEY_SEQUENCE
    ),
    colorMode: "flat-chromatic",
  },
  {
    title: "Major Seconds from A#0",
    keyboardMapping: createFlatChromaticMapping(majorSecondFromASharp0Sequence),
    colorMode: "flat-chromatic",
  },
  {
    title: "Dorian Scale",
    keyboardMapping: createScaleKeyboardMapping(SCALE_SEQUENCES.dorian, [
      "lydian",
      "major",
      "mixolydian",
    ]),
    colorMode: "chromatic",
  },
  {
    title: "Locrian Scale",
    keyboardMapping: createScaleKeyboardMapping(SCALE_SEQUENCES.locrian, [
      "dorianLow",
      "minor",
      "phrygian",
    ]),
    colorMode: "chromatic",
  },
  {
    title: "Traditional Layout",
    keyboardMapping: TRADITIONAL_KEYBOARD_MAP,
    colorMode: "chromatic",
  },
  {
    title: "Flat Chromatic Layout",
    keyboardMapping: FLAT_CHROMATIC_KEYBOARD_MAP,
    colorMode: "flat-chromatic",
  },
  {
    title: "Major/minor Tonic Chord",
    keyboardMapping: createTonicChordMapping(),
    colorMode: "chromatic",
  },
];
