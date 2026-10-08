import type { Flashcard, FlashcardDeck, FlashcardDeckJson } from './types.ts'

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Flashcard deck field “${field}” must be a non-empty string.`)
  }
  return value.trim()
}

function asOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    throw new Error(`Flashcard deck field “${field}” must be a string when present.`)
  }
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function asTags(value: unknown, cardIndex: number): string[] | undefined {
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== 'string')) {
    throw new Error(`Card ${cardIndex + 1}: “tags” must be an array of strings.`)
  }
  const tags = value.map((tag) => tag.trim()).filter(Boolean)
  return tags.length > 0 ? tags : undefined
}

function parseCard(raw: unknown, index: number): Flashcard {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Card ${index + 1} must be an object.`)
  }

  const card = raw as Record<string, unknown>
  const front = asString(card.front, `cards[${index}].front`)
  const back = asString(card.back, `cards[${index}].back`)
  const id =
    typeof card.id === 'string' && card.id.trim() !== ''
      ? card.id.trim()
      : `card-${index + 1}`

  return {
    id,
    front,
    back,
    tags: asTags(card.tags, index),
  }
}

/** Accepts a parsed JSON value or a JSON string and returns a validated deck. */
export function parseFlashcardDeck(input: string | FlashcardDeckJson | unknown): FlashcardDeck {
  const raw: unknown = typeof input === 'string' ? JSON.parse(input) : input

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Flashcard deck must be a JSON object.')
  }

  const data = raw as FlashcardDeckJson
  const title = asString(data.title, 'title')
  const id =
    typeof data.id === 'string' && data.id.trim() !== ''
      ? data.id.trim()
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    throw new Error('Flashcard deck needs a non-empty “cards” array.')
  }

  const cards = data.cards.map(parseCard)
  const seen = new Set<string>()
  for (const card of cards) {
    if (seen.has(card.id)) {
      throw new Error(`Duplicate card id “${card.id}”.`)
    }
    seen.add(card.id)
  }

  return {
    id,
    title,
    description: asOptionalString(data.description, 'description'),
    cards,
  }
}
