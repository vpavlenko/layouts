import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { playQuarterTone, prepareQuarterTonePiano } from "../audio/quarterTonePiano";
import { scoreSteps } from "../constants/alAtlal";
import "../styles/quarterToneKeyboard.css";

const noteNames = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const letterCodes = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"];
const numberCodes = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"];
const letterLabels = "QWERTYUIOP[]";
const numberLabels = "1234567890-=";
const stepsPerOctave = 24;
const firstOctave = Math.floor(Math.min(...scoreSteps) / stepsPerOctave) - 1;
const lastOctave = Math.floor(Math.max(...scoreSteps) / stepsPerOctave) - 1;
const octaves = Array.from({ length: lastOctave - firstOctave + 1 }, (_, i) => firstOctave + i);
const scorePitches = new Set(scoreSteps);

type Voice = ReturnType<typeof playQuarterTone>;

function pitchName(step: number) {
  const octave = Math.floor(step / stepsPerOctave) - 1;
  const name = noteNames[Math.floor(step % stepsPerOctave / 2)];
  return `${name}${octave}${step % 2 ? " +50¢" : ""}`;
}

export function AlAtlalKeyboard() {
  const [octave, setOctave] = useState(Math.max(firstOctave, Math.min(4, lastOctave)));
  const [activeSteps, setActiveSteps] = useState<Set<number>>(() => new Set());
  const [audioError, setAudioError] = useState(false);
  const inputs = useRef(new Map<string, { step: number; voice: Voice }>());

  useEffect(() => {
    document.title = "Al Atlal · Quarter-tone keyboard";
    prepareQuarterTonePiano(octaves.flatMap((bank) =>
      Array.from({ length: stepsPerOctave }, (_, step) => (bank + 1) * stepsPerOctave + step)
    ));
    return () => { document.title = "Rawl Layouts"; };
  }, []);

  const updateActive = useCallback(() => {
    setActiveSteps(new Set(Array.from(inputs.current.values(), ({ step }) => step)));
  }, []);

  const press = useCallback((input: string, step: number) => {
    inputs.current.get(input)?.voice.cancel();
    setAudioError(false);
    inputs.current.set(input, { step, voice: playQuarterTone(step, () => setAudioError(true)) });
    updateActive();
  }, [updateActive]);

  const release = useCallback((input: string, cancel = false) => {
    const held = inputs.current.get(input);
    if (!held) return;
    if (cancel) held.voice.cancel();
    else held.voice.release();
    inputs.current.delete(input);
    updateActive();
  }, [updateActive]);

  const stopAll = useCallback(() => {
    for (const { voice } of inputs.current.values()) voice.cancel();
    inputs.current.clear();
    updateActive();
  }, [updateActive]);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const letter = letterCodes.indexOf(event.code);
      const number = numberCodes.indexOf(event.code);
      if (letter < 0 && number < 0) return;
      event.preventDefault();
      const step = letter >= 0 ? letter * 2 : number * 2 + 1;
      press(event.code, (octave + 1) * stepsPerOctave + step);
    }
    function keyup(event: KeyboardEvent) {
      release(event.code);
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [octave, press, release]);

  useEffect(() => {
    function visibilityChange() {
      if (document.hidden) stopAll();
    }
    window.addEventListener("blur", stopAll);
    document.addEventListener("visibilitychange", visibilityChange);
    return () => {
      window.removeEventListener("blur", stopAll);
      document.removeEventListener("visibilitychange", visibilityChange);
      stopAll();
    };
  }, [stopAll]);

  return (
    <main className="quarter-keyboard">
      <header className="quarter-header">
        <div>
          <p>Riyad al-Sunbati</p>
          <h1>Al Atlal</h1>
        </div>
        <a href="https://rawl.rocks/f/riyad-al-sunbati-al-atlal">
          Rawl <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>

      <div className="quarter-toolbar">
        <div className="quarter-select" role="group" aria-label="Keyboard octave">
          <span>Octave</span>
          {octaves.map((bank) => (
            <button key={bank} type="button" aria-pressed={octave === bank} onClick={() => setOctave(bank)}>
              {bank}
            </button>
          ))}
        </div>
        <span className="quarter-legend"><i aria-hidden="true" /> Score pitches</span>
      </div>

      <div className="quarter-banks">
        {octaves.map((bank) => (
          <section className="quarter-bank" key={bank} aria-label={`Octave ${bank}`}>
            <span className="quarter-octave" aria-hidden="true">{bank}</span>
            <div className="quarter-keys">
              {noteNames.map((name, pitch) => (
                <div className="quarter-column" key={name}>
                  {[0, 1].map((offset) => {
                    const step = (bank + 1) * stepsPerOctave + pitch * 2 + offset;
                    const label = pitchName(step);
                    const inScore = scorePitches.has(step);
                    const shortcut = (offset ? numberLabels : letterLabels)[pitch];
                    const playing = activeSteps.has(step);
                    return (
                      <button
                        key={step}
                        type="button"
                        className="quarter-key"
                        data-offset={offset}
                        data-accidental={name.length > 1}
                        data-playing={playing}
                        aria-label={label}
                        aria-description={inScore ? "Score pitch" : undefined}
                        aria-keyshortcuts={octave === bank ? shortcut : undefined}
                        title={label}
                        onPointerDown={(event) => {
                          if (event.button !== 0) return;
                          event.currentTarget.setPointerCapture(event.pointerId);
                          press(`pointer:${event.pointerId}`, step);
                        }}
                        onPointerUp={(event) => release(`pointer:${event.pointerId}`)}
                        onPointerCancel={(event) => release(`pointer:${event.pointerId}`, true)}
                        onLostPointerCapture={(event) => release(`pointer:${event.pointerId}`, true)}
                        onClick={(event) => {
                          if (event.detail !== 0) return;
                          press("button", step);
                          release("button");
                        }}
                      >
                        {inScore && <i className="quarter-dot" aria-hidden="true" />}
                        <span className="quarter-note">{name}{offset === 1 && <sup>+50¢</sup>}</span>
                        {octave === bank && <kbd aria-hidden="true">{shortcut}</kbd>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {audioError && <p className="quarter-error" role="status">Audio unavailable</p>}
    </main>
  );
}
