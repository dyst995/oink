const LESSON_IDS = new Set(['pitch-octave-pitch-class'])
const PRACTICE_IDS = new Set(['fretboard-memorization'])

export function isTheoryTopicOpenable(topicId: string): boolean {
  return LESSON_IDS.has(topicId) || PRACTICE_IDS.has(topicId)
}

export function isTheoryPractice(topicId: string): boolean {
  return PRACTICE_IDS.has(topicId)
}
