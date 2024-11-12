import React, { useState, useEffect } from "react";
import { ColorMode } from "./types";
import { getColors } from "../utils/colors";

const PIXELS_PER_SECOND = 50;
const KEY_HEIGHT = 80;
const ROW_DISTANCE = KEY_HEIGHT * 0.5;

export interface FallingNote {
  id: string;
  note: number;
  octave: number;
  startTime: number;
  endTime: number | null;
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
}

export const FallingNotes: React.FC<FallingNotesProps> = ({
  notes,
  tonic,
  colorMode,
  fallingNoteWidth,
  referencePoints,
}) => {
  const [time, setTime] = useState(Date.now());
  const colors = getColors(tonic, colorMode);

  // Calculate position using linear interpolation
  const calculateNotePosition = (midiNote: number): number => {
    const { c1, c2 } = referencePoints;

    // Linear interpolation formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
    const position =
      c1.left +
      ((midiNote - c1.note) * (c2.left - c1.left)) / (c2.note - c1.note);

    return position;
  };

  // Updated function to generate octave lines for both C and G notes
  const generateOctaveLines = () => {
    const lines = [];
    const startOctave = 0;
    const endOctave = 8;

    for (let octave = startOctave; octave <= endOctave; octave++) {
      // Add C lines (original)
      const cMidiNote = octave * 12 + 12;
      const cLeft = calculateNotePosition(cMidiNote);

      if (!isNaN(cLeft) && isFinite(cLeft)) {
        lines.push(
          <div
            key={`octave-line-c${octave}`}
            style={{
              position: "absolute",
              left: cLeft,
              top: 0,
              width: "1px",
              height: "100%",
              backgroundColor: "rgba(128, 128, 128, 0.6)",
              pointerEvents: "none",
            }}
          />
        );
      }

      // Add G lines (if not the last octave)
      if (octave < endOctave) {
        const gMidiNote = octave * 12 + 19; // G is 7 semitones above C
        const gLeft = calculateNotePosition(gMidiNote);

        if (!isNaN(gLeft) && isFinite(gLeft)) {
          lines.push(
            <div
              key={`octave-line-g${octave}`}
              style={{
                position: "absolute",
                left: gLeft,
                top: 0,
                width: "1px",
                height: "100%",
                backgroundColor: "rgba(128, 128, 128, 0.4)", // lighter gray for G lines
                pointerEvents: "none",
              }}
            />
          );
        }
      }
    }
    return lines;
  };

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
        top: KEY_HEIGHT + ROW_DISTANCE,
        left: 0,
        right: 0,
        bottom: -2000,
        overflow: "hidden",
      }}
    >
      {generateOctaveLines()}
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
              top: top,
              width: fallingNoteWidth,
              height: height,
              backgroundColor: noteColor,
              borderRadius: "10px",
              willChange: "transform, height",
            }}
          />
        );
      })}
    </div>
  );
};
