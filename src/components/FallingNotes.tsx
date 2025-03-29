import React, { useState, useEffect } from "react";
import { ColorMode, MetronomeState } from "./types";
import { COLORS, getColors } from "../utils/colors";
import { PIANO_HEIGHT } from "./PianoUI";
import { Copy, Check, Trash2 } from "lucide-react";

const PIXELS_PER_SECOND = 50;

export interface FallingNote {
  id: string;
  note: number;
  octave: number;
  startTime: number;
  endTime: number | null;
  keyPressed?: string;
}

export interface MetronomeLine {
  id: string;
  timestamp: number;
}

interface FallingNotesProps {
  notes: FallingNote[];
  tonic: number;
  colorMode: ColorMode;
  fallingNoteWidth: number;
  referencePoints: {
    c1: { note: number; left: number };
    c2: { note: number; left: number };
  };
  metronomeLines: MetronomeLine[];
  metronomeState: MetronomeState;
  bpm?: number;
}

// Note duration mapping
const NOTE_DURATIONS = [
  { value: 0.0625, symbol: '"' }, // Sixty-fourth note
  { value: 0.125, symbol: "'" }, // Thirty-second note
  { value: 0.25, symbol: "=" }, // Sixteenth note
  { value: 0.5, symbol: "-" }, // Eighth note
  { value: 1, symbol: "," }, // Quarter note
  { value: 2, symbol: "_" }, // Half note
  { value: 4, symbol: "+" }, // Whole note
];

