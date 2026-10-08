export type TheoryTopic = {
  id: string
  title: string
  unit: string
  scope: string
  prerequisites: string
  objectives: string
  lesson?: string
}

export const THEORY_TOPICS: TheoryTopic[] = [
  {
    id: 'pitch-octave-pitch-class',
    title: 'Pitch, octave, and pitch class',
    unit: 'A — The pitch language',
    scope: 'What pitch is; how octaves relate; what a pitch class is.',
    prerequisites: 'None.',
    objectives:
      'Distinguish pitch from pitch class. Explain why the same letter in different octaves is one class but not one sound.',
    lesson: '01-pitch-octave-pitch-class.md',
  },
  {
    id: 'twelve-pitch-classes',
    title: 'The twelve pitch classes',
    unit: 'A — The pitch language',
    scope: 'The closed set of twelve names; naturals; sharps and flats; enharmonics.',
    prerequisites: 'Pitch, octave, and pitch class.',
    objectives:
      'List the twelve pitch classes. Explain why seven letters are not enough, and what enharmonic spelling means.',
  },
  {
    id: 'half-and-whole-steps',
    title: 'Half steps and whole steps',
    unit: 'A — The pitch language',
    scope: 'The half step as the smallest common step; the whole step as two half steps.',
    prerequisites: 'The twelve pitch classes.',
    objectives: 'Measure distances in half steps. Locate the B–C and E–F adjacencies.',
  },
  {
    id: 'major-scale-construction',
    title: 'Constructing the major scale',
    unit: 'B — Building the major scale and keys',
    scope: 'The W–W–H–W–W–W–H pattern from any starting pitch class.',
    prerequisites: 'Half steps and whole steps.',
    objectives: 'Build a major scale from a given root by steps alone.',
  },
  {
    id: 'keys-and-tonality',
    title: 'Keys and tonality',
    unit: 'B — Building the major scale and keys',
    scope: 'A key as a collection organized around a tonic; same pattern, different root.',
    prerequisites: 'Constructing the major scale.',
    objectives: 'State what “in the key of X” means. Build the major collection in several keys.',
  },
  {
    id: 'scale-degrees-and-formulas',
    title: 'Scale degrees and formulas',
    unit: 'B — Building the major scale and keys',
    scope: 'Degrees 1–7; writing collections as formulas.',
    prerequisites: 'Keys and tonality.',
    objectives: 'Translate between note names and degree formulas in a key.',
  },
  {
    id: 'interval-names-and-quality',
    title: 'Interval names and quality',
    unit: 'C — Intervals',
    scope: 'Named distances; major/minor/perfect quality; half-step counts.',
    prerequisites: 'Half steps and whole steps; scale degrees and formulas.',
    objectives: 'Name and spell the interval between two notes.',
  },
  {
    id: 'intervals-in-music',
    title: 'Intervals in music',
    unit: 'C — Intervals',
    scope: 'Tendency and use; melodic vs harmonic; basic inversion.',
    prerequisites: 'Interval names and quality.',
    objectives: 'Describe why thirds and fifths become chord material.',
  },
  {
    id: 'triads',
    title: 'Triads',
    unit: 'D — Harmony',
    scope: 'Stacking thirds; major, minor, diminished, augmented.',
    prerequisites: 'Intervals in music.',
    objectives: 'Build and spell any triad from a root; relate it to a formula.',
  },
  {
    id: 'seventh-chords',
    title: 'Seventh chords',
    unit: 'D — Harmony',
    scope: 'Adding the seventh; common seventh types.',
    prerequisites: 'Triads.',
    objectives: 'Build maj7, m7, and dominant 7 from formulas.',
  },
  {
    id: 'diatonic-harmony',
    title: 'Diatonic harmony',
    unit: 'D — Harmony',
    scope: 'Harmonizing the major scale; Roman numerals.',
    prerequisites: 'Scale degrees; seventh chords.',
    objectives: 'Derive the diatonic chord set of a major key.',
  },
  {
    id: 'functional-progressions',
    title: 'Functional progressions',
    unit: 'D — Harmony',
    scope: 'Tonic, predominant, dominant; common progressions.',
    prerequisites: 'Diatonic harmony.',
    objectives: 'Explain V→I and build short progressions in a key.',
  },
  {
    id: 'tuning-and-open-strings',
    title: 'Tuning and the open strings',
    unit: 'E — The fretboard as a map',
    scope: 'Standard tuning; open strings as pitch-class anchors.',
    prerequisites: 'The twelve pitch classes.',
    objectives: 'Name the open strings; count frets as half steps from open.',
  },
  {
    id: 'locating-pitch-classes',
    title: 'Locating pitch classes on the neck',
    unit: 'E — The fretboard as a map',
    scope: 'Finding one pitch class in multiple places.',
    prerequisites: 'Twelve pitch classes; half steps; tuning.',
    objectives: 'Find several occurrences of a given pitch class on frets 0–12.',
  },
  {
    id: 'octaves-on-the-neck',
    title: 'Octave relationships on the neck',
    unit: 'E — The fretboard as a map',
    scope: 'Twelve frets up; cross-string octave geometry as a tool, not an axiom.',
    prerequisites: 'Pitch/octave/pitch class; locating pitch classes.',
    objectives: 'Move a known pitch class to another octave location on purpose.',
  },
  {
    id: 'intervals-on-the-neck',
    title: 'Intervals on the neck',
    unit: 'E — The fretboard as a map',
    scope: 'Horizontal and across-string interval fingerings.',
    prerequisites: 'Interval names; locating pitch classes.',
    objectives: 'Play a named interval from a chosen root in more than one fingering.',
  },
  {
    id: 'scales-across-the-neck',
    title: 'Scales across the neck',
    unit: 'E — The fretboard as a map',
    scope: 'Major (then minor) by construction across the neck.',
    prerequisites: 'Major scale; formulas; intervals on the neck.',
    objectives: 'Play a major scale while naming degrees across a useful range.',
  },
  {
    id: 'chord-shapes-as-stacks',
    title: 'Chord shapes as interval stacks',
    unit: 'E — The fretboard as a map',
    scope: 'Grips as arrangements of chord tones; movable shapes.',
    prerequisites: 'Triads; sevenths; intervals on the neck.',
    objectives: 'Name root, third, and fifth (and seventh) inside a shape.',
  },
  {
    id: 'arpeggios-and-chord-tones',
    title: 'Arpeggios and chord-tone targeting',
    unit: 'E — The fretboard as a map',
    scope: 'Chord tones as lines against a progression.',
    prerequisites: 'Functional progressions; chord shapes.',
    objectives: 'Outline a progression with arpeggios; land chord tones on strong beats.',
  },
  {
    id: 'pentatonic-as-subset',
    title: 'Pentatonic and blues as subsets',
    unit: 'E — The fretboard as a map',
    scope: 'Pentatonic derived from parent scales; ♭5 as color.',
    prerequisites: 'Scale degrees; scales across the neck.',
    objectives: 'Derive pentatonic formulas from major/minor and use them knowingly.',
  },
  {
    id: 'modes-in-context',
    title: 'Modes in context',
    unit: 'E — The fretboard as a map',
    scope: 'Modes as rotations / characteristic degrees; modal vs functional situations.',
    prerequisites: 'Formulas; functional progressions; scales across the neck.',
    objectives: 'Build a mode from parent scale or formula for a clear musical situation.',
  },
  {
    id: 'fretboard-harmony',
    title: 'Fretboard harmony and voice leading',
    unit: 'E — The fretboard as a map',
    scope: 'Connecting chords with minimal motion; guide tones; shells.',
    prerequisites: 'Progressions; chord shapes; arpeggios.',
    objectives: 'Voice-lead a short progression on the neck.',
  },
  {
    id: 'pulse-and-feel',
    title: 'Pulse, subdivision, and feel',
    unit: 'F — Time',
    scope: 'Beat, bar, common subdivisions; straight vs swing.',
    prerequisites: 'Basic counting.',
    objectives: 'Play and count common subdivisions against a steady pulse.',
  },
]

export function getTopic(id: string): TheoryTopic | undefined {
  return THEORY_TOPICS.find((topic) => topic.id === id)
}
