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
import { TASK_CONFIGS, getNextTaskId } from "../tasks/tasks";
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

interface TaskState {
  taskId: string;
  progress: number;
  status: "active" | "completing" | "completed";
}

export interface PianoControllerState {
  taskProgress: TaskState[];
  pendingNextTask: string | null;
  activeKeysSize: number;
  sequenceIndices: Record<string, number>;
  taskPlayedNotes: Record<string, Set<string>>;
}

const getActiveTaskId = (
  state: PianoControllerState,
  currentLessonId: number
): string | null => {
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
  const [playbackTimeouts, setPlaybackTimeouts] = useState<number[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [state, setState] = useState<PianoControllerState>({
    taskProgress: [],
    pendingNextTask: null,
    activeKeysSize: 0,
    sequenceIndices: {},
    taskPlayedNotes: {},
  });
  const [taskPlayedNotes, setTaskPlayedNotes] = useState<
    Record<string, Set<string>>
  >(() => {
    // Initialize for all tasks across all lessons
    const allTasks = LESSONS.reduce((acc, lesson) => {
      return [...acc, ...lesson.taskIds];
    }, [] as string[]);

    return allTasks.reduce(
      (acc, taskId) => ({
        ...acc,
        [taskId]: new Set<string>(),
      }),
      {}
    );
  });
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [samplerReady, setSamplerReady] = useState(false);
  const [activeKeyCodes, setActiveKeyCodes] = useState<Set<string>>(new Set());

  // Move resetTaskState inside the component
  const resetTaskState = useCallback((taskId: string) => {
    console.log("[resetTaskState] Resetting state for task:", taskId);
    setState((prev) => ({
      ...prev,
      sequenceIndices: {
        ...prev.sequenceIndices,
        [taskId]: 0,
      },
    }));
    setTaskPlayedNotes((prev) => ({
      ...prev,
      [taskId]: new Set<string>(),
    }));
  }, []);

  // Initialize currentLessonId from URL parameter
  useEffect(() => {
    const parsedId = parseInt(lessonId || "1");
    console.log("[lessonChange] Changing to lesson:", parsedId, {
      currentLessonId,
      lessonId,
    });

    if (!isNaN(parsedId) && LESSONS.some((lesson) => lesson.id === parsedId)) {
      setCurrentLessonId(parsedId);
      const currentLesson = LESSONS.find((l) => l.id === parsedId);
      const taskId = currentLesson?.taskIds[0];

      if (taskId) {
        setState((prev) => ({
          ...prev,
          taskProgress: [
            {
              taskId,
              progress: 0,
              status: "active" as const,
            },
          ],
          pendingNextTask: null,
        }));
      }
    }
  }, [lessonId]);

  // Add effect to sync activeKeysSize
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      activeKeysSize: activeKeys.size,
    }));
  }, [activeKeys.size]);

  const incrementTaskProgress = useCallback(
    (taskId: string, note: number, octave: number) => {
      const taskConfig = TASK_CONFIGS[taskId];
      if (!taskConfig) return;

      const checker = taskConfig.checker;
      const currentIndex = state.sequenceIndices[taskId] || 0;
      const playedNotes = state.taskPlayedNotes[taskId] || new Set();

      // Check if the note matches using the checker's checkNote method
      const matches =
        checker.type === "sequence"
          ? checker.checkNote(note, octave, currentIndex)
          : checker.checkNote(note, octave, playedNotes);

      if (!matches) return;

      // Get current state to determine progress
      const checkerState =
        checker.type === "sequence"
          ? checker.getState(currentIndex)
          : checker.getState(playedNotes);

      const newProgress = checkerState.progress + 1;

      // Update state
      setState((prev) => ({
        ...prev,
        sequenceIndices:
          checker.type === "sequence"
            ? { ...prev.sequenceIndices, [taskId]: currentIndex + 1 }
            : prev.sequenceIndices,
        taskPlayedNotes:
          checker.type === "set"
            ? {
                ...prev.taskPlayedNotes,
                [taskId]: new Set([...playedNotes, `${note}-${octave}`]),
              }
            : prev.taskPlayedNotes,
        taskProgress: prev.taskProgress.map((t) =>
          t.taskId === taskId
            ? {
                ...t,
                progress: newProgress,
                status:
                  newProgress >= taskConfig.total ? "completing" : "active",
              }
            : t
        ),
      }));
    },
    [state]
  );

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

      const activeTaskId = getActiveTaskId(state, currentLessonId);
      if (activeTaskId) {
        incrementTaskProgress(activeTaskId, note, octave);
      }

      console.log("[playNotes] Called with:", { note, octave, tonic });
      console.log("[playNotes] Current state:", {
        taskProgress: state.taskProgress,
        activeKeys: Array.from(activeKeys),
        currentLessonId,
        sequenceIndices: state.sequenceIndices,
        taskPlayedNotes,
      });

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
    [
      samplerReady,
      tonic,
      voicing,
      state.sequenceIndices,
      state.taskProgress,
      currentLessonId,
      activeKeys,
      taskPlayedNotes,
      incrementTaskProgress,
    ]
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

  const stopProgression = useCallback(() => {
    console.log("stopProgression called, current ID:", currentlyPlayingId);
    setCurrentlyPlayingId(null);

    // Get all currently playing notes from falling notes
    const playingNotes = fallingNotes
      .filter((note) => !note.endTime)
      .map(({ note, octave }) => ({ note, octave }));

    console.log("Releasing notes:", playingNotes);

    // Release each note properly through the releaseNotes function
    playingNotes.forEach(({ note, octave }) => {
      releaseNotes(note, octave);
    });

    // Clear all scheduled timeouts
    playbackTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    setPlaybackTimeouts([]);
  }, [playbackTimeouts, fallingNotes, releaseNotes]);

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
        sequenceIndices: {},
        pendingNextTask: null,
      }));

      setTaskPlayedNotes({});
      setCurrentLessonId(lessonId);
      navigate(`${URL_PREFIX}/${lessonId}`);
    },
    [navigate]
  );

  useEffect(() => {
    const handleSpaceKey = (e: KeyboardEvent) => {
      // Only handle space if there's something playing and it's not part of input
      if (
        e.code === "Space" &&
        currentlyPlayingId &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault(); // Prevent page scroll
        stopProgression();
      }
    };

    window.addEventListener("keydown", handleSpaceKey);
    return () => window.removeEventListener("keydown", handleSpaceKey);
  }, [currentlyPlayingId, stopProgression]);

  // Keep the effect for transitioning to next task when keys are released
  useEffect(() => {
    if (state.pendingNextTask && activeKeys.size === 0) {
      console.log(
        "All keys released, finalizing task transition to:",
        state.pendingNextTask
      );
      setState((prev) => ({
        ...prev,
        pendingNextTask: null, // Clear the pending state
      }));
    }
  }, [state.pendingNextTask, activeKeys.size]);

  // Add this effect to initialize new tasks
  useEffect(() => {
    if (state.pendingNextTask) {
      setState((prev) => {
        // Check if task already exists
        const exists = prev.taskProgress.some(
          (t) => t.taskId === state.pendingNextTask
        );
        if (!exists && state.pendingNextTask) {
          // Reset the state of the new task
          resetTaskState(state.pendingNextTask);
          // Initialize the new task
          return {
            ...prev,
            taskProgress: [
              ...prev.taskProgress,
              {
                taskId: state.pendingNextTask,
                progress: 0,
                status: "active",
              } as TaskState,
            ],
          };
        }
        return prev;
      });
    }
  }, [state.pendingNextTask]);

  // Get the current active task ID
  const currentActiveTaskId = getActiveTaskId(state, currentLessonId);

  // Add this effect to reset taskPlayedNotes when lesson changes
  useEffect(() => {
    console.log("[taskPlayedNotes] Resetting for lesson:", currentLessonId);
    const currentLesson = LESSONS.find((l) => l.id === currentLessonId);
    if (currentLesson) {
      setTaskPlayedNotes((prev) => {
        const newState = { ...prev };
        currentLesson.taskIds.forEach((taskId) => {
          newState[taskId] = new Set<string>();
        });
        return newState;
      });
    }
  }, [currentLessonId]);

  // Add this effect near other effects in PianoController
  useEffect(() => {
    console.log("[activeKeys effect] Size changed:", {
      size: activeKeys.size,
      completingTask: state.taskProgress.find((t) => t.status === "completing")
        ?.taskId,
    });

    // If we have no active keys and a completing task, it's time to complete
    if (activeKeys.size === 0) {
      const completingTask = state.taskProgress.find(
        (t) => t.status === "completing"
      );
      if (completingTask) {
        console.log(
          "[activeKeys effect] Completing task:",
          completingTask.taskId
        );

        setState((prev) => {
          const nextTaskId = getNextTaskId(completingTask.taskId);
          return {
            ...prev,
            taskProgress: prev.taskProgress.map((t) =>
              t.taskId === completingTask.taskId
                ? { ...t, status: "completed" }
                : t
            ),
            pendingNextTask: nextTaskId,
          };
        });
      }
    }
  }, [activeKeys.size]); // Only depend on activeKeys.size

  const handleSkipTask = useCallback((taskId: string) => {
    setState((prev) => {
      const nextTaskId = getNextTaskId(taskId);
      return {
        ...prev,
        taskProgress: prev.taskProgress.map((t) =>
          t.taskId === taskId
            ? {
                ...t,
                status: "completed",
                progress: TASK_CONFIGS[taskId].total,
              }
            : t
        ),
        pendingNextTask: nextTaskId,
      };
    });
  }, []);

  // Add this effect to initialize sequenceCheckers when tasks change
  useEffect(() => {
    console.log(
      "[sequenceCheckers] Initializing for active task:",
      currentActiveTaskId
    );
    if (currentActiveTaskId) {
      const taskConfig = TASK_CONFIGS[currentActiveTaskId];
      if (taskConfig?.checker.type === "sequence") {
        setState((prev) => {
          // Only initialize if not already present
          if (
            typeof prev.sequenceIndices[currentActiveTaskId] === "undefined"
          ) {
            console.log(
              "[sequenceCheckers] Initializing new sequence checker for:",
              currentActiveTaskId
            );
            return {
              ...prev,
              sequenceIndices: {
                ...prev.sequenceIndices,
                [currentActiveTaskId]: 0,
              },
            };
          }
          return prev;
        });
      }
    }
  }, [currentActiveTaskId]);

  return (
    <>
      <LessonsPanel
        currentLessonId={currentLessonId}
        onLessonChange={handleLessonChange}
        taskProgress={state.taskProgress}
        activeTaskId={currentActiveTaskId}
        onSkipTask={handleSkipTask}
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
          currentlyPlayingId={currentlyPlayingId}
          onStopPlaying={stopProgression}
          taskKeyboardMapping={
            currentActiveTaskId
              ? TASK_CONFIGS[currentActiveTaskId]?.keyboardMapping
              : undefined
          }
          activeTaskId={currentActiveTaskId}
          taskProgress={state.taskProgress}
          taskPlayedNotes={state.taskPlayedNotes}
          state={state}
          setActiveKeyCodes={setActiveKeyCodes}
        />
      )}
    </>
  );
};
