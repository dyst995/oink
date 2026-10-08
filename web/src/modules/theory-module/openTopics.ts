const LESSON_IDS = new Set([
  'pitch-octave-pitch-class',
  'twelve-pitch-classes',
  'half-and-whole-steps',
  'major-scale-construction',
  'keys-and-tonality',
  'scale-degrees-and-formulas',
  'interval-names-and-quality',
  'intervals-in-music',
  'triads',
  'seventh-chords',
  'diatonic-harmony',
  'functional-progressions',
  'tuning-and-open-strings',
  'locating-pitch-classes',
  'octaves-on-the-neck',
  'intervals-on-the-neck',
  'scales-across-the-neck',
  'chord-shapes-as-stacks',
  'arpeggios-and-chord-tones',
  'pentatonic-as-subset',
  'modes-in-context',
  'fretboard-harmony',
  'pulse-and-feel',
])

const PRACTICE_IDS = new Set(['fretboard-memorization'])

export function isTheoryTopicOpenable(topicId: string): boolean {
  return LESSON_IDS.has(topicId) || PRACTICE_IDS.has(topicId)
}

export function isTheoryPractice(topicId: string): boolean {
  return PRACTICE_IDS.has(topicId)
}
