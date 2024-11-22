import { createSetChecker } from "./checkers";
import { createSequenceChecker } from "./checkers";
import { ChromaticNote, TaskConfig } from "./tasks";
import { createSequenceKeyboardMapping } from "./mappings";

const C_MAJOR_SCALE_SEQUENCE = {
  notes: [
    { note: 0 as ChromaticNote, octave: 3 }, // C3
    { note: 2 as ChromaticNote, octave: 3 }, // D3
    { note: 4 as ChromaticNote, octave: 3 }, // E3
    { note: 5 as ChromaticNote, octave: 3 }, // F3
    { note: 7 as ChromaticNote, octave: 3 }, // G3
    { note: 9 as ChromaticNote, octave: 3 }, // A3
    { note: 11 as ChromaticNote, octave: 3 }, // B3
    { note: 0 as ChromaticNote, octave: 4 }, // C4
  ],
  keys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma"],
};

const C_MINOR_SCALE_SEQUENCE = {
  notes: [
    { note: 0 as ChromaticNote, octave: 3 }, // C3
    { note: 2 as ChromaticNote, octave: 3 }, // D3
    { note: 3 as ChromaticNote, octave: 3 }, // Eb3
    { note: 5 as ChromaticNote, octave: 3 }, // F3
    { note: 7 as ChromaticNote, octave: 3 }, // G3
    { note: 8 as ChromaticNote, octave: 3 }, // Ab3
    { note: 10 as ChromaticNote, octave: 3 }, // Bb3
    { note: 0 as ChromaticNote, octave: 4 }, // C4
  ],
  keys: ["KeyZ", "KeyX", "KeyD", "KeyV", "KeyB", "KeyH", "KeyJ", "Comma"],
};

export const TASKS_ON_CHORDS_IN_SCALE: Record<string, TaskConfig> = {
  "play-c-major-scale-sequence": {
    id: "play-c-major-scale-sequence",
    description: "Play C major scale from C3 to C4",
    total: C_MAJOR_SCALE_SEQUENCE.notes.length,
    requiredProgress: C_MAJOR_SCALE_SEQUENCE.notes.length,
    keyboardMapping: createSequenceKeyboardMapping(
      C_MAJOR_SCALE_SEQUENCE.notes,
      C_MAJOR_SCALE_SEQUENCE.keys
    ),
    colorMode: "chromatic",
    chromaticNotes: Array.from(
      new Set(C_MAJOR_SCALE_SEQUENCE.notes.map((n) => n.note))
    ),
    checker: createSequenceChecker(C_MAJOR_SCALE_SEQUENCE.notes),
    previousTaskId: "play-b-minor-chord",
  },

  "play-c-major-primary-i": {
    id: "play-c-major-primary-i",
    description: "Play C major chord (I)",
    total: 3,
    requiredProgress: 3,
    keyboardMapping: {
      KeyZ: { note: 0, octave: 3 }, // C3
      KeyX: { note: 4, octave: 3 }, // E3
      KeyC: { note: 7, octave: 3 }, // G3
    },
    colorMode: "chromatic",
    chromaticNotes: [0, 4, 7],
    checker: createSetChecker(new Set(["0-3", "4-3", "7-3"])),
    previousTaskId: "play-c-major-scale-sequence",
  },

  "play-c-major-primary-iv": {
    id: "play-c-major-primary-iv",
    description: "Play F major chord (IV)",
    total: 3,
    requiredProgress: 3,
    keyboardMapping: {
      KeyV: { note: 5, octave: 3 }, // F3
      KeyB: { note: 9, octave: 3 }, // A3
      KeyN: { note: 0, octave: 4 }, // C4
    },
    colorMode: "chromatic",
    chromaticNotes: [0, 5, 9],
    checker: createSetChecker(new Set(["5-3", "9-3", "0-4"])),
    previousTaskId: "play-c-major-primary-i",
  },

  "play-c-major-primary-v": {
    id: "play-c-major-primary-v",
    description: "Play G major chord (V)",
    total: 3,
    requiredProgress: 3,
    keyboardMapping: {
      KeyM: { note: 7, octave: 3 }, // G3
      Comma: { note: 11, octave: 3 }, // B3
      Period: { note: 2, octave: 4 }, // D4
    },
    colorMode: "chromatic",
    chromaticNotes: [2, 7, 11],
    checker: createSetChecker(new Set(["7-3", "11-3", "2-4"])),
    previousTaskId: "play-c-major-primary-iv",
  },

  "play-c-minor-scale-sequence": {
    id: "play-c-minor-scale-sequence",
    description: "Play C minor scale from C3 to C4",
    total: C_MINOR_SCALE_SEQUENCE.notes.length,
    requiredProgress: C_MINOR_SCALE_SEQUENCE.notes.length,
    keyboardMapping: createSequenceKeyboardMapping(
      C_MINOR_SCALE_SEQUENCE.notes,
      C_MINOR_SCALE_SEQUENCE.keys
    ),
    colorMode: "chromatic",
    chromaticNotes: Array.from(
      new Set(C_MINOR_SCALE_SEQUENCE.notes.map((n) => n.note))
    ),
    checker: createSequenceChecker(C_MINOR_SCALE_SEQUENCE.notes),
    previousTaskId: "play-c-major-primary-v",
  },

  "play-c-minor-primary-i": {
    id: "play-c-minor-primary-i",
    description: "Play C minor chord (i)",
    total: 3,
    requiredProgress: 3,
    keyboardMapping: {
      KeyZ: { note: 0, octave: 3 }, // C3
      KeyX: { note: 3, octave: 3 }, // Eb3
      KeyC: { note: 7, octave: 3 }, // G3
    },
    colorMode: "chromatic",
    chromaticNotes: [0, 3, 7],
    checker: createSetChecker(new Set(["0-3", "3-3", "7-3"])),
    previousTaskId: "play-c-minor-scale-sequence",
  },

  "play-c-minor-primary-iv": {
    id: "play-c-minor-primary-iv",
    description: "Play F minor chord (iv)",
    total: 3,
    requiredProgress: 3,
    keyboardMapping: {
      KeyV: { note: 5, octave: 3 }, // F3
      KeyB: { note: 8, octave: 3 }, // Ab3
      KeyN: { note: 0, octave: 4 }, // C4
    },
    colorMode: "chromatic",
    chromaticNotes: [0, 5, 8],
    checker: createSetChecker(new Set(["5-3", "8-3", "0-4"])),
    previousTaskId: "play-c-minor-primary-i",
  },

  "play-c-minor-primary-v": {
    id: "play-c-minor-primary-v",
    description: "Play G minor chord (v)",
    total: 3,
    requiredProgress: 3,
    keyboardMapping: {
      KeyM: { note: 7, octave: 3 }, // G3
      Comma: { note: 10, octave: 3 }, // Bb3
      Period: { note: 2, octave: 4 }, // D4
    },
    colorMode: "chromatic",
    chromaticNotes: [2, 7, 10],
    checker: createSetChecker(new Set(["7-3", "10-3", "2-4"])),
    previousTaskId: "play-c-minor-primary-iv",
  },
};
