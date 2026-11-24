export const oudScores = [
  {
    label: "Al Atlal",
    title: "Al Atlal",
    url: "https://rawl.rocks/f/riyad-al-sunbati-al-atlal",
  },
  {
    label: "Samai Bayati",
    title: "Ibrahim Al Aryan Samai Bayati Score",
    url: "https://rawl.rocks/f/ibrahim-al-aryan-samai-bayati-score",
  },
  {
    label: "Samai Huzam",
    title: "Muhammad Abd Al Wahhab Samai Huzam",
    url: "https://rawl.rocks/f/muhammad-abd-al-wahhab-samai-huzam",
  },
  {
    label: "Hijazkar Kurd",
    title: "Tatyos Efendi Samai Hijazkar Kurd",
    url: "https://rawl.rocks/f/tatyos-efendi-samai-hijazkar-kurd",
  },
] as const;

interface OudMaqam {
  name: string;
  steps: readonly number[];
}

// Scales, continuations, and lower auxiliaries from Rawl's /maqam,
// folded into one octave in 50-cent steps from the white pitch.
export const oudMaqams: readonly OudMaqam[] = [
  { name: "Ajam", steps: [0, 4, 8, 10, 14, 16, 18, 20, 22] },
  { name: "Rast", steps: [0, 4, 7, 10, 14, 16, 18, 20, 21, 22] },
  { name: "Hijaz", steps: [0, 2, 8, 10, 14, 16, 17, 20, 22] },
  { name: "Kurd", steps: [0, 2, 6, 10, 14, 16, 20] },
  { name: "Nikriz", steps: [0, 4, 6, 12, 14, 16, 18, 20, 22] },
  { name: "Nahawand", steps: [0, 4, 6, 10, 14, 16, 18, 20, 22] },
  { name: "Bayati", steps: [0, 3, 6, 10, 12, 14, 16, 17, 18, 20] },
  { name: "Saba", steps: [0, 3, 4, 6, 8, 14, 16, 17, 20, 22] },
  // Rawl uses the third degree as white in Huzzam.
  { name: "Huzzam", steps: [0, 2, 4, 7, 8, 10, 14, 17, 20] },
];
