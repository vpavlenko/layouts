import React, { useState, useCallback, useEffect } from "react";
import { PianoUI } from "./PianoUI";
import { sampler } from "../audio/sampler";
import { FallingNote } from "./FallingNotes";
import { TaskPanel } from "./TaskPanel";
import { immediate } from "tone";
import { useParams, useNavigate } from "react-router-dom";
import { TASK_CONFIGS, TaskConfig } from "../tasks/tasks";
import {
  ensureSamplerLoaded,
  getAudioContextState,
  startAudioContext,
} from "../audio/sampler";

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

export const PianoController: React.FC = () => {
  const [tonic, setTonic] = useState<number>(0);
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskConfig>(TASK_CONFIGS[0]);
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [samplerReady, setSamplerReady] = useState(false);
  const [activeKeyCodes, setActiveKeyCodes] = useState<Set<string>>(new Set());
  const [audioContextState, setAudioContextState] =
    useState<string>("suspended");

  // Initialize taskId from URL parameter
  useEffect(() => {
    const task = TASK_CONFIGS.find((t) => t.slug === slug) || TASK_CONFIGS[0];
    setCurrentTask(task);
  }, [slug]);

  // Move sampler loading to an earlier useEffect
  useEffect(() => {
    const loadSampler = async () => {
      await ensureSamplerLoaded();
      setAudioContextState(getAudioContextState());
      setSamplerReady(true);
    };

    loadSampler();
  }, []);

  // Update playNotes to handle the tonic offset correctly
  const playNotes = useCallback(
    async (note: number, octave: number) => {
      if (!samplerReady) return [];

      console.log("[PianoController] playNotes input:", {
        note,
        octave,
        tonic,
      });

      // For mouse clicks, note is already absolute
      // For key presses, note is relative and needs to be converted
      const absoluteNote = note % 12;
      const noteString = `${NOTE_NAMES[absoluteNote]}${octave}`;

      console.log("[PianoController] Playing note:", {
        absoluteNote,
        noteString,
        originalNote: note,
        tonic,
      });

      sampler.triggerAttack(noteString, immediate());

      const newNote: FallingNote = {
        id: `${note}-${octave}-${Date.now()}`,
        note: absoluteNote,
        octave,
        startTime: Date.now(),
        endTime: null,
      };

      setFallingNotes((prev) => [...prev, newNote]);
      setActiveKeys((prev) => new Set([...prev, `${note}-${octave}`]));

      return [{ note: absoluteNote, octave }];
    },
    [samplerReady, tonic]
  );

  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      console.log("[PianoController] releaseNotes input:", {
        note,
        octave,
        tonic,
      });

      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(`${note}-${octave}`);
        return next;
      });

      const absoluteNote = note % 12;
      const noteString = `${NOTE_NAMES[absoluteNote]}${octave}`;

      console.log("[PianoController] Releasing note:", {
        absoluteNote,
        noteString,
        originalNote: note,
        tonic,
      });

      sampler.triggerRelease(noteString);

      setFallingNotes((prev) =>
        prev.map((n) => {
          if (n.note === absoluteNote && n.octave === octave && !n.endTime) {
            return { ...n, endTime: Date.now() };
          }
          return n;
        })
      );

      return [{ note: absoluteNote, octave }];
    },
    [tonic]
  );

  const handleTaskChange = useCallback(
    (task: TaskConfig) => {
      console.log("[taskChange] Changing to task:", task.title);
      setCurrentTask(task);
      navigate(`/layouts/${task.slug}`);
    },
    [navigate]
  );

  const handleStartAudio = async () => {
    try {
      await startAudioContext();
      setAudioContextState(getAudioContextState());
    } catch (error) {
      console.error("Failed to start audio context:", error);
    }
  };

  // Add this near the other useEffect hooks
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Tab went to background");

        // Release all active notes
        activeKeys.forEach((keyString) => {
          const [note, octave] = keyString.split("-").map(Number);
          releaseNotes(note, octave);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeKeys, releaseNotes]);

  useEffect(() => {
    if (audioContextState === "suspended") {
      const interval = setInterval(() => {
        const currentState = getAudioContextState();
        if (currentState !== "suspended") {
          setAudioContextState(currentState);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [audioContextState]);

  return (
    <>
      <TaskPanel
        currentTask={currentTask}
        onTaskChange={handleTaskChange}
        keyboardState={{
          activeKeyCodes,
          taskKeyboardMapping: currentTask.keyboardMapping,
        }}
      />
      {!samplerReady ? (
        <div className="fixed top-0 left-[600px] right-0 bottom-0 bg-black flex items-center justify-center text-white">
          Loading piano sounds...
        </div>
      ) : audioContextState === "suspended" ? (
        <div className="fixed top-0 left-[600px] right-0 bottom-0 bg-black flex flex-col items-center justify-center text-white gap-4">
          <p>Click to enable piano sounds</p>
          <button
            onClick={handleStartAudio}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Start Audio
          </button>
        </div>
      ) : (
        <PianoUI
          tonic={tonic}
          setTonic={setTonic}
          colorMode={currentTask.colorMode}
          playNotes={playNotes}
          releaseNotes={releaseNotes}
          fallingNotes={fallingNotes}
          keyboardMapping={currentTask.keyboardMapping}
          setActiveKeyCodes={setActiveKeyCodes}
        />
      )}
    </>
  );
};
