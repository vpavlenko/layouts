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
  let currentNote = 0 as ChromaticNote; // A
  let currentOctave = 2;

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

const createFifthsOnlyMapping = (): KeyboardMapping => {
  const mapping: KeyboardMapping = {};

  // Define rows of keys for fifths
  const keyRows = [
    [
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
    ], // Starting C1
    [
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
    ], // Starting C2
    [
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
    ], // Starting C3
    [
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
    ], // Starting C4
  ];

  keyRows.forEach((row, rowIndex) => {
    let currentNote = 0; // Start with C
    let currentOctave = rowIndex + 1; // Start octave based on row

    row.forEach((key) => {
      // Only map if we haven't exceeded C8
      if (currentOctave < 8 || (currentOctave === 8 && currentNote === 0)) {
        mapping[key] = {
          note: currentNote as ChromaticNote,
          octave: currentOctave,
        };

        // Move up a fifth (7 semitones)
        currentNote = (currentNote + 7) % 12;
        if (currentNote < 7) {
          currentOctave++;
        }
      }
    });
  });

  return mapping;
};

const createFourthsOnlyMapping = (): KeyboardMapping => {
  const mapping: KeyboardMapping = {};

  // Define rows of keys for fourths
  const keyRows = [
    [
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
    ], // Starting C1
    [
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
    ], // Starting C2
    [
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
    ], // Starting C3
    [
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
    ], // Starting C4
  ];

  keyRows.forEach((row, rowIndex) => {
    let currentNote = 0; // Start with C
    let currentOctave = rowIndex + 1; // Start octave based on row

    row.forEach((key) => {
      // Only map if we haven't exceeded C8
      if (currentOctave < 8 || (currentOctave === 8 && currentNote === 0)) {
        mapping[key] = {
          note: currentNote as ChromaticNote,
          octave: currentOctave,
        };

        // Move up a fourth (5 semitones)
        currentNote = (currentNote + 5) % 12;
        if (currentNote < 5) {
          currentOctave++;
        }
      }
    });
  });

  return mapping;
};

// Add this function before TASK_CONFIGS
const createAugmentedScalesMapping = (): KeyboardMapping => {
  const mapping: KeyboardMapping = {};

  // Define the rows of keys
  const keyRows = [
    // 1-= row (C-based augmented)
    [
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
    ],
    // q-] row (C#-based augmented)
    [
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
    ],
    // a-' row (D-based augmented)
    [
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
    ],
    // z-/ row (D#-based augmented)
    [
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
    ],
  ];

  // Root notes for each row (C, C#, D, D#)
  const rowRootNotes = [0, 1, 2, 3];

  // Create mapping for each row
  keyRows.forEach((row, rowIndex) => {
    const rootNote = rowRootNotes[rowIndex];

    row.forEach((key, keyIndex) => {
      // Calculate the note and octave
      const intervalSteps = Math.floor(keyIndex / 3); // How many complete augmented chords we've gone through
      const noteInChord = keyIndex % 3; // Position within current augmented chord (0, 1, or 2)
      const note = ((rootNote + noteInChord * 4) % 12) as ChromaticNote;
      const octave =
        2 + intervalSteps + Math.floor((rootNote + noteInChord * 4) / 12);

      mapping[key] = { note, octave };
    });
  });

  return mapping;
};

// Add this function before TASK_CONFIGS
const createPentatonicMapping = (): KeyboardMapping => {
  const mapping: KeyboardMapping = {};

  // Define the pentatonic scale notes (C, Eb, F, G, Bb)
  const pentatonicNotes: ChromaticNote[] = [0, 3, 5, 7, 10];

  // Define rows of keys for each octave
  const keyRows = [
    ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"], // Octave 1
    ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"], // Octave 2
    ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT"], // Octave 3
    ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"], // Octave 4
    ["KeyN", "KeyM", "Comma", "Period", "Slash"], // Octave 5
    ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon"], // Octave 6
    ["KeyY", "KeyU", "KeyI", "KeyO", "KeyP"], // Octave 7
  ];

  // Map each row to its corresponding octave
  keyRows.forEach((row, rowIndex) => {
    const octave = rowIndex + 1;
    row.forEach((key, noteIndex) => {
      mapping[key] = {
        note: pentatonicNotes[noteIndex],
        octave,
      };
    });
  });

  return mapping;
};

// Add these helper functions before createHirajoshiMapping
const parseNoteString = (
  noteStr: string
): { note: ChromaticNote; octave: number } => {
  const note = noteStr.replace(/[0-9]/g, "");
  const octave = parseInt(noteStr.match(/\d+/)?.[0] || "0");

  const noteMap: Record<string, ChromaticNote> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  return {
    note: noteMap[note] as ChromaticNote,
    octave,
  };
};

const KEYBOARD_ROWS = [
  [
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
  ],
  [
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
  ],
  [
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
  ],
  [
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
  ],
];

const processKeyboardString = (mappingStr: string): KeyboardMapping => {
  const mapping: KeyboardMapping = {};

  // Split into rows
  const rows = mappingStr.trim().split("\n");

  // Process each row
  rows.forEach((row, rowIndex) => {
    const notes = row.trim().split(/\s+/);
    const keyRow = KEYBOARD_ROWS[rowIndex];
    if (!keyRow) return;

    notes.forEach((noteStr, noteIndex) => {
      const key = keyRow[noteIndex];
      if (!key || noteStr === ".") return;

      mapping[key] = parseNoteString(noteStr);
    });
  });

  return mapping;
};

// Replace createHirajoshiMapping with this simpler version
const createHirajoshiMapping = (): KeyboardMapping => {
  const mappingString = `C4 C#4 F4 F#4 Bb4 C8 . . . . . Bb0
C3 C#3 F3 F#3 Bb3 C7 C#7 F7 F#7 Bb7
C2 C#2 F2 F#2 Bb2 C6 C#6 F6 F#6 Bb6
C1 C#1 F1 F#1 Bb1 C5 C#5 F5 F#5 Bb5`;

  return processKeyboardString(mappingString);
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
  {
    title: "Fifths Only",
    keyboardMapping: createFifthsOnlyMapping(),
    colorMode: "chromatic",
  },
  {
    title: "Fourths Only",
    keyboardMapping: createFourthsOnlyMapping(),
    colorMode: "chromatic",
  },
  {
    title: "Four Augmented Scales",
    keyboardMapping: createAugmentedScalesMapping(),
    colorMode: "chromatic",
  },
  {
    title: "Minor Pentatonic",
    keyboardMapping: createPentatonicMapping(),
    colorMode: "chromatic",
  },
  {
    title: "Hirajoshi Scale",
    keyboardMapping: createHirajoshiMapping(),
    colorMode: "chromatic",
  },
];
