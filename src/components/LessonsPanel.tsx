import React, { useState } from "react";
import { LESSONS } from "../data/lessons";
import { Bars3Icon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { URL_PREFIX } from "../constants/routes";
import { KeyboardMapping } from "../constants/keyboard";
import { Layout } from "./Layout";
import { TASK_CONFIGS } from "../tasks/tasks";

interface KeyboardState {
  activeKeyCodes: Set<string>;
  taskKeyboardMapping?: KeyboardMapping;
}

interface LessonsPanelProps {
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
  keyboardState: KeyboardState;
}

export const LessonsPanel: React.FC<LessonsPanelProps> = React.memo(
  ({ currentLessonId, onLessonChange, keyboardState }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentLessonIndex = LESSONS.findIndex(
      (lesson) => lesson.id === currentLessonId
    );

    return (
      <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white flex flex-col">
        {/* Keyboard section */}
        <div className="bg-gray-900 p-4 border-b border-gray-800">
          <div className="w-full flex justify-end">
            <Layout keyboardState={keyboardState} />
          </div>
        </div>

        {/* Header */}
        <div className="bg-gray-900 z-20 p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <Link
                to={`${URL_PREFIX}/mappings`}
                className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700"
              >
                <ShoppingBagIcon className="w-6 h-6" />
              </Link>
            </div>
            <h1 className="text-2xl font-bold">Lessons</h1>
          </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="grid gap-4">
              {LESSONS.map((lesson, index) => {
                const lastTaskId = lesson.taskIds[lesson.taskIds.length - 1];
                const taskConfig = TASK_CONFIGS[lastTaskId];
                const isCurrentLesson = lesson.id === currentLessonId;

                return (
                  <Link
                    key={lesson.id}
                    to={`${URL_PREFIX}/${lesson.id}`}
                    onClick={() => onLessonChange(lesson.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrentLesson
                        ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20"
                        : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    <div className="mb-2">
                      <span className="text-lg">
                        {index + 1}. {lesson.title}
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
