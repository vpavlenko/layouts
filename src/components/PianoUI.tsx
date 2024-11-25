import * as React from "react";
import { useState, useEffect } from "react";
import { FallingNotes, FallingNote } from "./FallingNotes";
import { ColorMode } from "./types";
import { getColors, getLabelColorForNote } from "../utils/colors";
import {
  getKeyboardMap,
  KEY_DISPLAY_LABELS,
  KeyboardMapping,
} from "../constants/keyboard";
import { PianoControls } from "./PianoControls";
import { Voicing } from "../constants/voicings";
import { TaskId } from "../tasks/tasks";
import { PianoControllerState } from "./PianoController";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_HEIGHT_MULTIPLIER = 0.65; // Black keys are 60% of total height
export const PIANO_HEIGHT = 80; // Total piano height in pixels

interface PianoKeyProps {
  note: number;
  octave: number;
  style: React.CSSProperties;
  keyboardKey?: string;
  onNoteStart: (note: number, octave: number) => void;
  onNoteEnd: (note: number, octave: number) => void;
  tonic: number;
  colorMode: ColorMode;
  playNotes: (
    note: number,
    octave: number
  ) => Promise<Array<{ note: number; octave: number }>>;
  releaseNotes: (
    note: number,
    octave: number
  ) => Array<{ note: number; octave: number }>;
  isActive: boolean;
  activeTaskId: TaskId | null;
  keyboardMapping?: KeyboardMapping;
}

// Add helper to check if a note is part of scale task mapping
const isNoteInScaleMapping = (
  note: number,
  octave: number,
  taskId: TaskId | null,
  keyboardMapping?: KeyboardMapping
): boolean => {
  if (!taskId || !keyboardMapping) return true;

  // Check if this note/octave combination exists in the mapping
  return Object.values(keyboardMapping).some(
    (mapping) => mapping.note === note && mapping.octave === octave
  );
};

