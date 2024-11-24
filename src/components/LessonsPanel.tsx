import React, { useEffect, useState, useCallback, useRef } from "react";
import { LESSONS } from "../data/lessons";
import { Bars3Icon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { URL_PREFIX } from "../constants/routes";
import type { TaskProgress } from "../tasks/tasks";
import { KeyboardMapping } from "../constants/keyboard";
import { Layout } from "./Layout";

interface KeyboardState {
  activeKeyCodes: Set<string>;
  taskKeyboardMapping?: KeyboardMapping;
}

interface LessonsPanelProps {
  currentLessonId: number;
  onLessonChange: (lessonId: number) => void;
  taskProgress: TaskProgress[];
  activeTaskId: string | null;
  keyboardState: KeyboardState;
}

export const LessonsPanel: React.FC<LessonsPanelProps> = React.memo(
  ({ currentLessonId, onLessonChange, activeTaskId, keyboardState }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentLessonIndex = LESSONS.findIndex(
      (lesson) => lesson.id === currentLessonId
    );
    const currentLesson = LESSONS[currentLessonIndex];
    const previousLesson =
      currentLessonIndex > 0 ? LESSONS[currentLessonIndex - 1] : null;
    const nextLesson =
      currentLessonIndex < LESSONS.length - 1
        ? LESSONS[currentLessonIndex + 1]
        : null;

    // Simplify task display logic since we only have one task per lesson
    const renderContent = useCallback(
      (content: React.ReactNode): React.ReactNode => {
        if (!React.isValidElement(content)) {
          return content;
        }

        if (content.props.children) {
          const children = React.Children.map(content.props.children, (child) =>
            renderContent(child)
          );
          return React.cloneElement(content, {}, children);
        }

        return content;
      },
      []
    );

    // Add ref for content container
    const contentRef = useRef<HTMLDivElement>(null);

    // Add effect to scroll to active task when it changes
    useEffect(() => {
      if (activeTaskId && contentRef.current) {
        const activeTaskElement = contentRef.current.querySelector(
          `[data-task-id="${activeTaskId}"]`
        );

        if (activeTaskElement) {
          const containerRect = contentRef.current.getBoundingClientRect();
          const taskRect = activeTaskElement.getBoundingClientRect();
          const keyboardHeight = 200; // Height of keyboard section

          // Check if task is below the visible area or partially hidden by keyboard
          if (
            taskRect.bottom > containerRect.bottom - keyboardHeight ||
            taskRect.top > containerRect.bottom - keyboardHeight
          ) {
            activeTaskElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }
    }, [activeTaskId]);

    return (
      <div className="fixed top-0 left-0 w-[600px] h-screen bg-gray-900 text-white flex flex-col">
        {/* Keyboard section */}
        <div className="bg-gray-900 p-4 border-b border-gray-800">
          <div className="w-full flex justify-end">
            <Layout keyboardState={keyboardState} />
          </div>
        </div>

        {/* Menu Header */}
        <div className="bg-gray-900 z-20 p-8 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700 relative z-20 pointer-events-auto"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <Link
                to={`${URL_PREFIX}/mappings`}
                className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700 relative z-20 pointer-events-auto"
              >
                <ShoppingBagIcon className="w-6 h-6" />
              </Link>
            </div>

            <div className="flex-1 flex gap-2">
              <div className={`flex-1 ${nextLesson ? "w-1/2" : "w-full"}`}>
                {previousLesson && (
                  <Link
                    to={`${URL_PREFIX}/${previousLesson.id}`}
                    onClick={() => onLessonChange(previousLesson.id)}
                    className="block w-full p-2 bg-gray-800 rounded border border-gray-700 text-gray-400 hover:bg-gray-700 text-left select-none"
                  >
                    ← {currentLessonIndex}. {previousLesson.title}
                  </Link>
                )}
              </div>

              <div className={`flex-1 ${previousLesson ? "w-1/2" : "w-full"}`}>
                {nextLesson && (
                  <Link
                    to={`${URL_PREFIX}/${nextLesson.id}`}
                    onClick={() => onLessonChange(nextLesson.id)}
                    className="block w-full p-2 rounded border text-right select-none transition-all duration-300 bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                  >
                    {currentLessonIndex + 2}. {nextLesson.title} →
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="w-full text-white font-semibold text-[28px]">
            {currentLessonIndex + 1}. {currentLesson.title}
          </div>
        </div>

        {/* Menu Overlay - Move outside of scrollable content */}
        {isMenuOpen && (
          <div className="absolute inset-0 bg-gray-900 z-30 overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-gray-800 rounded border border-gray-700 hover:bg-gray-700"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {LESSONS.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    to={`${URL_PREFIX}/${lesson.id}`}
                    onClick={() => {
                      onLessonChange(lesson.id);
                      setIsMenuOpen(false);
                    }}
                    className={`mt-2 text-left cursor-pointer hover:text-white ${
                      lesson.id === currentLessonId
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  >
                    <span>{index + 1}. </span>
                    {lesson.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative min-h-[calc(100vh-400px)]">
            <div ref={contentRef} className="p-8 pt-4">
              {currentLesson && (
                <div className="prose prose-invert">
                  {renderContent(currentLesson.content)}
                </div>
              )}
            </div>

            {/* Gradient overlay */}
            <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
        </div>
      </div>
    );
  }
);
