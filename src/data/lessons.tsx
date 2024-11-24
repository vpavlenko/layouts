import React from "react";

export interface Lesson {
  id: number;
  title: string;
  taskIds: string[];
}

const LESSONS_WITHOUT_IDS: {
  title: string;
  taskIds: string[];
}[] = [
  {
    title: "White Keys",
    taskIds: ["play-b-across-octaves"],
  },
  {
    title: "Black Keys",
    taskIds: ["play-f-sharp"],
  },
  {
    title: "Chromatic Sequences",
    taskIds: ["play-chromatic-ascending-flat"],
  },
  {
    title: "Major Second Intervals",
    taskIds: ["play-major-seconds-from-asharp0"],
  },
  {
    title: "Scale Modes",
    taskIds: ["play-dorian-scale"],
  },
  {
    title: "More Scale Modes",
    taskIds: ["play-locrian-scale"],
  },
  {
    title: "Major Chords",
    taskIds: ["play-b-major-chord"],
  },
  {
    title: "Minor Chords",
    taskIds: ["play-b-minor-chord"],
  },
  {
    title: "Free Play",
    taskIds: [], // No tasks for free play
  },
];

export const LESSONS = LESSONS_WITHOUT_IDS.map((lesson, index) => ({
  ...lesson,
  id: index + 1,
}));
