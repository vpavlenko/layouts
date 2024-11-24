import React from "react";

export const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-6 mb-2">{children}</p>
);

export interface Lesson {
  id: number;
  title: string;
  content: React.ReactNode;
  finalText?: string;
  taskIds: string[];
}

const R = ({
  suffix,
  children,
}: {
  suffix: string;
  children: React.ReactNode;
}) => (
  <a
    href={`https://rawl.rocks/${suffix}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

const LESSONS_WITHOUT_IDS: {
  title: string;
  content: React.ReactNode;
  finalText?: string;
  taskIds: string[];
}[] = [
  {
    title: "White Keys",
    content: (
      <>
        <P>
          Welcome to Rawl Piano, the companion book to{" "}
          <R suffix="">rawl.rocks</R>. I'm gonna cover Western music theory
          using my colorful music notation.
        </P>
        <P>
          We have seven different types of white keys. Why seven? There are
          seven vibes, in a way.
        </P>
      </>
    ),
    finalText:
      "Play around with all seven keys. Then, as you're ready, go to the next lesson",
    taskIds: ["play-b-across-octaves"],
  },
  {
    title: "Black Keys",
    content: (
      <>
        <P>Now let's learn about the black keys!</P>
      </>
    ),
    finalText: "Play the last black key",
    taskIds: ["play-f-sharp"],
  },
  {
    title: "Chromatic Sequences",
    content: (
      <>
        <P>
          Now let's play all notes in sequence! First ascending from A0, then
          descending from C8.
        </P>
        <P>
          Follow the arrows - they show which note to play next. Previous notes
          will show checkmarks.
        </P>
        <P>
          Finally, try playing the ascending sequence again using the flat
          keyboard layout - where each key is arranged in chromatic order from
          left to right.
        </P>
      </>
    ),
    finalText: "Play the last note in the chromatic sequence",
    taskIds: ["play-chromatic-ascending-flat"],
  },
  {
    title: "Major Second Intervals",
    content: (
      <>
        <P>
          Let's explore intervals! We'll start with major seconds - the interval
          of two semitones.
        </P>
        <P>
          First, play all notes separated by major seconds starting from A0.
          Then we'll play the complementary sequence starting from A#0.
        </P>
      </>
    ),
    finalText: "Play the last note in the major second sequence",
    taskIds: ["play-major-seconds-from-asharp0"],
  },
  {
    title: "Scale Modes",
    content: (
      <>
        <P>
          Let's explore different scale modes! Each row of keys maps to a
          different mode:
        </P>
        <P>
          Middle row (A-J): Major scale (Ionian mode) - the familiar do-re-mi
          pattern
        </P>
        <P>
          Bottom row (Z-M): Lydian mode - like major scale but with a raised 4th
        </P>
        <P>Top row (Q-U): Mixolydian mode - major scale with a lowered 7th</P>
        <P>Number row (1-8): Dorian mode - minor scale with a raised 6th</P>
      </>
    ),
    finalText: "Play the last note in the scale mode sequence",
    taskIds: ["play-dorian-scale"],
  },
  {
    title: "More Scale Modes",
    content: (
      <>
        <P>
          Let's explore the remaining scale modes! Each row maps to a different
          mode, continuing our pattern:
        </P>
        <P>
          Bottom row (Z-A): Dorian mode again - but in a lower octave for
          comparison
        </P>
        <P>
          Middle row (A-J): Natural Minor (Aeolian) - the familiar sad scale
        </P>
        <P>Top row (Q-U): Phrygian mode - minor scale with a lowered 2nd</P>
        <P>
          Number row (1-8): Locrian mode - the darkest mode, with lowered 2nd
          and 5th
        </P>
      </>
    ),
    finalText: "Play the last note in the more scale modes sequence",
    taskIds: ["play-locrian-scale"],
  },
  {
    title: "Major Chords",
    content: (
      <>
        <P>
          Now let's learn all twelve major chords! We'll start with C major in
          the second octave, using three keys for the three notes of each chord.
        </P>
        <P>
          The bottom row (Z-.) covers C, C#, and D major chords. The home row
          (A-L) covers Eb, E, and F major chords. The top row (Q-O) covers F#,
          G, and G# major chords. And finally the number row is grouped in
          threes: 1-2-3 for A major, 4-5-6 for Bb major, and 7-8-9 for B major.
        </P>
        <P>
          Each new chord builds on the previous ones, so you can always go back
          and practice earlier chords!
        </P>
      </>
    ),
    finalText: "Play the last major chord",
    taskIds: ["play-b-major-chord"],
  },
  {
    title: "Minor Chords",
    content: (
      <>
        <P>
          Now let's learn all twelve minor chords! Like major chords, each minor
          chord has three notes, but the middle note (the third) is lowered by
          one semitone, giving that characteristic melancholic sound.
        </P>
        <P>
          We'll use the same keyboard layout pattern as major chords: Bottom row
          (Z-.) for C minor, C# minor, and D minor; Home row (A-L) for Eb minor,
          E minor, and F minor; Top row (Q-O) for F# minor, G minor, and G#
          minor; Number row grouped in threes: 1-2-3 for A minor, 4-5-6 for Bb
          minor, and 7-8-9 for B minor.
        </P>
        <P>
          Each minor chord follows this pattern: root note, minor third (3
          semitones up), and perfect fifth (7 semitones up). For example, C
          minor is C (root), Eb (minor third), and G (perfect fifth).
        </P>
      </>
    ),
    finalText: "Play the last minor chord",
    taskIds: ["play-b-minor-chord"],
  },
  {
    title: "C Major and C Minor Relations",
    content: (
      <>
        <P>
          Let's explore the relationship between C major and C minor scales and
          their primary chords. We'll start with the C major scale and its
          primary chords (I, IV, V), then compare them with their minor
          counterparts.
        </P>
        <P>
          First, play the C major scale ascending from C3 to C4. Then we'll
          explore the three primary chords in C major: C major (I), F major
          (IV), and G major (V).
        </P>
        <P>
          Next, we'll play the C minor scale, which differs from C major by
          having a lowered third (Eb), sixth (Ab), and seventh (Bb). Finally,
          we'll play the primary chords in C minor: C minor (i), F minor (iv),
          and G minor (v).
        </P>
        <P>
          Notice how the chord qualities change between major and minor keys,
          while the root notes remain the same!
        </P>
      </>
    ),
    finalText: "Play the last primary chord in C minor",
    taskIds: ["play-c-minor-primary-v"],
  },
  {
    title: "Free Play",
    content: (
      <>
        <P>
          Congratulations! You've completed the lessons. Now you can freely play
          around with the piano. Try different tonics, voicings, and color
          modes!
        </P>
      </>
    ),
    taskIds: [], // No tasks for free play
  },
];

export const LESSONS = LESSONS_WITHOUT_IDS.map((lesson, index) => ({
  ...lesson,
  id: index + 1,
}));
