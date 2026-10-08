import { THEORY_TOPICS } from './topics.ts'

const PRACTICE_IDS = new Set(['fretboard-memorization'])

const LESSON_IDS = new Set(
  THEORY_TOPICS.filter((topic) => Boolean(topic.lesson)).map((topic) => topic.id),
)

export function isTheoryTopicOpenable(topicId: string): boolean {
  return LESSON_IDS.has(topicId) || PRACTICE_IDS.has(topicId)
}

export function isTheoryPractice(topicId: string): boolean {
  return PRACTICE_IDS.has(topicId)
}
