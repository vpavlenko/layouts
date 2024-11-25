import React from "react";
import { Link } from "react-router-dom";
import { URL_PREFIX } from "../constants/routes";
import { KeyboardMapping } from "../constants/keyboard";
import { Layout } from "./Layout";
import { TASK_CONFIGS, TaskId } from "../tasks/tasks";

interface KeyboardState {
  activeKeyCodes: Set<string>;
  taskKeyboardMapping?: KeyboardMapping;
}

interface TaskPanelProps {
  taskId: TaskId;
  onTaskChange: (taskId: TaskId) => void;
  keyboardState: KeyboardState;
}

export const TaskPanel: React.FC<TaskPanelProps> = React.memo(
  ({ taskId, onTaskChange, keyboardState }) => {
    return (
      <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white flex flex-col">
        {/* Keyboard section */}
        <div className="bg-gray-900 p-4 border-b border-gray-800">
          <div className="w-full flex justify-end">
            <Layout keyboardState={keyboardState} />
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="grid gap-4">
              {TASK_CONFIGS.map((taskConfig, index) => {
                const isCurrentTask = index === taskId;

                return (
                  <Link
                    key={index}
                    to={`${URL_PREFIX}/${index}`}
                    onClick={() => onTaskChange(index)}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrentTask
                        ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    <div className="mb-2">
                      <span className="text-lg">
                        {index + 1}. {taskConfig.title}
                      </span>
                    </div>
                    {taskConfig?.keyboardMapping && (
                      <div className="mt-2">
                        <Layout
                          keyboardState={{
                            activeKeyCodes: new Set(),
                            taskKeyboardMapping: taskConfig.keyboardMapping,
                          }}
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
