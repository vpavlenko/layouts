import { ColorMode } from "../components/types";
import { KeyboardMapping } from "../constants/keyboard";
import { LESSONS } from "../data/lessons";
import {
  createSequenceChecker,
  createSetChecker,
  TaskChecker,
} from "./checkers";
import { createSequenceKeyboardMapping } from "./mappings";
import { TASKS_ON_MAJOR_CHORDS, TASKS_ON_MINOR_CHORDS } from "./tasksOnChords";

export type RelativeNote = 0 | 2 | 4 | 5 | 7 | 9 | 11; // C D E F G A B
export type ChromaticNote = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface TaskConfig {
  id: string;
  description: string;
  total: number;
  keyboardMapping?: KeyboardMapping;
  colorMode?: ColorMode;
  chromaticNotes?: number[];
  checker: TaskChecker;
  requiredProgress: number;
  previousTaskId?: string | null;
  playedNotes?: Set<string>;
}

export interface TaskProgress {
  taskId: string;
  progress: number;
  status: "active" | "completing" | "completed";
}

const taskSequenceArray = LESSONS.reduce<string[]>(
  (sequence, lesson) => [...sequence, ...lesson.taskIds],
  []
);

export const TASK_SEQUENCE = taskSequenceArray;

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
  "C#": createNoteMapping(1, ["KeyZ", "KeyA", "KeyQ", "Digit1"]), // Same keys as C for black keys
  "E-again": createNoteMapping(4, ["KeyV", "KeyF", "KeyR", "Digit4"]),
  "D#": createNoteMapping(3, ["KeyC", "KeyD", "KeyE", "Digit3"]),
  "A-again": createNoteMapping(9, ["Comma", "KeyK", "KeyI", "Digit8"]),
  "G#": createNoteMapping(8, ["KeyM", "KeyJ", "KeyU", "Digit7"]),
  "B-again": createNoteMapping(11, ["Slash", "Semicolon", "KeyP", "Digit0"]),
  "A#": createNoteMapping(10, ["Period", "KeyL", "KeyO", "Digit9"]),
  "F-again": createNoteMapping(5, ["KeyB", "KeyG", "KeyT", "Digit5"]),
  "F#": createNoteMapping(6, ["KeyN", "KeyH", "KeyY", "Digit6"]),
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

// Update createTaskConfig to use the new checker creators
const createTaskConfig = (
  index: number,
  targetNote: NoteMapping,
  description: string,
  chromaticNotes: number[],
  lessonNumber: number
): TaskConfig => {
  // Create a set of target notes for just this task
  const targetNotes = new Set<string>();
  [2, 3, 4, 5].forEach((octave) => {
    targetNotes.add(`${targetNote.note}-${octave}`);
  });

  // Create the checker using the new creator function
  const checker = createSetChecker(targetNotes);

  // Create the full keyboard mapping that includes all previous notes
  const fullMapping: KeyboardMapping = {};

  if (lessonNumber === 1) {
    // Lesson 1: Progressive mapping from C to B
    const relevantMappings = [
      NOTE_MAPPINGS.C,
      NOTE_MAPPINGS.D,
      NOTE_MAPPINGS.E,
      NOTE_MAPPINGS.F,
      NOTE_MAPPINGS.G,
      NOTE_MAPPINGS.A,
      NOTE_MAPPINGS.B,
    ].slice(0, index + 1);

    relevantMappings.forEach((noteMapping) => {
      if (noteMapping) {
        noteMapping.keys.forEach((key, octaveOffset) => {
          fullMapping[key] = {
            note: noteMapping.note,
            octave: octaveOffset + 2,
          };
        });
      }
    });
  } else if (lessonNumber === 2) {
    // Lesson 2: Progressive mapping for black keys
    const lesson2Mappings = [
      NOTE_MAPPINGS.D,
      NOTE_MAPPINGS["C#"],
      NOTE_MAPPINGS["E-again"],
      NOTE_MAPPINGS["D#"],
      NOTE_MAPPINGS["A-again"],
      NOTE_MAPPINGS["G#"],
      NOTE_MAPPINGS["B-again"],
      NOTE_MAPPINGS["A#"],
      NOTE_MAPPINGS["F-again"],
      NOTE_MAPPINGS["F#"],
    ];

    // Calculate the index within lesson 2
    const lesson2Index = index - 7; // Since lesson 2 starts at index 7
    const relevantMappings = lesson2Mappings.slice(0, lesson2Index + 1);

    relevantMappings.forEach((noteMapping) => {
      if (noteMapping) {
        noteMapping.keys.forEach((key, octaveOffset) => {
          fullMapping[key] = {
            note: noteMapping.note,
            octave: octaveOffset + 2,
          };
        });
      }
    });
  }

  return {
    id: TASK_SEQUENCE[index],
    description: `Play ${description}`,
    total: 4,
    requiredProgress: 4,
    previousTaskId: index > 0 ? TASK_SEQUENCE[index - 1] : null,
    chromaticNotes,
    keyboardMapping: fullMapping,
    checker,
  };
};

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
    description: "Lydian scale (C D E F# G A B C)",
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
    description: "Major scale (C D E F G A B C)",
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
    description: "Mixolydian scale (C D E F G A Bb C)",
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
    description: "Dorian scale (C D Eb F G A Bb C)",
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
    description: "Dorian scale in lower octave (C D Eb F G A Bb C)",
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
    description: "Natural Minor scale (C D Eb F G Ab Bb C)",
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
    description: "Phrygian scale (C Db Eb F G Ab Bb C)",
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
    description: "Locrian scale (C Db Eb F Gb Ab Bb C)",
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

// Add these new task definitions after the SCALE_SEQUENCES constant and before TASK_CONFIGS

