export type ExerciseMode = 'note-to-fret' | 'fret-to-note' | 'note-to-degree' | 'degree-to-note'

export type FretVariation = 'string' | 'any'

export type RangeMode = 'entire' | 'custom'

export type TrainerSettings = {
  tonic: string
  scaleId: string
  modes: ExerciseMode[]
  /** Used when Note → string and fret is enabled. */
  variations: FretVariation[]
  range: RangeMode
  fretMin: number
  fretMax: number
  /** null means every string. An empty list is an invalid custom range. */
  stringNumbers: number[] | null
  /** null means no CAGED shape filter. */
  shapeId: number | null
  /** null means unlimited. */
  questionCount: number | null
  trackTime: boolean
  /** null means no per-card countdown. Ignored unless trackTime is on. */
  timeLimitSec: number | null
  autoAdvance: boolean
  prioritizeMisses: boolean
  hideBoardUntilReveal: boolean
}

export type BoardPosition = {
  stringId: string
  stringNumber: number
  stringLabel: string
  fret: number
  pitchClass: number
}

export type Flashcard = {
  id: string
  mode: ExerciseMode
  variation: FretVariation | null
  prompt: string
  hint: string | null
  context: string
  noteName: string
  pitchClass: number
  degreeLabel: string
  /** Named string for a specific-string question. */
  stringId: string | null
  /** The position named in a string-and-fret → note question. */
  asked: BoardPosition | null
  /** Correct positions inside the selected range. Also highlighted after the answer. */
  positions: BoardPosition[]
  /** Short form of the answer. */
  expected: string
  /** Sentence shown after reveal, including the note and its degree. */
  reveal: string
  signature: string
}

export type UserAnswer =
  | { kind: 'position'; stringId: string; fret: number }
  | { kind: 'note'; text: string }
  | { kind: 'degree'; text: string }
  | { kind: 'self'; correct: boolean }
  | { kind: 'timeout' }

export type Selection =
  | { kind: 'position'; stringId: string; fret: number }
  | { kind: 'note'; name: string }
  | { kind: 'degree'; label: string }

export type AttemptRecord = {
  card: Flashcard
  correct: boolean
  responseMs: number | null
  positionKey: string | null
  positionLabel: string | null
}

export type MissMemory = {
  notes: Record<string, number>
  degrees: Record<string, number>
  positions: Record<string, number>
  modes: Record<string, number>
}

export type ModeStats = {
  correct: number
  incorrect: number
  accuracy: number
}

export type MissCount = {
  label: string
  count: number
}

export type SessionSummary = {
  answered: number
  correct: number
  incorrect: number
  accuracy: number
  streak: number
  averageResponseMs: number | null
  byMode: Partial<Record<ExerciseMode, ModeStats>>
  missedNotes: MissCount[]
  missedDegrees: MissCount[]
  missedPositions: MissCount[]
}

export const MODE_LABELS: Record<ExerciseMode, string> = {
  'note-to-fret': 'Note → string and fret',
  'fret-to-note': 'String and fret → note',
  'note-to-degree': 'Note → scale degree',
  'degree-to-note': 'Scale degree → note',
}

export const EXERCISE_MODES: readonly ExerciseMode[] = [
  'note-to-fret',
  'fret-to-note',
  'note-to-degree',
  'degree-to-note',
]
