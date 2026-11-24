import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, MouseEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { playQanunPitch, prepareQanun, stopQanun } from "../audio/quarterToneQanun";
import { scoreSteps } from "../constants/alAtlal";
import { KEY_DISPLAY_LABELS } from "../constants/keyboard";
import { KEYBOARD_ROWS } from "../tasks/tasks";
import { COLORS } from "../utils/colors";
import { QuarterToneFall, trailLifetime } from "./QuarterToneFall";
import type { PlayedPitch } from "./QuarterToneFall";
import "../styles/quarterToneKeyboard.css";

const noteNames = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const scoreUrl = "https://rawl.rocks/f/riyad-al-sunbati-al-atlal";
const stepsPerOctave = 24;
// E half-flat, F half-sharp, A half-flat, and B half-flat.
const repertoireQuartertones = new Set([7, 11, 17, 21]);
const concertOctave = 4;
const lastOctave = Math.floor(Math.max(...scoreSteps) / stepsPerOctave) - 1;
const octaves = Array.from({ length: lastOctave - concertOctave + 1 }, (_, i) => concertOctave + i);
// C4, G3, D3, A2, F2, C2 in quartertone steps relative to the highest course.
const openStrings = [0, -10, -20, -30, -38, -48];
const lowerStringOffset = 2;
const stringKeys = KEYBOARD_ROWS.map((row, index) =>
  (index === 0 ? [...row, "Backspace"] : row).map((code, position) => ({
    code,
    label: KEY_DISPLAY_LABELS[code]?.toUpperCase() ?? "⌫",
    row: index,
    position,
  }))
);
const keysByCode = new Map(stringKeys.flat().map((key) => [key.code, key]));
const lowestOpen = openStrings[openStrings.length - 1];
const firstStep = (concertOctave + 1) * stepsPerOctave + lowestOpen;
const lastStep = (lastOctave + 1) * stepsPerOctave + stringKeys[0].length - 1;
const pitchSteps = Array.from({ length: lastStep - firstStep + 1 }, (_, i) => firstStep + i);
const octaveStarts = pitchSteps.filter((step) => step % stepsPerOctave === 0);

function stringPitch(row: number, position: number, lower: boolean) {
  return openStrings[row + (lower ? lowerStringOffset : 0)] + position;
}

// The score's Rawl analysis sets D as the reference for these colors.
const defaultTonic = 4;
const darkLabel = [true, false, true, false, true, false, true, true, false, true, true, true];
const darkQuarterLabel = [true, false, false, true, true, true, true, false, false, true, true, true];

function styleForStep(step: number, tonic: number): CSSProperties {
  const relativeStep = (step - tonic) % stepsPerOctave;
  const pitchClass = Math.floor(relativeStep / 2);
  const lower = COLORS[pitchClass];
  const upper = COLORS[(pitchClass + 1) % 12];
  const quarter = relativeStep % 2 === 1;
  const dark = (quarter ? darkQuarterLabel : darkLabel)[pitchClass];
  return {
    "--pitch-color": quarter ? `color-mix(in srgb, ${lower} 50%, ${upper})` : lower,
    "--pitch-ink": dark ? "#000" : "#fff",
    "--pitch-position": `${100 * (step - firstStep + 1) / (pitchSteps.length + 1)}%`,
  } as CSSProperties;
}

function pitchName(step: number) {
  const octave = Math.floor(step / stepsPerOctave) - 1;
  const name = noteNames[Math.floor(step % stepsPerOctave / 2)];
  return `${name}${octave}${step % 2 ? " +50¢" : ""}`;
}

type PlayedNote = PlayedPitch & { keyCode?: string };

