import React, { useState, useCallback, useEffect } from "react";
import { PianoUI } from "./PianoUI";
import { ColorMode } from "./types";
import { sampler } from "../audio/sampler";
import { FallingNote } from "./FallingNotes";
import { TaskPanel } from "./TaskPanel";
import { immediate } from "tone";
import { useParams, useNavigate } from "react-router-dom";
import { TASK_CONFIGS, TaskId } from "../tasks/tasks";
import { URL_PREFIX } from "../constants/routes";
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
  const [colorMode, setColorMode] = useState<ColorMode>("chromatic");
  const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
  const [taskId, setTaskId] = useState<TaskId>(0);
  const navigate = useNavigate();
  const { taskId: urlTaskId } = useParams();
  const [state, setState] = useState<PianoControllerState>({
    activeKeysSize: 0,
  });
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [samplerReady, setSamplerReady] = useState(false);
  const [activeKeyCodes, setActiveKeyCodes] = useState<Set<string>>(new Set());
  const [audioContextState, setAudioContextState] =
    useState<string>("suspended");

  console.log("colorMode", colorMode);

  // Initialize taskId from URL parameter
  useEffect(() => {
    const parsedTaskId = parseInt(urlTaskId || "5");
    const validTaskId =
      isNaN(parsedTaskId) ||
      parsedTaskId < 0 ||
      parsedTaskId >= TASK_CONFIGS.length
        ? 5
        : parsedTaskId;
    setTaskId(validTaskId);
  }, [urlTaskId]);

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
      setAudioContextState(getAudioContextState());
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

      const noteString = `${NOTE_NAMES[(note + tonic) % 12]}${octave}`;
      sampler.triggerAttack(noteString, immediate());

      // Create falling note
      const newNote: FallingNote = {
        id: `${note}-${octave}-${Date.now()}`,
        note: (note + tonic) % 12,
        octave,
        startTime: Date.now(),
        endTime: null,
      };

      setFallingNotes((prev) => [...prev, newNote]);
      setActiveKeys((prev) => new Set([...prev, `${note}-${octave}`]));

      return [{ note: (note + tonic) % 12, octave }];
    },
    [samplerReady, tonic]
  );

  const releaseNotes = useCallback(
    (note: number, octave: number) => {
      const noteKey = `${note}-${octave}`;
      console.log(
        `[releaseNotes] Releasing ${noteKey}, active keys: ${activeKeys.size}`
      );

      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(`${note}-${octave}`);
        return next;
      });

      const noteString = `${NOTE_NAMES[(note + tonic) % 12]}${octave}`;
      sampler.triggerRelease(noteString);

      setFallingNotes((prev) =>
        prev.map((n) => {
          if (
            n.note === (note + tonic) % 12 &&
            n.octave === octave &&
            !n.endTime
          ) {
            return { ...n, endTime: Date.now() };
          }
          return n;
        })
      );

      return [{ note: (note + tonic) % 12, octave }];
    },
    [tonic]
  );

  const handleTaskChange = useCallback(
    (newTaskId: TaskId) => {
      console.log("[taskChange] Changing to task:", newTaskId);
      setTaskId(newTaskId);
      navigate(`${URL_PREFIX}/${newTaskId}`);
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

  return (
    <>
      <TaskPanel
        taskId={taskId}
        onTaskChange={handleTaskChange}
        keyboardState={{
          activeKeyCodes,
          taskKeyboardMapping: TASK_CONFIGS[taskId].keyboardMapping,
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
          colorMode={TASK_CONFIGS[taskId].colorMode}
          onColorModeChange={setColorMode}
          playNotes={playNotes}
          releaseNotes={releaseNotes}
          fallingNotes={fallingNotes}
          keyboardMapping={TASK_CONFIGS[taskId].keyboardMapping}
          state={state}
          setActiveKeyCodes={setActiveKeyCodes}
        />
      )}
    </>
  );
};
