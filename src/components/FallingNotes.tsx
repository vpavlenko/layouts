import React, { useState, useEffect } from "react";
import { ColorMode } from "./types";
import { COLORS, getColors } from "../utils/colors";
import { PIANO_HEIGHT } from "./PianoUI";

const PIXELS_PER_SECOND = 50;

export interface FallingNote {
  id: string;
  note: number;
  octave: number;
  startTime: number;
  endTime: number | null;
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
}

export const FallingNotes: React.FC<FallingNotesProps> = ({
  notes,
  tonic,
  colorMode,
  fallingNoteWidth,
  referencePoints,
  metronomeLines,
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
    </div>
  );
};
