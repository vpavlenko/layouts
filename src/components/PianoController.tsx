import React, { useState, useCallback } from "react";
import { PianoUI } from "./PianoUI";
import { Voicing } from "../constants/voicings";
import { ColorMode } from "./types";
import { VOICINGS } from "../constants/voicings";
import { sampler } from "../audio/sampler";
import { ScaleMode } from "../constants/scales";
import { FallingNote } from "./FallingNotes";
import { ControlPanel } from "./ControlPanel";
import { ChordProgression } from "../constants/progressions";

const NOTE_NAMES = [
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
] as const;

const START_OCTAVE = 0;

const LOWEST_NOTE = 21; // A0
const HIGHEST_NOTE = 108; // C8

const getFallingNotePosition = (
  note: number,
  octave: number,
  startOctave: number
) => {
  const semitonesFromC0 = (octave - startOctave) * 12 + note;
  return (semitonesFromC0 * (25 * 7)) / 6 / 2 + -125;
};

export const PianoController: React.FC = () => {
  const [tonic, setTonic] = useState<number>(0);
  const [voicing, setVoicing] = useState<Voicing>("single");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("major");
  const [colorMode, setColorMode] = useState<ColorMode>("chromatic");
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [isProgressionPlaying, setIsProgressionPlaying] = useState(false);

  const playNotes = useCallback(
    async (note: number, octave: number) => {
      const relativeNote = (note - tonic + 12) % 12;
      const notesToPlay = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

      const playedNotes = notesToPlay.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerAttack(noteString);

        // Create falling note
        const newNote: FallingNote = {
          id: `${absoluteNote}-${o}-${Date.now()}`,
          note: absoluteNote,
          octave: o,
          startTime: Date.now(),
          endTime: null,
          left: getFallingNotePosition(absoluteNote, o, START_OCTAVE),
        };

        setFallingNotes((prev) => [...prev, newNote]);

        return { note: absoluteNote, octave: o };
      });

      return playedNotes;
    },
    [tonic, voicing, scaleMode]
  );

  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      const relativeNote = (note - tonic + 12) % 12;
      const notesToRelease = VOICINGS[voicing].getNotes(
        relativeNote,
        octave,
        scaleMode
      );

      const releasedNotes = notesToRelease.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerRelease(noteString);

        // Update falling notes
        setFallingNotes((prev) =>
          prev.map((n) => {
            if (n.note === absoluteNote && n.octave === o && !n.endTime) {
              return { ...n, endTime: Date.now() };
            }
            return n;
          })
        );

        return { note: absoluteNote, octave: o };
      });

      return releasedNotes;
    },
    [tonic, voicing, scaleMode]
  );

  const stopProgression = useCallback(() => {
    setIsProgressionPlaying(false);
    // Release all currently playing notes
    sampler.releaseAll();
  }, []);

  const playNoteSequence = useCallback(
    async (
      sequence: Array<{ note: number; octave: number; duration: number }>,
      stopOngoing = true
    ) => {
      if (isProgressionPlaying && stopOngoing) {
        stopProgression();
      }

      setIsProgressionPlaying(true);

      try {
        for (const { note, octave, duration } of sequence) {
          await playNotes(note, octave);
          await new Promise((resolve) => setTimeout(resolve, duration));
          releaseNotes(note, octave);
          await new Promise((resolve) => setTimeout(resolve, 10)); // Small gap between notes
        }
      } catch (error) {
        console.error("Error playing sequence:", error);
      } finally {
        setIsProgressionPlaying(false);
      }
    },
    [playNotes, releaseNotes, isProgressionPlaying, stopProgression]
  );

  const playFullRange = useCallback(async () => {
    const sequence = [];
    for (let midiNote = LOWEST_NOTE; midiNote <= HIGHEST_NOTE; midiNote++) {
      const octave = Math.floor(midiNote / 12) - 1;
      const note = midiNote % 12;
      sequence.push({ note, octave, duration: 100 });
    }
    await playNoteSequence(sequence);
  }, [playNoteSequence]);

  const playProgression = useCallback(
    async (progression: ChordProgression) => {
      if (isProgressionPlaying) return;

      const sequence = progression.chords.map((chord) => ({
        note: chord,
        octave: 3,
        duration: 1000,
      }));

      await playNoteSequence(sequence);
    },
    [playNoteSequence]
  );

  return (
    <>
      <ControlPanel
        currentVoicing={voicing}
        onVoicingChange={setVoicing}
        currentScaleMode={scaleMode}
        onScaleModeChange={setScaleMode}
        currentColorMode={colorMode}
        onColorModeChange={setColorMode}
        onPlayProgression={playProgression}
        onStopProgression={stopProgression}
        isProgressionPlaying={isProgressionPlaying}
        onPlayFullRange={playFullRange}
      />
      <PianoUI
        tonic={tonic}
        setTonic={setTonic}
        scaleMode={scaleMode}
        colorMode={colorMode}
        playNotes={playNotes}
        releaseNotes={releaseNotes}
        fallingNotes={fallingNotes}
      />
    </>
  );
};