export const FallingNotes: React.FC<FallingNotesProps> = ({
  notes,
  tonic,
  colorMode,
  fallingNoteWidth,
  referencePoints,
  metronomeLines,
  metronomeState,
  bpm = 60,
}) => {
  const [time, setTime] = useState(Date.now());
  const [keyHistory, setKeyHistory] = useState<string>("");
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [notesInThisChord, setNotesInThisChord] = useState<Set<string>>(
    new Set()
  );
  const [chordStartTime, setChordStartTime] = useState<number | null>(null);

  const colors = getColors(tonic, colorMode);

  // Define the specific order for chord keys
  const CHORD_KEY_ORDER = "asdfghjklqwertyuiop1234567890";

  // Calculate position using linear interpolation
  const calculateNotePosition = (midiNote: number): number => {
    const { c1, c2 } = referencePoints;

    // Linear interpolation formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
    const position =
      c1.left +
      ((midiNote - c1.note) * (c2.left - c1.left)) / (c2.note - c1.note);

    return position;
  };

  // Updated function to generate tonic and fifth lines
  const generateTonicLines = () => {
    const lines = [];
    const startOctave = 0;
    const endOctave = 8;

    for (let octave = startOctave; octave <= endOctave; octave++) {
      // Add tonic lines
      const tonicMidiNote = octave * 12 + tonic + 12; // +12 to start from octave 1
      const tonicLeft = calculateNotePosition(tonicMidiNote);

      if (!isNaN(tonicLeft) && isFinite(tonicLeft)) {
        lines.push(
          <div
            key={`tonic-line-${octave}`}
            style={{
              position: "absolute",
              left: tonicLeft,
              top: 0,
              width: "0.5px",
              height: "100%",
              backgroundColor: COLORS[0],
              pointerEvents: "none",
            }}
          />
        );
      }

      // Add fifth lines (if not the last octave)
      if (octave < endOctave) {
        const fifthMidiNote = octave * 12 + ((tonic + 7) % 12) + 12; // fifth is 7 semitones above tonic
        const fifthLeft = calculateNotePosition(fifthMidiNote);

        if (!isNaN(fifthLeft) && isFinite(fifthLeft)) {
          lines.push(
            <div
              key={`fifth-line-${octave}`}
              style={{
                position: "absolute",
                left: fifthLeft,
                top: 0,
                width: "0.5px",
                height: "100%",
                backgroundColor: COLORS[7],
                pointerEvents: "none",
              }}
            />
          );
        }
      }
    }
    return lines;
  };

  // Render metronome lines
  const renderMetronomeLines = () => {
    return metronomeLines.map((line) => {
      const timeSince = (time - line.timestamp) / 1000;
      const top = timeSince * PIXELS_PER_SECOND;

      return (
        <div
          key={line.id}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: top,
            height: "1px",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            pointerEvents: "none",
          }}
        />
      );
    });
  };

  // Find the closest note duration symbol for a given duration in beats
  const getNoteDurationSymbol = (durationInBeats: number): string => {
    // Sort durations by how close they are to the target duration
    const sortedDurations = [...NOTE_DURATIONS].sort(
      (a, b) =>
        Math.abs(a.value - durationInBeats) -
        Math.abs(b.value - durationInBeats)
    );

    return sortedDurations[0].symbol;
  };

  // Clear the key history
  const handleClear = () => {
    setKeyHistory("");
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keyHistory);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Process notes - track key presses and releases
  useEffect(() => {
    // Maintain active notes as local variable in effect
    const currentActiveNotes = new Map<string, string>();

    // Process new active notes (key down events)
    const newNotes = notes.filter((note) => !note.endTime && note.keyPressed);
    if (newNotes.length > 0) {
      // If this is the first note in a new chord, record the start time
      if (notesInThisChord.size === 0 && newNotes.length > 0) {
        setChordStartTime(Date.now());
      }

      newNotes.forEach((note) => {
        if (note.keyPressed && !currentActiveNotes.has(note.id)) {
          currentActiveNotes.set(note.id, note.keyPressed);

          // Add to the current chord's set of keys
          setNotesInThisChord((prev) => {
            const updated = new Set(prev);
            if (note.keyPressed) {
              updated.add(note.keyPressed);
            }
            return updated;
          });
        }
      });
    }

    // Process released notes (key up events)
    const releasedNotes = notes.filter(
      (note) => note.endTime && note.keyPressed
    );

    if (releasedNotes.length > 0) {
      // Remove the released notes from active notes
      releasedNotes.forEach((note) => {
        currentActiveNotes.delete(note.id);
      });

      // If this was the last note in the chord (no more active notes)
      if (currentActiveNotes.size === 0) {
        // Sort and emit the chord exactly once
        const chordKeysArray = Array.from(notesInThisChord);
        // Sort keys based on their position in CHORD_KEY_ORDER
        chordKeysArray.sort((a, b) => {
          const indexA = CHORD_KEY_ORDER.indexOf(a);
          const indexB = CHORD_KEY_ORDER.indexOf(b);
          return indexA - indexB;
        });
        const sortedChordKeys = chordKeysArray.join("");

        if (sortedChordKeys && metronomeState === "active" && chordStartTime) {
          // Calculate chord duration
          const chordEndTime = Date.now();
          const durationMs = chordEndTime - chordStartTime;

          // Convert to beats based on BPM
          // (BPM = beats per minute, so one beat = 60000/BPM milliseconds)
          const beatDuration = 60000 / (bpm || 60); // Ensure we have a valid BPM
          const durationInBeats = durationMs / beatDuration;

          // Get the appropriate duration symbol
          const durationSymbol = getNoteDurationSymbol(durationInBeats);

          setKeyHistory(
            (prev) => prev + sortedChordKeys + durationSymbol + " "
          );
        } else if (sortedChordKeys) {
          // Use quarter notes if metronome is off or in waiting state
          setKeyHistory((prev) => prev + sortedChordKeys + ", ");
        }

        // Reset for next chord
        setNotesInThisChord(new Set());
        setChordStartTime(null);
      }
    }
  }, [
    notes,
    notesInThisChord,
    metronomeLines,
    bpm,
    chordStartTime,
    metronomeState,
  ]);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setTime(Date.now());
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: PIANO_HEIGHT,
        left: 0,
        right: 0,
        bottom: -2000,
        overflow: "hidden",
      }}
    >
      {generateTonicLines()}
      {renderMetronomeLines()}
      {notes.map((note) => {
        const isActive = !note.endTime;
        const timeSinceEnd = note.endTime ? (time - note.endTime) / 1000 : 0;
        const top = isActive ? 0 : timeSinceEnd * PIXELS_PER_SECOND;

        const duration = isActive
          ? time - note.startTime
          : note.endTime! - note.startTime;
        const height = duration * (PIXELS_PER_SECOND / 1000);

        // Calculate MIDI note number
        const midiNote = note.note + note.octave * 12;
        // Get interpolated position
        const left = calculateNotePosition(midiNote);

        const noteColor =
          colorMode === "traditional" ? "white" : colors[note.note];

        return (
          <div
            key={note.id}
            style={{
              position: "absolute",
              left: left,
              top: 0,
              transform: `translateY(${top}px)`,
              width: fallingNoteWidth,
              height: height,
              backgroundColor: noteColor,
              borderTopLeftRadius: isActive ? "0px" : "10px",
              borderTopRightRadius: isActive ? "0px" : "10px",
              willChange: "transform, height",
            }}
          />
        );
      })}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 1000,
        }}
      >
        <input
          type="text"
          value={keyHistory}
          readOnly
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            fontSize: "14px",
          }}
          placeholder="Key history will appear here..."
        />
        <button
          onClick={handleClear}
          style={{
            padding: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          title="Clear history"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={handleCopy}
          style={{
            padding: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          title="Copy to clipboard"
        >
          {showCopySuccess ? (
            <Check size={16} color="#4CAF50" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>
    </div>
  );
};
