import { RAWL_COLORS, colorIndex } from "librawl/palette";
import { ColorMode } from "../components/types";
import { ChromaticNote } from "../tasks/tasks";
import { KeyboardMapping, ColorKeyboardMapping } from "../constants/keyboard";

export const COLORS = RAWL_COLORS.map(({ background }) => background);

export const getColors = (
  tonic: number,
  colorMode: ColorMode
): { [key: number]: string } => {
  if (colorMode === "traditional") {
    const traditionalColors: { [key: number]: string } = {};
    for (let i = 0; i < 12; i++) {
      traditionalColors[i] = [1, 3, 6, 8, 10].includes(i) ? "#222222" : "white";
    }
    return traditionalColors;
  }

  // Rotate COLORS based on tonic
  const rotatedColors: { [key: number]: string } = {};
  for (let i = 0; i < 12; i++) {
    rotatedColors[i] = COLORS[colorIndex(i - tonic)];
  }
  return rotatedColors;
};

export const getLabelColorForNote = (note: number): string => {
  const chromaticNote = (note % 12) as ChromaticNote;
  const shouldUseDarkText = [0, 4, 6, 9, 11].includes(chromaticNote);
  return shouldUseDarkText ? "black" : "white";
};

/**
 * Converts a note-based keyboard mapping to a color-based mapping
 */
export const convertToColorMapping = (
  mapping: KeyboardMapping,
  tonic: number = 0,
  colorMode: ColorMode = "chromatic"
): ColorKeyboardMapping => {
  const colors = getColors(tonic, colorMode);
  const colorMapping: ColorKeyboardMapping = {};

  Object.entries(mapping).forEach(([keyCode, { note }]) => {
    colorMapping[keyCode] = {
      backgroundColor: colors[note],
      textColor: getLabelColorForNote(note),
    };
  });

  return colorMapping;
};
