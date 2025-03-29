import * as React from "react";
import { useState, useEffect } from "react";
import { FallingNotes, FallingNote } from "./FallingNotes";
import { ColorMode, MetronomeState } from "./types";
import { getColors, getLabelColorForNote } from "../utils/colors";
import { KEY_DISPLAY_LABELS, KeyboardMapping } from "../constants/keyboard";
import { PianoControls } from "./PianoControls";
import { MetronomeLine } from "./PianoController";

const getAbsoluteNote = (
  note: number,
  octave: number,
  tonic: number
): { note: number; octave: number } => {
  // Subtract the tonic to get back to the absolute note
  const absoluteNote = (note - tonic + 12) % 12;

  // Calculate octave adjustment if we wrapped around
  const octaveAdjustment = note - tonic < 0 ? -1 : 0;

  return {
    note: absoluteNote,
    octave: octave + octaveAdjustment,
  };
};

const getRelativeNote = (
  note: number,
  octave: number,
  tonic: number
): { note: number; octave: number } => {
  // Calculate the MIDI number
  const midiNumber = note + octave * 12 + tonic;

  // Calculate the relative note position
  const relativeNote = midiNumber % 12;

  // Calculate the relative octave
  const relativeOctave = Math.floor(midiNumber / 12);

  return {
    note: relativeNote,
    octave: relativeOctave,
  };
};

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_HEIGHT_MULTIPLIER = 0.65; // Black keys are 60% of total height
export const PIANO_HEIGHT = 80; // Total piano height in pixels

interface PianoKeyProps {
  note: number;
  octave: number;
  style: React.CSSProperties;
  keyboardKey?: string;
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
  keyboardMapping: KeyboardMapping;
}

