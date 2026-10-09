import type { NeckPosition, NoteName } from './notes.ts'

export type ExerciseMode =
  | 'position-to-note'
  | 'note-to-position'
  | 'find-all'
  | 'octave'

export type TrainerConfig = {
  strings: number[]
  fretMin: number
  fretMax: number
  notes: NoteName[]
  modes: ExerciseMode[]
  questionCount: number
  timed: boolean
  /** Per-question time limit in seconds when timed is on. */
  timeLimitSec: number
  /** Re-insert incorrect items after this many subsequent questions. */
  retryDelay: number
}

export type PositionToNoteQuestion = {
  id: string
  kind: 'position-to-note'
  prompt: string
  position: NeckPosition
  acceptedNotes: NoteName[]
}

export type NoteToPositionQuestion = {
  id: string
  kind: 'note-to-position'
  prompt: string
  note: NoteName
  /** Any of these positions is a correct click. */
  accepted: NeckPosition[]
}

export type FindAllQuestion = {
  id: string
  kind: 'find-all'
  prompt: string
  note: NoteName
  targets: NeckPosition[]
}

export type OctaveQuestion = {
  id: string
  kind: 'octave'
  prompt: string
  origin: NeckPosition
  /** Other same-pitch-class positions in scope (must click one different from origin). */
  accepted: NeckPosition[]
}

export type TrainerQuestion =
  | PositionToNoteQuestion
  | NoteToPositionQuestion
  | FindAllQuestion
  | OctaveQuestion

export type AnswerPayload =
  | { kind: 'position-to-note'; text: string }
  | { kind: 'note-to-position'; stringNumber: number; fret: number }
  | { kind: 'find-all'; positions: Array<{ stringNumber: number; fret: number }> }
  | { kind: 'octave'; stringNumber: number; fret: number }

export type AnswerResult = {
  correct: boolean
  message: string
  expected?: string
}

export type AnswerRecord = {
  questionId: string
  kind: ExerciseMode
  correct: boolean
  responseTimeMs: number
  timedOut?: boolean
}

export type SessionStatus = 'idle' | 'active' | 'summary'

export type TrainerSession = {
  status: SessionStatus
  config: TrainerConfig
  queue: TrainerQuestion[]
  currentIndex: number
  current: TrainerQuestion | null
  answered: number
  correctCount: number
  incorrectCount: number
  records: AnswerRecord[]
  /** Question ids waiting to re-enter the queue. */
  retryQueue: Array<{ question: TrainerQuestion; afterIndex: number }>
  questionStartedAt: number | null
  completed: boolean
}

export const DEFAULT_CONFIG: TrainerConfig = {
  strings: [],
  fretMin: 0,
  fretMax: 12,
  notes: [],
  modes: ['position-to-note', 'note-to-position', 'find-all'],
  questionCount: 20,
  timed: false,
  timeLimitSec: 12,
  retryDelay: 3,
}

export const MODE_LABELS: Record<ExerciseMode, string> = {
  'position-to-note': 'Position → note',
  'note-to-position': 'Note → position',
  'find-all': 'Find all occurrences',
  octave: 'Octave / same pitch class',
}
