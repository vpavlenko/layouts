import * as React from "react";
import { useState } from "react";
import { ColorMode, MetronomeState } from "./types";

interface TonicPickerProps {
  tonic: number;
  onTonicChange: (tonic: number) => void;
}

interface ColorModeToggleProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

interface ControlsProps extends TonicPickerProps, ColorModeToggleProps {
  bpm: number | null;
  metronomeState: MetronomeState;
}

const TonicPicker: React.FC<TonicPickerProps> = ({ tonic, onTonicChange }) => {
  const [hoveredNote, setHoveredNote] = useState<number | null>(null);
  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Calculate positions for black keys
  const blackKeyIndices = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

  return (
    <div
      style={{
        position: "relative",
        height: "30px",
        width: "180px",
        display: "flex",
      }}
    >
      {/* White keys first */}
      {notes.map((note, index) => {
        const isSharp = note.includes("#");
        if (isSharp) return null;

        return (
          <div
            key={note}
            onClick={() => onTonicChange(index)}
            onMouseEnter={() => setHoveredNote(index)}
            onMouseLeave={() => setHoveredNote(null)}
            style={{
              flex: 1,
              height: "100%",
              backgroundColor: hoveredNote === index ? "#ddd" : "#fff",
              border: "1px solid #000",
              borderRadius: "0 0 3px 3px",
              cursor: "pointer",
              transition: "all 0.1s ease-in-out",
              position: "relative",
              marginRight: "-1px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: tonic === index ? "bold" : "normal",
              color: "#000",
            }}
          >
            {tonic === index && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                }}
              >
                {note}
              </div>
            )}
          </div>
        );
      })}

      {/* Black keys overlay */}
      {blackKeyIndices.map((index) => (
        <div
          key={notes[index]}
          onClick={() => onTonicChange(index)}
          onMouseEnter={() => setHoveredNote(index)}
          onMouseLeave={() => setHoveredNote(null)}
          style={{
            position: "absolute",
            width: "16px",
            height: "20px",
            backgroundColor: hoveredNote === index ? "#666" : "#000",
            border: "1px solid #000",
            borderRadius: "0 0 3px 3px",
            cursor: "pointer",
            zIndex: 1,
            left: `${(index * 180) / 12}px`,
            transition: "all 0.1s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "#fff",
          }}
        >
          {tonic === index && notes[index]}
        </div>
      ))}
    </div>
  );
};

const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  colorMode,
  onColorModeChange,
}) => {
  const nextMode = {
    traditional: "chromatic",
    chromatic: "flat-chromatic",
    "flat-chromatic": "traditional",
  } as const;

  return (
    <div
      onClick={() => onColorModeChange(nextMode[colorMode])}
      style={{
        width: "80px",
        height: "20px",
        backgroundColor:
          colorMode === "traditional" ? "rgba(255, 255, 255, 0.2)" : "#4CAF50",
        borderRadius: "10px",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 1s ease-in-out",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "1px",
          left:
            colorMode === "traditional"
              ? "1px"
              : colorMode === "chromatic"
              ? "31px"
              : "61px",
          transition: "left 1s ease-in-out",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {colorMode !== "traditional" && (
          <span
            role="img"
            aria-label="rainbow"
            style={{
              fontSize: "12px",
              userSelect: "none",
            }}
          >
            🌈
          </span>
        )}
      </div>
    </div>
  );
};

// Update the BpmDisplay props to include metronome state
interface BpmDisplayProps {
  bpm: number | null;
  metronomeState: MetronomeState;
}

const BpmDisplay: React.FC<BpmDisplayProps> = ({ bpm, metronomeState }) => {
  const style = {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
  };

  switch (metronomeState) {
    case "off":
      return <div style={style}>press Space to start metronome</div>;

    case "waiting_for_bpm":
      return <div style={style}>press Space to set BPM</div>;

    case "active":
      return <div style={style}>{bpm} BPM. press Space to disable</div>;
  }
};

export const PianoControls: React.FC<ControlsProps> = ({
  tonic,
  onTonicChange,
  colorMode,
  onColorModeChange,
  bpm,
  metronomeState,
}) => (
  <div
    style={{
      position: "absolute",
      top: -30,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "white",
      padding: "0 20px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
      <TonicPicker tonic={tonic} onTonicChange={onTonicChange} />
      <ColorModeToggle
        colorMode={colorMode}
        onColorModeChange={onColorModeChange}
      />
    </div>

    <BpmDisplay bpm={bpm} metronomeState={metronomeState} />
  </div>
);