const UNMAPPED_KEY_STYLES = {
  whiteKey: "#444", // Light gray for unmapped white keys
  blackKey: "#111", // Dark gray for unmapped black keys
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
  keyboardMapping,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const colors = getColors(tonic, colorMode);
  const relativeNote = (note - tonic + 12) % 12;
  const isWhiteKey = WHITE_KEYS.includes(note);

  const handleMouseDown = async () => {
    console.log("[PianoKey] Mouse down:", {
      note,
      octave,
      tonic,
      absoluteNote: (note - tonic + 12) % 12,
    });
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
    backgroundColor: (() => {
      if (colorMode === "traditional") {
        return isWhiteKey ? "#FFFFFF" : "#000000";
      }

      if (isNoteInMapping(note, octave, tonic, keyboardMapping)) {
        return colors[note]; // Chromatic/flat-chromatic colors for mapped notes
      }

      return isWhiteKey
        ? UNMAPPED_KEY_STYLES.whiteKey
        : UNMAPPED_KEY_STYLES.blackKey;
    })(),
    position: "absolute" as const,
    userSelect: "none" as const,
    fontSize: "10px",
    textAlign: "center" as const,
    color: (() => {
      if (colorMode === "traditional") {
        return isWhiteKey ? "#000000" : "#FFFFFF";
      }
      if (isNoteInMapping(note, octave, tonic, keyboardMapping)) {
        return getLabelColorForNote(relativeNote);
      }
      return "#999999"; // Light gray text for unmapped keys
    })(),
    border: (() => {
      if (colorMode === "traditional") {
        return "1px solid #333";
      }
      if (!isNoteInMapping(note, octave, tonic, keyboardMapping)) {
        return "1px solid black"; // Traditional border for unmapped keys
      }
      return "none";
    })(),
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
    transition: "all 1s ease-in-out",
    cursor: "pointer",
    zIndex: style.zIndex || 1,
    height: (() => {
      if (colorMode === "flat-chromatic") {
        return PIANO_HEIGHT;
      }
      // For both traditional and chromatic modes
      if (colorMode === "chromatic") {
        return isWhiteKey
          ? PIANO_HEIGHT - 2
          : PIANO_HEIGHT * BLACK_KEY_HEIGHT_MULTIPLIER - 2;
      }
      return isWhiteKey
        ? PIANO_HEIGHT
        : PIANO_HEIGHT * BLACK_KEY_HEIGHT_MULTIPLIER;
    })(),
    top: (() => {
      if (colorMode === "flat-chromatic") {
        return 0;
      }
      if (colorMode === "chromatic") {
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

// Add this helper function near the top of the file
const isNoteInMapping = (
  note: number,
  octave: number,
  tonic: number,
  keyboardMapping: KeyboardMapping
): boolean => {
  const absoluteNote = getAbsoluteNote(note, octave, tonic);
  return Object.values(keyboardMapping).some(
    (mapping) =>
      mapping.note === absoluteNote.note &&
      mapping.octave === absoluteNote.octave
  );
};

interface PianoUIProps {
  tonic: number;
  setTonic: (tonic: number) => void;
  colorMode: ColorMode;
  playNotes: (
    note: number,
    octave: number
  ) => Promise<Array<{ note: number; octave: number }>>;
  releaseNotes: (
    note: number,
    octave: number
  ) => Array<{ note: number; octave: number }>;
  fallingNotes: FallingNote[];
  keyboardMapping: KeyboardMapping;
  setActiveKeyCodes: React.Dispatch<React.SetStateAction<Set<string>>>;
  metronomeLines?: MetronomeLine[];
  bpm: number | null;
  metronomeState: MetronomeState;
}

export const PianoUI: React.FC<PianoUIProps> = ({
  tonic,
  setTonic,
  colorMode: initialColorMode,
  playNotes,
  releaseNotes,
  fallingNotes,
  keyboardMapping,
  setActiveKeyCodes,
  metronomeLines,
  bpm,
  metronomeState,
}) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [activeNotes, setActiveNotes] = useState<
    Array<{ note: number; octave: number }>
  >([]);
  const [localColorMode, setLocalColorMode] =
    useState<ColorMode>(initialColorMode);

  useEffect(() => {
    setLocalColorMode(initialColorMode);
  }, [initialColorMode]);

  const isNoteActive = (note: number, octave: number) => {
    return activeNotes.some(
      (activeNote) => activeNote.note === note && activeNote.octave === octave
    );
  };

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      setActiveKeyCodes((prev: Set<string>) => new Set([...prev, event.code]));

      if (event.ctrlKey && event.code in keyboardMapping) {
        const { note } =
          keyboardMapping[event.code as keyof typeof keyboardMapping];
        setTonic(note % 12);
        return;
      }

      if (!activeKeys.has(event.code)) {
        setActiveKeys((prev) => new Set([...prev, event.code]));

        if (event.code in keyboardMapping) {
          const { note, octave } =
            keyboardMapping[event.code as keyof typeof keyboardMapping];
          console.log("[PianoUI] Key press:", {
            keyCode: event.code,
            mappedNote: note,
            mappedOctave: octave,
            tonic,
          });

          const relativeNote = getRelativeNote(note, octave, tonic);
          console.log("[PianoUI] Calculated relative note:", relativeNote);

          await playNotes(relativeNote.note, relativeNote.octave);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setActiveKeyCodes((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(event.code);
        return next;
      });

      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(event.code);
        return next;
      });

      if (event.code in keyboardMapping) {
        const { note, octave } =
          keyboardMapping[event.code as keyof typeof keyboardMapping];
        const relativeNote = getRelativeNote(note, octave, tonic);
        releaseNotes(relativeNote.note, relativeNote.octave);
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
    localColorMode,
    keyboardMapping,
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
    tonic,
    colorMode: localColorMode,
    playNotes,
    releaseNotes,
    keyboardMapping,
  };

  const c1Left = calculateKeyLeftPosition(0, 1, keyWidth, "traditional");
  const c2Left = calculateKeyLeftPosition(0, 2, keyWidth, "traditional");

  // Modify the key rendering logic to only show relevant keys
  const getKeyboardKey = (noteNum: number, octaveNum: number) => {
    const absoluteNote = getAbsoluteNote(noteNum, octaveNum, tonic);

    const matchingKey = Object.entries(keyboardMapping).find(
      ([, value]) =>
        value.note === absoluteNote.note && value.octave === absoluteNote.octave
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
          colorMode={localColorMode}
          onColorModeChange={setLocalColorMode}
          bpm={bpm}
          metronomeState={metronomeState}
        />
        {Object.entries(OCTAVE_RANGES).map(([octave, range]) => {
          const octaveNum = parseInt(octave);
          return Array.from({ length: range.length }, (_, i) => {
            const noteNum = (range.start + i) % 12;
            const isWhiteKey = WHITE_KEYS.includes(noteNum);

            const commonStyleProps = {
              width:
                localColorMode === "flat-chromatic"
                  ? keyWidth * (7 / 12)
                  : keyWidth,
              height: PIANO_HEIGHT,
              borderRadius: "0 0 5px 5px",
            };

            if (
              localColorMode === "flat-chromatic" ||
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
                      localColorMode === "flat-chromatic"
                        ? keyWidth * (7 / 12)
                        : isWhiteKey
                        ? keyWidth
                        : keyWidth - 3,
                    left: calculateKeyLeftPosition(
                      noteNum,
                      octaveNum,
                      keyWidth,
                      localColorMode
                    ),
                    zIndex:
                      localColorMode === "flat-chromatic"
                        ? 1
                        : isWhiteKey
                        ? 1
                        : 2,
                  }}
                />
              );
            }
            return null;
          });
        })}
        <FallingNotes
          notes={fallingNotes}
          tonic={tonic}
          colorMode={localColorMode}
          fallingNoteWidth={(keyWidth / 6) * 7}
          referencePoints={{
            c1: { note: 12, left: c1Left },
            c2: { note: 24, left: c2Left },
          }}
          metronomeLines={metronomeLines || []}
        />
      </div>
    </div>
  );
};
