export type TheoryFormula = {
  label: string;
  formula: string;
};

export type TheoryTopic = {
  id: string;
  title: string;
  body: string;
  formulas?: TheoryFormula[];
};

export const THEORY_TOPICS: TheoryTopic[] = [
  {
    id: "notes",
    title: "The 12 notes",
    body: "Learn the note names, sharps and flats, and where each one sits on every string. The same note shows up in several places on the neck.",
  },
  {
    id: "intervals",
    title: "Intervals",
    body: "An interval is the distance from a root to another note. A scale or a chord is a root plus a list of intervals. That list is the formula the fretboard reads.",
  },
  {
    id: "major-scale",
    title: "The major scale and keys",
    body: "One key is one set of notes. Minor and every other scale are described by how they differ from the major scale.",
    formulas: [{ label: "Major", formula: "1 2 3 4 5 6 7" }],
  },
  {
    id: "chords",
    title: "Chords",
    body: "Build triads first, then sevenths. Electric rhythm playing is these shapes moved around the neck.",
    formulas: [
      { label: "Major triad", formula: "1 3 5" },
      { label: "Minor triad", formula: "1 b3 5" },
      { label: "Major 7", formula: "1 3 5 7" },
      { label: "Minor 7", formula: "1 b3 5 b7" },
      { label: "Dominant 7", formula: "1 3 5 b7" },
    ],
  },
  {
    id: "pentatonic",
    title: "Pentatonic and blues",
    body: "Minor pentatonic plus the blues note covers most rock, blues, and pop soloing. Learn it in all five positions, in a few keys, before collecting more scales.",
    formulas: [
      { label: "Minor pentatonic", formula: "1 b3 4 5 b7" },
      { label: "Major pentatonic", formula: "1 2 3 5 6" },
      { label: "Blues", formula: "1 b3 4 b5 5 b7" },
    ],
  },
  {
    id: "progressions",
    title: "Progressions",
    body: "Learn how chords move inside a key. I–IV–V, vi–IV–I–V, and the 12-bar blues show which notes sit at rest and which ones pull.",
  },
  {
    id: "arpeggios",
    title: "Arpeggios",
    body: "Play the chord tones one at a time. Aiming at the chord that is happening locks a solo to the song.",
  },
  {
    id: "rhythm",
    title: "Rhythm",
    body: "Eighths, sixteenths, triplets, and swing. Time and accent sit alongside the note choice.",
  },
];

export const THEORY_LATER =
  "Modes, melodic and harmonic minor, and chords with 9ths, 11ths, and 13ths are the same interval idea. Dorian fits a minor vamp. Mixolydian fits a dominant groove.";
