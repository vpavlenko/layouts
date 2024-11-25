import React, { useState, useCallback, useEffect } from "react";
import { PianoUI } from "./PianoUI";
import { Voicing } from "../constants/voicings";
import { ColorMode } from "./types";
import { VOICINGS } from "../constants/voicings";
import { sampler } from "../audio/sampler";
import { FallingNote } from "./FallingNotes";
import { LessonsPanel } from "./LessonsPanel";
import { immediate } from "tone";
import { useParams, useNavigate } from "react-router-dom";
import { LESSONS } from "../data/lessons";
import { URL_PREFIX } from "../constants/routes";
import { TASK_CONFIGS } from "../tasks/tasks";
import { ensureSamplerLoaded } from "../audio/sampler";

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

export interface PianoControllerState {
  activeKeysSize: number;
}

const getActiveTaskId = (currentLessonId: number): string | null => {
  const currentLesson = LESSONS.find((l) => l.id === currentLessonId);
  if (!currentLesson || !currentLesson.taskIds.length) return null;
  return currentLesson.taskIds[0];
};

export const PianoController: React.FC = () => {
  const [tonic, setTonic] = useState<number>(0);
  const [voicing, setVoicing] = useState<Voicing>("single");
  const [colorMode, setColorMode] = useState<ColorMode>("chromatic");
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [state, setState] = useState<PianoControllerState>({
    activeKeysSize: 0,
  });
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [samplerReady, setSamplerReady] = useState(false);
  const [activeKeyCodes, setActiveKeyCodes] = useState<Set<string>>(new Set());

  // Initialize currentLessonId from URL parameter
  useEffect(() => {
    const parsedId = parseInt(lessonId || "1");
    console.log("[lessonChange] Changing to lesson:", parsedId, {
      currentLessonId,
      lessonId,
    });

    if (!isNaN(parsedId) && LESSONS.some((lesson) => lesson.id === parsedId)) {
      setCurrentLessonId(parsedId);
    }
  }, [lessonId]);

  // Add effect to sync activeKeysSize
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      activeKeysSize: activeKeys.size,
    }));
  }, [activeKeys.size]);

  // Move sampler loading to an earlier useEffect
  useEffect(() => {
    const loadSampler = async () => {
      await ensureSamplerLoaded();
      setSamplerReady(true);
    };

    loadSampler();
  }, []);

  // Update playNotes to handle loading state
  const playNotes = useCallback(
    async (note: number, octave: number) => {
      if (!samplerReady) return [];

      const relativeNote = (note - tonic + 12) % 12;
      console.log("Calculated relative note:", relativeNote);

      const notesToPlay = VOICINGS[voicing].getNotes(relativeNote, octave);
      console.log("Notes to play:", notesToPlay);

      // Play the notes
      const playedNotes = notesToPlay.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerAttack(noteString, immediate());

        // Create falling note
        const newNote: FallingNote = {
          id: `${absoluteNote}-${o}-${Date.now()}`,
          note: absoluteNote,
          octave: o,
          startTime: Date.now(),
          endTime: null,
        };

        setFallingNotes((prev) => [...prev, newNote]);

        return { note: absoluteNote, octave: o };
      });

      // Add to active keys
      setActiveKeys((prev) => new Set([...prev, `${note}-${octave}`]));

      return playedNotes;
    },
    [samplerReady, tonic, voicing]
  );

  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      const noteKey = `${note}-${octave}`;
      console.log(
        `[releaseNotes] Releasing ${noteKey}, active keys: ${activeKeys.size}`
      );

      // Remove from active keys
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(`${note}-${octave}`);
        return next;
      });

      // Handle note release logic
      const relativeNote = (note - tonic + 12) % 12;
      const notesToRelease = VOICINGS[voicing].getNotes(relativeNote, octave);

      return notesToRelease.map(({ note: n, octave: o }) => {
        const absoluteNote = (n + tonic) % 12;
        const noteString = `${NOTE_NAMES[absoluteNote]}${o}`;
        sampler.triggerRelease(noteString);

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
    },
    [tonic, voicing]
  );

  const handleLessonChange = useCallback(
    (lessonId: number) => {
      console.log("[lessonChange] Changing to lesson:", lessonId);
      const currentLesson = LESSONS.find((l) => l.id === lessonId);
      if (!currentLesson) return;

      // Get the last task ID for this lesson
      const lastTaskId =
        currentLesson.taskIds[currentLesson.taskIds.length - 1];

      // Reset states but mark the last task as completed if it exists
      setState((prev) => ({
        ...prev,
        taskProgress: lastTaskId
          ? [
              {
                taskId: lastTaskId,
                progress: TASK_CONFIGS[lastTaskId]?.total || 0,
                status: "completed",
              },
            ]
          : [],
      }));

      setCurrentLessonId(lessonId);
      navigate(`${URL_PREFIX}/${lessonId}`);
    },
    [navigate]
  );

  // Get the current active task ID
  const currentActiveTaskId = getActiveTaskId(currentLessonId);

  return (
    <>
      <LessonsPanel
        currentLessonId={currentLessonId}
        onLessonChange={handleLessonChange}
        keyboardState={{
          activeKeyCodes,
          taskKeyboardMapping: currentActiveTaskId
            ? TASK_CONFIGS[currentActiveTaskId]?.keyboardMapping
            : undefined,
        }}
      />
      {!samplerReady ? (
        <div className="fixed top-0 left-[600px] right-0 bottom-0 bg-black flex items-center justify-center text-white">
          Loading piano sounds...
        </div>
      ) : (
        <PianoUI
          tonic={tonic}
          setTonic={setTonic}
          colorMode={
            currentActiveTaskId
              ? TASK_CONFIGS[currentActiveTaskId]?.colorMode || colorMode
              : colorMode
          }
          onColorModeChange={setColorMode}
          currentVoicing={voicing}
          onVoicingChange={setVoicing}
          playNotes={playNotes}
          releaseNotes={releaseNotes}
          fallingNotes={fallingNotes}
          taskKeyboardMapping={
            currentActiveTaskId
              ? TASK_CONFIGS[currentActiveTaskId]?.keyboardMapping
              : undefined
          }
          activeTaskId={currentActiveTaskId}
          state={state}
          setActiveKeyCodes={setActiveKeyCodes}
        />
      )}
    </>
  );
};
