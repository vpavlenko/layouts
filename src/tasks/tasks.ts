import { ColorMode } from "../components/types";
import { KeyboardMapping } from "../constants/keyboard";

export type ChromaticNote = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type TaskId = number;

export interface TaskConfig {
  title: string;
  slug: string;
  keyboardMapping: KeyboardMapping;
  colorMode: ColorMode;
}

// First, let's create a type for our key mappings
export type NoteMapping = {
  note: ChromaticNote;
  octave: number;
  keys: string[]; // Array of keys that can trigger this note
};

// Add new type for sequence checking
export type NoteInSequence = {
  note: ChromaticNote;
  octave: number;
};

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

// Add a helper type for the internal task config format
type InternalTaskConfig = {
  keyboardMapping: string | KeyboardMapping;
  colorMode?: ColorMode; // Make optional since we'll default to "chromatic"
};

// Add a template literal tag function for keyboard mappings
export function keyboard(strings: TemplateStringsArray): KeyboardMapping {
  return processKeyboardString(strings[0]);
}

// Define tasks with a more concise format
const INTERNAL_TASKS: Record<string, InternalTaskConfig> = {
  "White Keys": {
    keyboardMapping: keyboard`
      C5 D5 E5 F5 G5 A5 B5 C6 D6 E6 F6 G6
      C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5
      C3 D3 E3 F3 G3 A3 B3 C4 D4 E4 F4
      C2 D2 E2 F2 G2 A2 B2 C3 D3 E3
    `,
  },

  "Minor Scale": {
    keyboardMapping: keyboard`
    G1 Ab1 Bb1 C2 D2 Eb2 F2 G2 Ab2 B2 C3 D3
    G2 Ab2 Bb2 C3 D3 Eb3 F3 G3 Ab3 B3 C4 D4
    G3 Ab3 Bb3 C4 D4 Eb4 F4 G4 Ab4 B4 C5 D5
    G4 Ab4 Bb4 C5 D5 Eb5 F5 G5 Ab5 Bb5
    `,
  },

  "Major/minor Tonic Chord": {
    keyboardMapping: keyboard`
      E7 . C7 C8 G7 . Eb7 .
      E5 E6 C5 C6 G5 G6 Eb5 Eb6
      E3 E4 C3 C4 G3 G4 Eb3 Eb4
      E1 E2 C1 C2 G1 G2 Eb1 Eb2
    `,
  },

  "Roman Numerals": {
    keyboardMapping: keyboard`
    F3 G3 C3 D3 E3 F#3 G#3 A3 B3 C#4 D4 
    Ab3 Bb3 Eb3 F3 G3 A3 B3 C4 D4 E4 F4 
    Db3 Eb3 Ab2 Bb2 C3 D3 E3 F3 G3 A3 B3
    E3 Gb3 B2 Db3 Eb3 F3 G3 Ab3 Bb3 C4 D4
    `,
  },

  "Applied in Major": {
    keyboardMapping: keyboard`
    B3 C4 G3  D4 A3  E4 Bb3 F4 C4  G4 B3 D4
    G3 A3 E3  B3 F#3 C4 G3  D4 A3  E4 G#3
    E3 F3 C#3 G3 D#3 A3 E3  B3 F#3 C4 E3
    C3 D3 A2  E3 B2  F3 C3  G3 D3  A3 
    `,
  },

  "Applied in Minor": {
    keyboardMapping: keyboard`
    Bb3 C4 G3  D4 Ab3  Eb4 Bb3 F4 C4  G4 Bb3 Db4
    G3 Ab3 E3   Bb3 F3 C4 G3  D4 A3  Eb4 G3 Ab4
    Eb3 F3 C#3 G3 D3 Ab3 E3  B3 F#3 C4 Eb3
    C3 D3 A2   Eb3 Bb2  F3 C3  G3 D3  Ab3 
    `,
  },

  "V7 to major I": {
    keyboardMapping: keyboard`
      G1 B1 D2 F2 G2 B2 D3 F3 G3 B3 D4 F4
      G4 B4 D5 F5 G5 B5 D6 F6 G6 B6 D7 F7
      C1 E1 G1 C2 E2 G2 C3 E3 G3 E7 G7
      C4 E4 G4 C5 E5 G5 C6 E6 G6 C7
    `,
  },

  "V7 to minor i": {
    keyboardMapping: keyboard`
      G1 B1 D2 F2 G2 B2 D3 F3 G3 B3 D4 F4
      G4 B4 D5 F5 G5 B5 D6 F6 G6 B6 D7 F7
      C1 Eb1 G1 C2 Eb2 G2 C3 Eb3 G3 Eb7 G7
      C4 Eb4 G4 C5 Eb5 G5 C6 Eb6 G6 C7
    `,
  },

  "Chain of Dominants": {
    keyboardMapping: keyboard`
    Eb4 Bb3 F4 C4 G4 D4 A4 E4 B4 F#4 C#5 G#4 D#5
    C4 G3 D4 A3 E4 B3 F#4 C#4 G#4 D#4 A#4 F4 C5
    A3 E3 B3 F#3 C#4 G#3 D#4 A#3 F4 C4 G4 D4
    F3 C3 G3 D3 A3 E3 B3 F#3 C#4 G#3 D#4 A#3 F4
    `,
  },

  "Circle of Fifths": {
    keyboardMapping: keyboard`
    D3 A3 E3 B3 F#3 C#4 G#3 D#4 A#3 F4 C4 G4
    F3 C4 G3 D4 A3 E4 B3 F#4 C#4 G#4 D#4 A#4
    Bb2 F3 C3 G3 D3 A3 E3 B3 F#3 C#4 G#3 D#4 
    Db3 Ab3 Eb3 Bb3 F3 C4 G3 D4 A3 E4
    `,
  },

  "Chromatic Sequences": {
    keyboardMapping: keyboard`
      C5 C#5 D5 D#5 E5 F5 F#5 G5 G#5 A5 A#5 B5
      C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4 B4
      C3 C#3 D3 D#3 E3 F3 F#3 G3 G#3 A3 A#3 B3
      C2 C#2 D2 D#2 E2 F2 F#2 G2 G#2 A2 A#2 B2
    `,
    colorMode: "flat-chromatic",
  },

  "Flat Chromatic Layout": {
    keyboardMapping: keyboard`
    C2 C#2 D2 D#2 E2 F2 F#2 G2 G#2 A2 A#2 B2 
    C3 C#3 D3 D#3 E3 F3 F#3 G3 G#3 A3 A#3 B3
     C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4 
      B4 C5 C#5 D5 D#5 E5 F5 F#5 G5 G#5 
      
      
      
  `,
    colorMode: "flat-chromatic",
  },

  "Major Seconds": {
    keyboardMapping: keyboard`
    A#0 C1 D1 E1 F#1 G#1 A#1 C2 D2 E2 F#2 G#2
    A#2 C3 D3 E3 F#3 G#3 A#3 C4 D4 E4 F#4 G#4
    A#4 C5 D5 E5 F#5 G#5 A#5 C6 D6 E6 F#6 
      G#6 A#6 C7 D7 E7 F#7 G#7 A#7 . . .
      
      
      
    `,
    colorMode: "flat-chromatic",
  },

  "Four Augmented Scales": {
    keyboardMapping: keyboard`
      C2 E2 G#2 C3 E3 G#3 C4 E4 G#4 C5 E5 G#5
      C#2 F2 A2 C#3 F3 A3 C#4 F4 A4 C#5 F5 A5
      D2 F#2 A#2 D3 F#3 A#3 D4 F#4 A#4 D5 F#5 A#5
      D#2 G2 B2 D#3 G3 B3 D#4 G4 B4 D#5 G5 B5
    `,
  },

  "Fifths Only": {
    keyboardMapping: keyboard`
      C1 G1 D2 A2 E3 B3 F#4 C#5 G#5 D#6 A#6 F7
      C2 G2 D3 A3 E4 B4 F#5 C#6 G#6 D#7 A#7 F8
      C3 G3 D4 A4 E5 B5 F#6 C#7 G#7 D#8 A#8 .
      C4 G4 D5 A5 E6 B6 F#7 C#8 . . . .
    `,
  },

  "Fourths Only": {
    keyboardMapping: keyboard`
      C1 F1 Bb1 Eb2 Ab2 Db3 Gb3 B3 E4 A4 D5 G5
      C2 F2 Bb2 Eb3 Ab3 Db4 Gb4 B4 E5 A5 D6 G6
      C3 F3 Bb3 Eb4 Ab4 Db5 Gb5 B5 E6 A6 D7 G7
      C4 F4 Bb4 Eb5 Ab5 Db6 Gb6 B6 E7 A7 D8 G8
    `,
  },

  "Minor Pentatonic": {
    keyboardMapping: keyboard`
    C1 Eb1 F1 G1 Bb1 C2 Eb2 F2 G2 Bb2 C3 Eb3
    C3 Eb3 F3 G3 Bb3 C4 Eb4 F4 G4 Bb4 C5 Eb5 
    C5 Eb5 F5 G5 Bb5 C6 Eb6 F6 G6 Bb6 C7
    C7 Eb7 F7 G7 Bb7 C8 . . . Bb0  
    `,
  },

  "Blues Scale": {
    keyboardMapping: keyboard`
    C1 Eb1 F1 F#1 G1 Bb1 C2 Eb2 F2 F#2 G2 Bb2 
    C3 Eb3 F3 F#3 G3 Bb3 C4 Eb4 F4 F#4 G4 Bb4 
    C5 Eb5 F5 F#5 G5 Bb5 C6 Eb6 F6 F#6 G6 Bb6
    C7 Eb7 F7 F#7 G7 Bb7 C8 . . Bb0
    `,
  },

  "Hirajoshi Scale": {
    keyboardMapping: keyboard`
    C1 C#1 F1 F#1 Bb1 C2 C#2 F2 F#2 Bb2 C3 C#3
    C3 C#3 F3 F#3 Bb3 C4 C#4 F4 F#4 Bb4 C5 C#5
     C5 C#5 F5 F#5 Bb5 C6 C#6 F6 F#6 Bb6 C7
        C7 C#7 F7 F#7 Bb7 C8 . . . Bb0
      
      
      
    `,
  },

  "Traditional Layout": {
    keyboardMapping: keyboard`
      . F#3 G#3 A#3 . C#4 D#4 . F#4 G#4 A#4
      F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5
      . C#2 D#2 . F#2 G#2 A#2 . C#3 D#3
      C2 D2 E2 F2 G2 A2 B2 C3 D3 E3
  `,
  },

  "Maj7 Chords": {
    keyboardMapping: keyboard`
    B3 C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4
    G3 G#3 A3 A#3 B3 C4 C#4 D4 D#4 E4 F4 F#4 
    E3 F3 F#3 G3 G#3 A3 A#3 B3 C4 C#4 D4 E4 F4 F#4 
    C3 C#3 D3 D#3 E3 F3 F#3 G3 G#3 A3 A#3 B3 C4
    `,
  },

  "Gravity Falls Opening": {
    keyboardMapping: keyboard`
    Eb3 G3 C4 D4 B3   Bb4 C5 D5 Eb5 F5 G5 Ab5 Bb5 B5
    C3 Eb3 Ab3 Bb3 G3 Bb3 C4 D4 Eb4 F4 G4 Ab4 
    G2 Bb2 Eb3 F3 D3  Bb5 B5 C6
    C2 Eb2 Ab2 Bb2 G2 Bb4 B4 C5
    `,
  },

  Axis: {
    keyboardMapping: keyboard`
    A1 A2 E3 A3 C4 E4 A4 C5 E5 A5 C6 E6
    F1 F2 C3 F3 A3 C4 F4 A4 C5 F5 A5 C6 F6 A6
    C1 C2 G2 C3 E3 G3 C4 E4 G4 C5 E5 G5 C6
    G1 G2 D3 G3 B3 D4 G4 B4 D5 G5 B5 D6
    `,
  },

  "Axis with Em": {
    keyboardMapping: keyboard`
    A1 A2 E3 A3 C4 E4 A4 C5 E5 A5 C6 E6
    F1 F2 C3 F3 A3 C4 F4 A4 C5 F5 A5 C6 F6 A6
    C1 C2 G2 C3 E3 G3 C4 E4 G4 C5 E5 G5 C6
    E1 E2 B2 E3 G3 B3 E4 G4 B4 E5 G5 B5
    `,
  },

  "Russian Pop": {
    keyboardMapping: keyboard`
    Ab1 Ab2 Eb3 Ab3 C4 Eb4 Ab4 C5 Eb5 Ab5 C6 Eb6
    G1 G2 D3 G3 B3 D4 G4 B4 D5 G5 B5 D6 F6 B6
    C2 C3 G3 C4 Eb4 G4 C5 Eb5 G5 C6 Eb6
    Eb2 Eb3 Bb3 Eb4 G4 Bb4 Eb5 G5 Bb5 Eb6 G6 Bb6
    `,
  },
};

// Add these helper functions at the top of the file
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Transform internal format to exported format
export const TASK_CONFIGS: TaskConfig[] = Object.entries(INTERNAL_TASKS).map(
  ([title, config]) => ({
    title,
    slug: slugify(title),
    keyboardMapping:
      typeof config.keyboardMapping === "string"
        ? processKeyboardString(config.keyboardMapping)
        : config.keyboardMapping,
    colorMode: config.colorMode ?? "chromatic",
  })
);
