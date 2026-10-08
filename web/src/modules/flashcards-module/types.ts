export type FlashcardMeta = {
  string?: number
  stringLabel?: string
  fret?: number
  note?: string
  [key: string]: string | number | undefined
}

export type Flashcard = {
  id: string
  front: string
  back: string
  tags?: string[]
  meta?: FlashcardMeta
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

export type FlashcardDeckFilter = {
  /** Empty or undefined = all strings. */
  strings?: number[]
  /** Empty or undefined = all notes. */
  notes?: string[]
}
