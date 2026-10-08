export type Flashcard = {
  id: string
  front: string
  back: string
  tags?: string[]
}

export type FlashcardDeck = {
  id: string
  title: string
  description?: string
  cards: Flashcard[]
}

export type FlashcardDeckJson = {
  id?: unknown
  title?: unknown
  description?: unknown
  cards?: unknown
}
