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

// Add these helper functions before creating mappings
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

// Create the ascending chromatic mapping
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

// Replace createTonicChordMapping with this version
const createTonicChordMapping = (): KeyboardMapping => {
  const mappingString = `E1 E2 E3 E4 E5 E6 E7 . . . . .
G1 G2 G3 G4 G5 G6 G7 . . . . .
C1 C2 C3 C4 C5 C6 C7 C8 . . .
Eb1 Eb2 Eb3 Eb4 Eb5 Eb6 Eb7 . . .`;

  return processKeyboardString(mappingString);
};

// Replace createFifthsOnlyMapping with this version
const createFifthsOnlyMapping = (): KeyboardMapping => {
  const mappingString = `
C1 G1 D2 A2 E3 B3 F#4 C#5 G#5 D#6 A#6 F7
C2 G2 D3 A3 E4 B4 F#5 C#6 G#6 D#7 A#7 F8
C3 G3 D4 A4 E5 B5 F#6 C#7 G#7 D#8 A#8 .
C4 G4 D5 A5 E6 B6 F#7 C#8 . . . .`;

  return processKeyboardString(mappingString);
};

// Replace createFourthsOnlyMapping with this version
const createFourthsOnlyMapping = (): KeyboardMapping => {
  const mappingString = `
C1 F1 Bb1 Eb2 Ab2 Db3 Gb3 B3 E4 A4 D5 G5
C2 F2 Bb2 Eb3 Ab3 Db4 Gb4 B4 E5 A5 D6 G6
C3 F3 Bb3 Eb4 Ab4 Db5 Gb5 B5 E6 A6 D7 G7
C4 F4 Bb4 Eb5 Ab5 Db6 Gb6 B6 E7 A7 D8 G8`;

  return processKeyboardString(mappingString);
};

// Replace createAugmentedScalesMapping with this version
const createAugmentedScalesMapping = (): KeyboardMapping => {
  const mappingString = `
C2 E2 G#2 C3 E3 G#3 C4 E4 G#4 C5 E5 G#5
C#2 F2 A2 C#3 F3 A3 C#4 F4 A4 C#5 F5 A5
D2 F#2 A#2 D3 F#3 A#3 D4 F#4 A#4 D5 F#5 A#5
D#2 G2 B2 D#3 G3 B3 D#4 G4 B4 D#5 G5 B5`;

  return processKeyboardString(mappingString);
};

// Replace createPentatonicMapping with this version
const createPentatonicMapping = (): KeyboardMapping => {
  const mappingString = `C4 Eb4 F4 G4 Bb4 . . . . . . .
C3 Eb3 F3 G3 Bb3 C7 Eb7 F7 G7 Bb7 . .
C2 Eb2 F2 G2 Bb2 C6 Eb6 F6 G6 Bb6 .
C1 Eb1 F1 G1 Bb1 C5 Eb5 F5 G5 Bb5`;

  return processKeyboardString(mappingString);
};

// Replace createHirajoshiMapping with this version
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
