import type { TheoryTopic } from './topics.ts'

export type TheoryUnitGroup = {
  unit: string
  topics: TheoryTopic[]
}

export function groupTopicsByUnit(topics: readonly TheoryTopic[]): TheoryUnitGroup[] {
  const groups: TheoryUnitGroup[] = []

  for (const topic of topics) {
    const last = groups[groups.length - 1]
    if (last && last.unit === topic.unit) {
      last.topics.push(topic)
      continue
    }
    groups.push({ unit: topic.unit, topics: [topic] })
  }

  return groups
}