// Update TASK_CONFIGS with the modified scale tasks
export const TASK_CONFIGS: Record<string, TaskConfig> = {
  "play-b-across-octaves": createTaskConfig(
    6,
    NOTE_MAPPINGS.B,
    "B notes across different octaves",
    [0, 2, 4, 5, 7, 9, 11],
    1
  ),
  "play-f-sharp": createTaskConfig(
    16,
    NOTE_MAPPINGS["F#"],
    "F# notes across different octaves",
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    2
  ),
  "play-chromatic-ascending-flat": {
    id: "play-chromatic-ascending-flat",
    description:
      "Play notes in ascending chromatic order using flat keyboard layout",
    total: ASCENDING_KEY_SEQUENCE.length,
    requiredProgress: ASCENDING_KEY_SEQUENCE.length,
    keyboardMapping: createSequenceKeyboardMapping(
      ascendingSequence,
      ASCENDING_KEY_SEQUENCE
    ),
    colorMode: "flat-chromatic",
    chromaticNotes: Array.from(new Set(ascendingSequence.map((n) => n.note))),
    checker: createSequenceChecker(ascendingSequence),
    previousTaskId: "play-chromatic-descending",
  },

  "play-major-seconds-from-asharp0": {
    id: "play-major-seconds-from-asharp0",
    description: "Play notes separated by major seconds, starting from A#0",
    total: majorSecondFromASharp0Sequence.length,
    requiredProgress: majorSecondFromASharp0Sequence.length,
    keyboardMapping: createFlatChromaticMapping(majorSecondFromASharp0Sequence),
    colorMode: "flat-chromatic",
    chromaticNotes: Array.from(
      new Set(majorSecondFromASharp0Sequence.map((n) => n.note))
    ),
    checker: createSequenceChecker(majorSecondFromASharp0Sequence),
    previousTaskId: "play-major-seconds-from-a0",
  },

  "play-dorian-scale": {
    id: "play-dorian-scale",
    description: SCALE_SEQUENCES.dorian.description,
    total: SCALE_SEQUENCES.dorian.notes.length,
    requiredProgress: SCALE_SEQUENCES.dorian.notes.length,
    keyboardMapping: createScaleKeyboardMapping(SCALE_SEQUENCES.dorian, [
      "lydian",
      "major",
      "mixolydian",
    ]),
    colorMode: "chromatic",
    chromaticNotes: Array.from(
      new Set([
        ...SCALE_SEQUENCES.lydian.notes.map((n) => n.note),
        ...SCALE_SEQUENCES.major.notes.map((n) => n.note),
        ...SCALE_SEQUENCES.mixolydian.notes.map((n) => n.note),
        ...SCALE_SEQUENCES.dorian.notes.map((n) => n.note),
      ])
    ),
    checker: createSequenceChecker([...SCALE_SEQUENCES.dorian.notes]),
    previousTaskId: "play-mixolydian-scale",
  },

  "play-locrian-scale": {
    id: "play-locrian-scale",
    description: SCALE_SEQUENCES.locrian.description,
    total: SCALE_SEQUENCES.locrian.notes.length,
    requiredProgress: SCALE_SEQUENCES.locrian.notes.length,
    keyboardMapping: createScaleKeyboardMapping(SCALE_SEQUENCES.locrian, [
      "dorianLow",
      "minor",
      "phrygian",
    ]),
    colorMode: "chromatic",
    chromaticNotes: Array.from(
      new Set([
        ...SCALE_SEQUENCES.dorianLow.notes.map((n) => n.note),
        ...SCALE_SEQUENCES.minor.notes.map((n) => n.note),
        ...SCALE_SEQUENCES.phrygian.notes.map((n) => n.note),
        ...SCALE_SEQUENCES.locrian.notes.map((n) => n.note),
      ])
    ),
    checker: createSequenceChecker([...SCALE_SEQUENCES.locrian.notes]),
    previousTaskId: "play-phrygian-scale",
  },

  ...TASKS_ON_MAJOR_CHORDS,
  ...TASKS_ON_MINOR_CHORDS,
};

export const isTaskCompleted = (taskId: string, progress: number): boolean => {
  const config = TASK_CONFIGS[taskId];
  return config && progress >= config.requiredProgress;
};

export const canTaskBeActivated = (
  taskId: string,
  taskProgress: TaskProgress[],
  currentLessonId: number
): boolean => {
  const config = TASK_CONFIGS[taskId];
  if (!config) return false;

  // Find which lesson this task belongs to
  const taskLesson = LESSONS.find((lesson) => lesson.taskIds.includes(taskId));
  if (!taskLesson || taskLesson.id !== currentLessonId) {
    return false; // Don't activate if task is not in current lesson
  }

  if (!config.previousTaskId) return true;

  const previousTask = taskProgress.find(
    (t) => t.taskId === config.previousTaskId
  );
  const previousTaskProgress = previousTask?.progress || 0;

  return isTaskCompleted(config.previousTaskId, previousTaskProgress);
};

export const getNextTaskId = (currentTaskId: string): string | null => {
  // Find which lesson contains this task
  const lesson = LESSONS.find((lesson) =>
    lesson.taskIds.includes(currentTaskId)
  );
  if (!lesson) return null;

  // Find the index of current task in the lesson
  const currentIndex = lesson.taskIds.indexOf(currentTaskId);
  if (currentIndex === -1 || currentIndex === lesson.taskIds.length - 1)
    return null;

  // Return the next task in the lesson
  return lesson.taskIds[currentIndex + 1];
};

export const getPreviousTaskId = (currentTaskId: string): string | null => {
  return TASK_CONFIGS[currentTaskId]?.previousTaskId || null;
};