export function AlAtlalKeyboard() {
  const [octave, setOctave] = useState(concertOctave);
  const [lowerStrings, setLowerStrings] = useState(false);
  const [tonic, setTonic] = useState(defaultTonic);
  const [notes, setNotes] = useState<PlayedNote[]>([]);
  const [audioError, setAudioError] = useState(false);
  const inputs = useRef(new Map<string, { id: number; cancel: () => void }>());
  const nextNote = useRef(0);
  const firstSelectedStep = (octave + 1) * stepsPerOctave;
  const activeNotes = notes.filter(({ endedAt }) => endedAt === null);
  const activeKeys = new Map(activeNotes.map(({ keyCode, step }) => [keyCode, step]));

  useEffect(() => {
    document.title = "Arabic oud";
    prepareQanun(pitchSteps);
    return () => { document.title = "Rawl Layouts"; };
  }, []);

  const press = useCallback((input: string, step: number, keyCode?: string) => {
    const previous = inputs.current.get(input);
    previous?.cancel();
    const now = performance.now();
    const id = nextNote.current++;
    setAudioError(false);
    inputs.current.set(input, { id, cancel: playQanunPitch(step, () => setAudioError(true)) });
    setNotes((current) => [
      ...current.filter((note) => note.endedAt === null || now - note.endedAt < trailLifetime)
        .map((note) => note.id === previous?.id ? { ...note, endedAt: now } : note),
      { id, step, startedAt: now, endedAt: null, keyCode },
    ]);
  }, []);

  const release = useCallback((input: string, cancel = false) => {
    const held = inputs.current.get(input);
    if (!held) return;
    if (cancel) held.cancel();
    inputs.current.delete(input);
    const now = performance.now();
    setNotes((current) => current.map((note) => note.id === held.id ? { ...note, endedAt: now } : note));
  }, []);

  const stopAll = useCallback(() => {
    stopQanun();
    inputs.current.clear();
    setLowerStrings(false);
    const now = performance.now();
    setNotes((current) => current.map((note) => note.endedAt === null ? { ...note, endedAt: now } : note));
  }, []);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }
      if (event.repeat) return;
      setLowerStrings(event.shiftKey);
      if (event.code === "ArrowUp" || event.code === "ArrowDown") {
        event.preventDefault();
        const delta = event.code === "ArrowUp" ? 1 : -1;
        setOctave((value) => Math.min(lastOctave, Math.max(concertOctave, value + delta)));
        return;
      }
      const key = keysByCode.get(event.code);
      if (!key) return;
      event.preventDefault();
      const step = stringPitch(key.row, key.position, event.shiftKey);
      press(event.code, firstSelectedStep + step, event.code);
    }
    function keyup(event: KeyboardEvent) {
      setLowerStrings(event.shiftKey);
      release(event.code);
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [firstSelectedStep, press, release]);

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

  function noteHandlers(step: number, keyCode?: string) {
    return {
      onPointerDown(event: PointerEvent<HTMLButtonElement>) {
        if (event.button !== 0 || event.metaKey) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        press(`pointer:${event.pointerId}`, step, keyCode);
      },
      onPointerUp: (event: PointerEvent) => release(`pointer:${event.pointerId}`),
      onPointerCancel: (event: PointerEvent) => release(`pointer:${event.pointerId}`, true),
      onLostPointerCapture: (event: PointerEvent) => release(`pointer:${event.pointerId}`, true),
      onClick(event: MouseEvent) {
        if (event.metaKey) {
          setTonic(step % stepsPerOctave);
          return;
        }
        if (event.detail !== 0) return;
        press("button", step, keyCode);
        release("button");
      },
    };
  }

  return (
    <main className="quarter-keyboard">
      <div className="quarter-instrument" style={{ "--lane": `${100 / (pitchSteps.length + 1)}%` } as CSSProperties}>
        <header className="quarter-header">
          <h1>Arabic oud</h1>
          <div className="quarter-header-links">
            <a href={`${import.meta.env.BASE_URL}kanun-sources.txt`}>Kanun credits</a>
            <a href={scoreUrl}>
              Rawl <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </header>

        <div className="quarter-toolbar">
          <div className="quarter-controls">
            <div className="quarter-select" role="group" aria-label="Keyboard octave">
              <span>Octave</span>
              {octaves.map((bank) => (
                <button key={bank} type="button" aria-pressed={octave === bank} onClick={() => setOctave(bank)}>
                  {bank}
                </button>
              ))}
            </div>
            <div className="quarter-shortcuts">
              <span title="Lower strings"><kbd>Shift</kbd> ↓↓</span>
              <span><kbd>Cmd+click</kbd> changes tonic</span>
            </div>
          </div>
          <div className="quarter-key-layout" role="group" aria-label="Oud strings">
            {stringKeys.map((keys, row) => {
              const openName = pitchName(firstSelectedStep + stringPitch(row, 0, lowerStrings));
              return (
                <div className="quarter-string" key={row} role="group" aria-label={openName}>
                  <span className="quarter-string-note" aria-hidden="true">{openName}</span>
                  <div className="quarter-key-row">
                    {keys.map(({ code, label, position }) => {
                      const heldPitch = activeKeys.get(code);
                      const pitch = firstSelectedStep + stringPitch(row, position, lowerStrings);
                      const shownPitch = heldPitch ?? pitch;
                      const quartertone = shownPitch % 2 === 1;
                      return (
                        <button
                          className="quarter-layout-key"
                          key={code}
                          type="button"
                          aria-label={code === "Backspace" ? code : undefined}
                          title={pitchName(shownPitch)}
                          style={styleForStep(shownPitch, tonic)}
                          data-playing={heldPitch !== undefined}
                          data-uncommon={quartertone && !repertoireQuartertones.has(shownPitch % stepsPerOctave)}
                          {...noteHandlers(pitch, code)}
                        >
                          {label}
                          {quartertone && <i className="quarter-layout-dot" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {audioError && <p className="quarter-error" role="status">Audio unavailable</p>}
        <QuarterToneFall notes={notes} styleForStep={(step) => styleForStep(step, tonic)} octaveStarts={octaveStarts} />
      </div>
      <iframe className="quarter-score" src={scoreUrl} title="Al Atlal" tabIndex={-1} allow="autoplay; fullscreen" />
    </main>
  );
}
