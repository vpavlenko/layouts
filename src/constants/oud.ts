// Rawl's maqam corpora and the separately published Gamil Gamal.
// Keep the original picker entries first.
const rawlScores = [
  ["riyad-al-sunbati-al-atlal", "Al Atlal"],
  ["ibrahim-al-aryan-samai-bayati-score", "Ibrahim Al Aryan Samai Bayati Score", "Samai Bayati"],
  ["muhammad-abd-al-wahhab-samai-huzam", "Muhammad Abd Al Wahhab Samai Huzam", "Samai Huzam"],
  ["tatyos-efendi-samai-hijazkar-kurd", "Tatyos Efendi Samai Hijazkar Kurd", "Hijazkar Kurd"],
  ["samai-bayati-qadim", "Samai Bayati Qadim"],
  ["abraham-salman-taksim-bayat-mawzoun", "Taksim bayat mawzoun"],
  ["rei-korkus-ibrahim-al-aryan-samai-bayati", "Samai Bayati | Ibrahim Al Aryan - Rei Korkus"],
  ["muhammad-abd-al-wahhab-inta-omri", "Inta Omri"],
  ["rawhi-al-khammash-samai-nahawand", "Samai Nahawend"],
  ["riyad-al-sunbati-taqsim-nahawand", "Taqsim Nahawand"],
  ["riyad-al-sunbati-taqsim-hijaz", "Taqsim Hijaz"],
  ["riyad-al-sunbati-taqsim-bayyati", "Taqsim Bayyati"],
  ["riyad-al-sunbati-taqsim-rast", "Taqsim Rast"],
  ["riyad-al-sunbati-taqsim-kurd", "Taqsim Kurd"],
  ["riyad-al-sunbati-taqsim-sekah", "Taqsim Sekah"],
  ["mohamed-elabyad-al-atlal", "Mohamed Elabyad Al Atlal"],
  ["riyad-al-sunbati-awwidt-ayni", "Awwidt Ayni"],
  ["riyad-al-sunbati-arouh-limeen", "Arouh Limeen"],
  ["farid-al-atrash-gamil-gamal", "Farid Al Atrash Gamil Gamal", "Gamil Gamal"],
] as const;

export const oudScores = rawlScores.map(([slug, title, label = title]) => ({
  label,
  title,
  url: `https://rawl.rocks/f/${slug}`,
}));

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
