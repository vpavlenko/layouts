import React, { useEffect, useRef, useCallback } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import {
  KEY_DISPLAY_LABELS,
  ColorKeyboardMapping,
} from "../constants/keyboard";

interface KeyboardState {
  activeKeyCodes: Set<string>;
  colorKeyboardMapping: ColorKeyboardMapping;
}

interface LayoutProps {
  keyboardState: KeyboardState;
  showLabels?: boolean;
}

const KEYBOARD_LAYOUT = {
  default: [
    "1 2 3 4 5 6 7 8 9 0 - =",
    "q w e r t y u i o p [ ]",
    "a s d f g h j k l ; '",
    "z x c v b n m , . /",
  ],
};

const generateId = () => Math.random().toString(36).substring(2, 10);

export const Layout: React.FC<LayoutProps> = ({
  keyboardState,
  showLabels = true,
}) => {
  const uid = useRef(generateId());
  const keyboardRef = useRef<HTMLDivElement>(null);
  const styleSheetRef = useRef<HTMLStyleElement | null>(null);

  // Create a single stylesheet for all keyboard styles
  const createStyleSheet = useCallback(
    (colorMapping: ColorKeyboardMapping) => {
      if (!styleSheetRef.current) {
        styleSheetRef.current = document.createElement("style");
        styleSheetRef.current.id = "piano-keyboard-styles";
        document.head.appendChild(styleSheetRef.current);
      }

      let css = "";

      // Add base styles for when labels should be hidden
      if (!showLabels) {
        css += `
        .keyboard-${uid.current} .simple-keyboard-base .hg-button {
          font-size: 0 !important;
        }
      `;
      }

      Object.entries(colorMapping).forEach(
        ([keyCode, { backgroundColor, textColor }]) => {
          css += `
        .keyboard-${uid.current} .simple-keyboard-base .hg-button.${keyCode}-mapped {
          background: ${backgroundColor} !important;
          color: ${textColor} !important;
          transform: scale(1);
          transition: transform 0.1s ease-in-out;
        }
      `;

          css += `
        .keyboard-${uid.current} .simple-keyboard-base .hg-button.${keyCode}-mapped.hg-active {
          transform: scale(0.8) !important;
        }
      `;
        }
      );

      // Add styles for unmapped keys
      Object.keys(KEY_DISPLAY_LABELS).forEach((keyCode) => {
        if (!colorMapping[keyCode]) {
          css += `
          .keyboard-${uid.current} .simple-keyboard-base .hg-button.${keyCode}-mapped {
            background: #000 !important;
            color: #000 !important;
          }
        `;
        }
      });

      styleSheetRef.current.textContent = css;

      console.log("Applied keyboard styles:", {
        mappingSize: Object.keys(colorMapping).length,
        cssLength: css.length,
        sampleStyle: css.split("}")[0] + "}",
      });
    },
    [showLabels]
  );

  // Apply styles when mapping changes
  useEffect(() => {
    if (Object.keys(keyboardState.colorKeyboardMapping).length > 0) {
      createStyleSheet(keyboardState.colorKeyboardMapping);
    }

    // Cleanup
    return () => {
      if (styleSheetRef.current) {
        styleSheetRef.current.remove();
        styleSheetRef.current = null;
      }
    };
  }, [keyboardState.colorKeyboardMapping, createStyleSheet]);

  // Function to get button themes
  const getButtonTheme = useCallback(() => {
    if (Object.keys(keyboardState.colorKeyboardMapping).length === 0) return [];

    return Object.entries(KEY_DISPLAY_LABELS).map(([keyCode, label]) => ({
      class: `${keyCode}-mapped${
        keyboardState.activeKeyCodes.has(keyCode) ? " hg-active" : ""
      }`,
      buttons: label.toLowerCase(),
    }));
  }, [keyboardState.activeKeyCodes, keyboardState.colorKeyboardMapping]);

  // Function to get display mapping
  const getDisplay = useCallback(() => {
    const keys = "1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./";
    const display: Record<string, string> = {};
    keys.split("").forEach((key) => {
      display[key] = showLabels ? key : "";
    });
    return display;
  }, [showLabels]);

  return (
    <div className={`w-[290px] keyboard-${uid.current}`} ref={keyboardRef}>
      <Keyboard
        layout={KEYBOARD_LAYOUT}
        display={getDisplay()}
        buttonTheme={getButtonTheme()}
        mergeDisplay={true}
        physicalKeyboardHighlight={false}
        physicalKeyboardHighlightPress={false}
        useButtonTag={true}
        disableButtonHold={true}
        preventMouseDownDefault={true}
        baseClass="simple-keyboard-base"
        theme="hg-theme-default custom-theme"
      />
    </div>
  );
};