const PianoKey: React.FC<PianoKeyProps> = ({
  note,
  octave,
  style,
  keyboardKey,
  tonic,
  colorMode,
  playNotes,
  releaseNotes,
  isActive,
  activeTaskId,
  keyboardMapping,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  // Check if this note should be colored based on scale mapping
  const shouldColorNote = isNoteInScaleMapping(
    note,
    octave,
    activeTaskId,
    keyboardMapping
  );

  // Determine which color mode to use for this note
  const effectiveColorMode = (() => {
    // For free play (no active task), use the passed colorMode directly
    if (!activeTaskId) return colorMode;

    if (colorMode === "flat-chromatic") return "flat-chromatic";

    return shouldColorNote ? "chromatic" : "traditional";
  })();

  const colors = getColors(tonic, effectiveColorMode);
  const relativeNote = (note - tonic + 12) % 12;
  const isWhiteKey = WHITE_KEYS.includes(note);

  const handleMouseDown = async () => {
    await playNotes(note, octave);
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (isPressed) {
      releaseNotes(note, octave);
      setIsPressed(false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isPressed) {
      handleMouseUp();
    }
  };

  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    await handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  const keyStyle = {
    ...style,
    backgroundColor:
      effectiveColorMode === "traditional"
        ? isWhiteKey
          ? "#FFFFFF"
          : "#000000" // Traditional colors
        : colors[note], // Chromatic/flat-chromatic colors
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color:
      effectiveColorMode === "traditional"
        ? isWhiteKey
          ? "#000000"
          : "#FFFFFF" // Traditional mode: black on white, white on black
        : getLabelColorForNote(relativeNote), // Chromatic modes: use special colors
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-end" as const,
    alignItems: "center",
    paddingBottom: "3px",
    boxSizing: "border-box" as const,
    transform:
      isActive || isPressed
        ? "scale(0.9)"
        : isHovered
        ? "scale(1.1)"
        : "scale(1)",
    boxShadow:
      isActive || isPressed
        ? `0 0 10px ${
            isWhiteKey ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)"
          }`
        : "none",
    transition:
      activeTaskId || isPressed || isHovered
        ? "transform 0.1s ease-in-out, background-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out"
        : "transform 1s ease-in-out, background-color 1s ease-in-out, box-shadow 1s ease-in-out",
    cursor: "pointer",
    zIndex: isHovered ? 3 : style.zIndex || 1,
    border: effectiveColorMode === "traditional" ? "1px solid #333" : "none",
    height: (() => {
      if (effectiveColorMode === "flat-chromatic") {
        return PIANO_HEIGHT;
      }
      // For both traditional and chromatic modes
      if (effectiveColorMode === "chromatic") {
        return isWhiteKey
          ? PIANO_HEIGHT - 2
          : PIANO_HEIGHT * BLACK_KEY_HEIGHT_MULTIPLIER - 2;
      }
      return isWhiteKey
        ? PIANO_HEIGHT
        : PIANO_HEIGHT * BLACK_KEY_HEIGHT_MULTIPLIER;
    })(),
    top: (() => {
      if (effectiveColorMode === "flat-chromatic") {
        return 0;
      }
      if (effectiveColorMode === "chromatic") {
        return 1;
      }
      return 0;
      // For both traditional and chromatic modes
    })(),
  };

  return (
    <div
      style={keyStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {keyboardKey && (
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "2px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1px",
          }}
        >
          <div>{keyboardKey}</div>
        </div>
      )}
    </div>
  );
};

// Replace the EXTRA_LOW_KEYS constant with a more structured octave range system
interface OctaveRange {
  start: number; // Starting note number (0-11, where 0 is C)
  length: number; // How many notes in this octave range
}

const OCTAVE_RANGES: { [key: number]: OctaveRange } = {
  0: { start: 9, length: 3 }, // A0, A#0, B0
  1: { start: 0, length: 12 }, // C1 to B1
  2: { start: 0, length: 12 }, // C2 to B2
  3: { start: 0, length: 12 }, // C3 to B3
  4: { start: 0, length: 12 }, // C4 to B4
  5: { start: 0, length: 12 }, // C5 to B5
  6: { start: 0, length: 12 }, // C6 to B6
  7: { start: 0, length: 12 }, // C7 to B7
  8: { start: 0, length: 1 }, // C8 only
};

// Add this helper function to count white keys in a range
const countWhiteKeysInRange = (start: number, length: number): number => {
  let count = 0;
  for (let i = 0; i < length; i++) {
    if (WHITE_KEYS.includes((start + i) % 12)) {
      count++;
    }
  }
  return count;
};

// Update the helper function to include white key counting logic
const calculateKeyLeftPosition = (
  noteNum: number,
  octaveNum: number,
  keyWidth: number,
  colorMode: ColorMode
): number => {
  if (colorMode === "flat-chromatic") {
    // Calculate total key count inside the function
    let keyCount = 0;
    for (let o = 0; o < octaveNum; o++) {
      keyCount += OCTAVE_RANGES[o].length;
    }
    // Add keys in current octave up to this note
    const currentOctave = OCTAVE_RANGES[octaveNum];
    keyCount += noteNum - currentOctave.start;

    return keyWidth * (7 / 12) * (keyCount + 0.5);
  }

  const isWhiteKey = WHITE_KEYS.includes(noteNum);

  // Calculate white key count
  let whiteKeyCount = 0;

  // Count white keys in previous octaves
  for (let o = 0; o < octaveNum; o++) {
    whiteKeyCount += countWhiteKeysInRange(
      OCTAVE_RANGES[o].start,
      OCTAVE_RANGES[o].length
    );
  }

  // Count white keys in current octave up to this note
  const currentOctave = OCTAVE_RANGES[octaveNum];
  const notesBeforeCurrent = noteNum - currentOctave.start;
  whiteKeyCount += countWhiteKeysInRange(
    currentOctave.start,
    notesBeforeCurrent
  );

  return keyWidth * (isWhiteKey ? whiteKeyCount : whiteKeyCount - 0.5);
};

interface PianoUIProps {
  tonic: number;
  setTonic: (tonic: number) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  currentVoicing: Voicing;
  onVoicingChange: (voicing: Voicing) => void;
  playNotes: (
    note: number,
    octave: number
  ) => Promise<Array<{ note: number; octave: number }>>;
  releaseNotes: (
    note: number,
    octave: number
  ) => Array<{ note: number; octave: number }>;
  fallingNotes: FallingNote[];
  taskKeyboardMapping?: KeyboardMapping;
  taskId: TaskId;
  state: PianoControllerState;
  setActiveKeyCodes: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const PianoUI: React.FC<PianoUIProps> = ({
  tonic,
  setTonic,
  colorMode,
  onColorModeChange,
  currentVoicing,
  onVoicingChange,
  playNotes,
  releaseNotes,
  fallingNotes,
  taskKeyboardMapping,
  taskId,
  setActiveKeyCodes,
}) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [activeNotes, setActiveNotes] = useState<
    Array<{ note: number; octave: number }>
  >([]);

  const isNoteActive = (note: number, octave: number) => {
    return activeNotes.some(
      (activeNote) => activeNote.note === note && activeNote.octave === octave
    );
  };

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      setActiveKeyCodes((prev: Set<string>) => new Set([...prev, event.code]));

      const currentKeyboardMap = getKeyboardMap(colorMode, taskKeyboardMapping);

      if (event.ctrlKey && event.code in currentKeyboardMap) {
        const { note } =
          currentKeyboardMap[event.code as keyof typeof currentKeyboardMap];
        setTonic(note % 12);
        return;
      }

      if (!activeKeys.has(event.code)) {
        setActiveKeys((prev) => new Set([...prev, event.code]));

        if (event.code in currentKeyboardMap) {
          const { note, octave } =
            currentKeyboardMap[event.code as keyof typeof currentKeyboardMap];
          await playNotes(note, octave);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setActiveKeyCodes((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(event.code);
        return next;
      });

      const currentKeyboardMap = getKeyboardMap(colorMode, taskKeyboardMapping);

      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(event.code);
        return next;
      });

      if (event.code in currentKeyboardMap) {
        const { note, octave } =
          currentKeyboardMap[event.code as keyof typeof currentKeyboardMap];
        releaseNotes(note, octave);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    activeKeys,
    playNotes,
    releaseNotes,
    setTonic,
    colorMode,
    taskKeyboardMapping,
    setActiveKeyCodes,
  ]);

  useEffect(() => {
    const currentlyPlaying = fallingNotes
      .filter((note) => !note.endTime)
      .map((note) => ({
        note: note.note,
        octave: note.octave,
      }));
    setActiveNotes(currentlyPlaying);
  }, [fallingNotes]);

  const TOTAL_WHITE_KEYS = Object.values(OCTAVE_RANGES).reduce(
    (total, range) => total + countWhiteKeysInRange(range.start, range.length),
    0
  );

  const MARGIN_PX = 40; // Total horizontal margin (20px on each side)

  const calculateKeyWidth = (containerWidth: number): number => {
    return (containerWidth - MARGIN_PX) / TOTAL_WHITE_KEYS;
  };

  const [keyWidth, setKeyWidth] = useState(25); // Default fallback width

  useEffect(() => {
    const handleResize = () => {
      const availableWidth = window.innerWidth - 600; // Total width minus ControlPanel
      const newKeyWidth = calculateKeyWidth(availableWidth);
      setKeyWidth(newKeyWidth);
    };

    // Initial calculation
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalWidth = TOTAL_WHITE_KEYS * keyWidth;

  const commonKeyProps: Omit<
    PianoKeyProps,
    "note" | "octave" | "style" | "keyboardKey" | "isActive"
  > = {
    onNoteStart: playNotes,
    onNoteEnd: releaseNotes,
    tonic,
    colorMode,
    playNotes,
    releaseNotes,
    activeTaskId: taskId,
  };

  const c1Left = calculateKeyLeftPosition(0, 1, keyWidth, "traditional");
  const c2Left = calculateKeyLeftPosition(0, 2, keyWidth, "traditional");

  // Modify the key rendering logic to only show relevant keys
  const getKeyboardKey = (noteNum: number, octaveNum: number) => {
    const currentKeyboardMap = getKeyboardMap(colorMode, taskKeyboardMapping);

    // Find the matching key for this note/octave combination
    const matchingKey = Object.entries(currentKeyboardMap).find(
      ([, value]) => value.note === noteNum && value.octave === octaveNum
    )?.[0];

    if (matchingKey) {
      return KEY_DISPLAY_LABELS[matchingKey as keyof typeof KEY_DISPLAY_LABELS];
    }
    return undefined;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "600px",
        right: 0,
        bottom: 0,
        backgroundColor: "black",
        padding: "5px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: totalWidth,
          marginTop: "40px",
          marginLeft: MARGIN_PX / 2,
          marginRight: MARGIN_PX / 2,
        }}
      >
        <PianoControls
          tonic={tonic}
          onTonicChange={setTonic}
          colorMode={colorMode}
          onColorModeChange={onColorModeChange}
          currentVoicing={currentVoicing}
          onVoicingChange={onVoicingChange}
        />
        {Object.entries(OCTAVE_RANGES).map(([octave, range]) => {
          const octaveNum = parseInt(octave);
          return Array.from({ length: range.length }, (_, i) => {
            const noteNum = (range.start + i) % 12;
            const isWhiteKey = WHITE_KEYS.includes(noteNum);

            const commonStyleProps = {
              width:
                colorMode === "flat-chromatic" ? keyWidth * (7 / 12) : keyWidth,
              height: PIANO_HEIGHT,
              borderRadius: "0 0 5px 5px",
            };

            if (
              colorMode === "flat-chromatic" ||
              isWhiteKey ||
              BLACK_KEYS.indexOf(noteNum) !== -1
            ) {
              return (
                <PianoKey
                  key={`${octaveNum}-${noteNum}`}
                  {...commonKeyProps}
                  note={noteNum}
                  octave={octaveNum}
                  isActive={isNoteActive(noteNum, octaveNum)}
                  keyboardKey={getKeyboardKey(noteNum, octaveNum)}
                  style={{
                    ...commonStyleProps,
                    width:
                      colorMode === "flat-chromatic"
                        ? keyWidth * (7 / 12)
                        : isWhiteKey
                        ? keyWidth
                        : keyWidth - 3,
                    left: calculateKeyLeftPosition(
                      noteNum,
                      octaveNum,
                      keyWidth,
                      colorMode
                    ),
                    zIndex:
                      colorMode === "flat-chromatic" ? 1 : isWhiteKey ? 1 : 2,
                  }}
                  activeTaskId={taskId}
                  keyboardMapping={taskKeyboardMapping}
                />
              );
            }
            return null;
          });
        })}
        <FallingNotes
          notes={fallingNotes}
          tonic={tonic}
          colorMode={colorMode}
          fallingNoteWidth={(keyWidth / 6) * 7}
          referencePoints={{
            c1: { note: 12, left: c1Left },
            c2: { note: 24, left: c2Left },
          }}
        />
      </div>
    </div>
  );
};
