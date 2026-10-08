import type { FlashcardDeck, FlashcardDeckFilter } from './types.ts'

/**
 * Returns a new deck whose cards match the selected strings and notes.
 * Empty selection arrays mean “no restriction” for that dimension.
 * When both are set, a card must match a selected string and a selected note.
 */
export function filterFlashcardDeck(
  deck: FlashcardDeck,
  filter: FlashcardDeckFilter = {},
): FlashcardDeck {
  const strings = filter.strings?.length ? new Set(filter.strings) : null
  const notes = filter.notes?.length ? new Set(filter.notes) : null

  const cards = deck.cards.filter((card) => {
    const stringNumber = card.meta?.string
    const note = card.meta?.note

    if (strings) {
      if (typeof stringNumber !== 'number' || !strings.has(stringNumber)) return false
    }
    if (notes) {
      if (typeof note !== 'string' || !notes.has(note)) return false
    }
    return true
  })

  const parts: string[] = []
  if (strings) parts.push(`strings ${[...strings].sort((a, b) => a - b).join(', ')}`)
  if (notes) parts.push(`notes ${[...notes].join(', ')}`)

  return {
    ...deck,
    id: parts.length > 0 ? `${deck.id}__${parts.join('__').replace(/\s+/g, '-')}` : deck.id,
    description:
      parts.length > 0
        ? `${deck.description ? `${deck.description} ` : ''}Filtered: ${parts.join('; ')}.`
        : deck.description,
    cards,
  }
}
