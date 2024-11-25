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
          <div className="">
            <div className="grid">
              {TASK_CONFIGS.map((taskConfig, index) => {
                const isCurrentTask = index === taskId;

                return (
                  <Link
                    key={index}
                    to={`${URL_PREFIX}/${index}`}
                    onClick={() => onTaskChange(index)}
                    className={`p-4 border border-transparent transition-all ${
                      isCurrentTask
                        ? "bg-gray-800 border-blue-500"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-lg flex-1 min-w-0">
                        {index + 1}. {taskConfig.title}
                      </span>
                      {taskConfig?.keyboardMapping && (
                        <div className="flex-none">
                          <Layout
                            keyboardState={{
                              activeKeyCodes: new Set(),
                              taskKeyboardMapping: taskConfig.keyboardMapping,
                            }}
                          />
                        </div>
                      )}
                    </div>
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
