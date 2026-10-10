import { parseFlashcardDeck } from '../flashcards-module/index.ts'
import type { FlashcardDeck } from '../flashcards-module/types.ts'

const files = import.meta.glob('../../data/flashcards/topics/*.json', {
  eager: true,
}) as Record<string, { default?: unknown } | unknown>

function moduleValue(mod: unknown): unknown {
  if (mod && typeof mod === 'object' && 'default' in mod) {
    return (mod as { default: unknown }).default
  }
  return mod
}

function topicIdFromPath(path: string): string {
  const file = path.split('/').pop() ?? ''
  return file.replace(/\.json$/, '')
}

const decks = new Map<string, FlashcardDeck>()

for (const [path, mod] of Object.entries(files)) {
  decks.set(topicIdFromPath(path), parseFlashcardDeck(moduleValue(mod)))
}

export function getTopicFlashcardDeck(topicId: string): FlashcardDeck | null {
  return decks.get(topicId) ?? null
}

export function hasTopicFlashcards(topicId: string): boolean {
  return decks.has(topicId)
}
