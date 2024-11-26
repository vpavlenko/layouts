import React from "react";
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
          <div className="flex items-center justify-between">
            <div className="text-lg text-white">
              {TASK_CONFIGS[taskId].title}
            </div>
            <Layout keyboardState={keyboardState} showLabels={true} />
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2">
            {TASK_CONFIGS.map((taskConfig, index) => {
              const isCurrentTask = index === taskId;

              return (
                <div
                  key={index}
                  onClick={() => onTaskChange(index)}
                  className={`p-4 border transition-all cursor-pointer ${
                    isCurrentTask
                      ? "bg-gray-800 border-blue-500/70"
                      : "hover:bg-gray-800 border-transparent"
                  }`}
                >
                  <div className="flex flex-col items-start w-full">
                    {taskConfig?.keyboardMapping && (
                      <div className="self-center mb-2">
                        <Layout
                          keyboardState={{
                            activeKeyCodes: new Set(),
                            taskKeyboardMapping: taskConfig.keyboardMapping,
                          }}
                          showLabels={false}
                        />
                      </div>
                    )}
                    <div
                      className={`text-sm w-full ${
                        isCurrentTask ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {taskConfig.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);
