import * as React from "react";
import { useState, useEffect } from "react";
import { ColorMode } from "./types";

interface TonicPickerProps {
  tonic: number;
  onTonicChange: (tonic: number) => void;
}

interface ColorModeToggleProps {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

interface ControlsProps extends TonicPickerProps, ColorModeToggleProps {}

const TonicPicker: React.FC<TonicPickerProps> = ({ tonic, onTonicChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={pickerRef}
      style={{
        position: "relative",
        cursor: "pointer",
      }}
      onClick={() => setShowPicker(!showPicker)}
    >
      <div style={{ fontSize: "16px", fontWeight: "bold" }}>{notes[tonic]}</div>
      {showPicker && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            transform: "none",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "8px",
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: "4px",
            marginTop: "4px",
            zIndex: 10,
            minWidth: "200px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "4px",
            }}
          >
            {notes.map((note, index) => (
              <div
                key={note}
                onClick={(e) => {
                  e.stopPropagation();
                  onTonicChange(index);
                  setShowPicker(false);
                }}
                onMouseEnter={() => setHoveredNote(index)}
                onMouseLeave={() => setHoveredNote(null)}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  background:
                    tonic === index || hoveredNote === index
                      ? "rgba(255, 255, 255, 0.15)"
                      : "none",
                  border:
                    tonic === index
                      ? "1px solid rgba(255, 255, 255, 0.8)"
                      : "1px solid transparent",
                  borderRadius: "4px",
                  fontSize: "14px",
                  textAlign: "center",
                  fontWeight: tonic === index ? "bold" : "normal",
                  transition: "all 0.1s ease-in-out",
                }}
              >
                {note}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              paddingTop: "8px",
            }}
          >
            Press Ctrl + key to change tonic
          </div>
        </div>
      )}
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

export const PianoControls: React.FC<ControlsProps> = ({
  tonic,
  onTonicChange,
  colorMode,
  onColorModeChange,
}) => (
  <div
    style={{
      position: "absolute",
      top: -30,
      left: 0,
      display: "flex",
      alignItems: "center",
      gap: "40px",
      color: "white",
    }}
  >
    <TonicPicker tonic={tonic} onTonicChange={onTonicChange} />
    <ColorModeToggle
      colorMode={colorMode}
      onColorModeChange={onColorModeChange}
    />
  </div>
);
