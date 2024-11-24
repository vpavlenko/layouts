import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { PianoKeyboard } from "./PianoKeyboard";
import { LESSONS } from "../data/lessons";
import { TASK_CONFIGS } from "../tasks/tasks";
import { URL_PREFIX } from "../constants/routes";

export const MappingsPanel: React.FC = () => {
  const mappings = LESSONS.filter((lesson) => lesson.taskIds.length > 0)
    .map((lesson) => {
      const lastTaskId = lesson.taskIds[lesson.taskIds.length - 1];
      const taskConfig = TASK_CONFIGS[lastTaskId];

      if (!taskConfig?.keyboardMapping) return null;

      return {
        lessonTitle: lesson.title,
        taskId: lastTaskId,
        taskConfig,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const [selectedMappingIndex, setSelectedMappingIndex] = useState(0);
  const selectedMapping = mappings[selectedMappingIndex];

  return (
    <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-900 z-20 p-8 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Link
            to={`${URL_PREFIX}/1`}
            className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Final Keyboard Mappings</h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {mappings.map((mapping, index) => (
            <button
              key={mapping.taskId}
              onClick={() => setSelectedMappingIndex(index)}
              className={`px-3 py-1 rounded whitespace-nowrap ${
                selectedMappingIndex === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {mapping.lessonTitle}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {selectedMapping && (
            <div key={selectedMapping.taskId} className="mb-8">
              <h2 className="text-lg font-semibold mb-2">
                {selectedMapping.lessonTitle}
              </h2>
              <p className="text-gray-400 mb-4">
                {selectedMapping.taskConfig.description}
              </p>
              <div className="bg-gray-800 p-4 rounded">
                <PianoKeyboard
                  keyboardState={{
                    activeKeyCodes: new Set(),
                    taskKeyboardMapping:
                      selectedMapping.taskConfig.keyboardMapping,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
