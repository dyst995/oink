import { GUITAR_STRINGS } from '../theory.ts'
import {
  drawCard,
  formatPosition,
  gradeAnswer,
  positionKey,
  rememberAttempt,
  scopeError,
  timingEnabled,
} from './engine.ts'
import type {
  AttemptRecord,
  BoardPosition,
  Flashcard,
  MissMemory,
  Selection,
  TrainerSettings,
  UserAnswer,
} from './types.ts'

export type PlayMode = 'practice' | 'review'

export type PlayStatus = 'asking' | 'revealed' | 'graded'

export type PlaySession = {
  settings: TrainerSettings
  cards: Flashcard[]
  index: number
  attempts: AttemptRecord[]
  status: PlayStatus
  correct: boolean | null
  startedAt: number
  selection: Selection | null
  memory: MissMemory
  mode: PlayMode
}

export function answerMatches(card: Flashcard, answer: UserAnswer): boolean {
  if (answer.kind === 'timeout' || answer.kind === 'self') return true
  if (card.mode === 'note-to-fret') return answer.kind === 'position'
  if (card.mode === 'note-to-degree') return answer.kind === 'degree'
  return answer.kind === 'note'
}

export function answerFromSelection(card: Flashcard, selection: Selection | null): UserAnswer | null {
  if (!selection) return null
  if (card.mode === 'note-to-fret' && selection.kind === 'position') {
    return { kind: 'position', stringId: selection.stringId, fret: selection.fret }
  }
  if (card.mode === 'note-to-degree' && selection.kind === 'degree') {
    return { kind: 'degree', text: selection.label }
  }
  if (
    (card.mode === 'fret-to-note' || card.mode === 'degree-to-note') &&
    selection.kind === 'note'
  ) {
    return { kind: 'note', text: selection.name }
  }
  return null
}

export function currentCard(session: PlaySession): Flashcard | null {
  return session.cards[session.index] ?? null
}

export function startPractice(
  settings: TrainerSettings,
  memory: MissMemory,
  now: number,
  rng?: () => number,
): { ok: true; session: PlaySession } | { ok: false; error: string } {
  const error = scopeError(settings)
  if (error) return { ok: false, error }
  const card = drawCard({ settings, memory, recent: [], serial: 0, rng })
  if (!card) return { ok: false, error: 'No notes of this scale fall in that range.' }
  return {
    ok: true,
    session: {
      settings,
      cards: [card],
      index: 0,
      attempts: [],
      status: 'asking',
      correct: null,
      startedAt: now,
      selection: null,
      memory,
      mode: 'practice',
    },
  }
}

export function startReview(
  cards: readonly Flashcard[],
  settings: TrainerSettings,
  memory: MissMemory,
  now: number,
): PlaySession {
  return {
    settings,
    cards: cards.map((card, index) => ({ ...card, id: `${card.signature}#review-${index}` })),
    index: 0,
    attempts: [],
    status: 'asking',
    correct: null,
    startedAt: now,
    selection: null,
    memory,
    mode: 'review',
  }
}

export function restartSession(session: PlaySession, now: number): PlaySession {
  if (session.cards.length === 0) return session
  return {
    ...session,
    index: 0,
    attempts: [],
    status: 'asking',
    correct: null,
    startedAt: now,
    selection: null,
  }
}

export function revealCard(session: PlaySession): PlaySession {
  if (session.status !== 'asking') return session
  return { ...session, status: 'revealed' }
}

export function chooseAnswer(session: PlaySession, selection: Selection | null): PlaySession {
  if (session.status !== 'asking') return session
  return { ...session, selection }
}

function labeled(position: BoardPosition): { positionKey: string; positionLabel: string } {
  return { positionKey: positionKey(position), positionLabel: formatPosition(position) }
}

function positionStat(
  card: Flashcard,
  answer: UserAnswer,
): { positionKey: string | null; positionLabel: string | null } {
  if (card.asked) return labeled(card.asked)
  if (card.positions.length === 1) return labeled(card.positions[0])
  if (answer.kind === 'position') {
    const known = card.positions.find(
      (position) => position.stringId === answer.stringId && position.fret === answer.fret,
    )
    if (known) return labeled(known)
    const guitarString = GUITAR_STRINGS.find((item) => item.id === answer.stringId)
    if (!guitarString) return { positionKey: `${answer.stringId}:${answer.fret}`, positionLabel: null }
    return labeled({
      stringId: guitarString.id,
      stringNumber: guitarString.number,
      stringLabel: guitarString.label,
      fret: answer.fret,
      pitchClass: 0,
    })
  }
  return { positionKey: null, positionLabel: null }
}

export function gradeSession(session: PlaySession, answer: UserAnswer, now: number): PlaySession {
  const card = currentCard(session)
  if (!card) return session
  if (session.status === 'graded') return session
  if (session.status === 'revealed' && answer.kind !== 'self') return session
  if (session.status === 'asking' && answer.kind === 'self') return session
  if (!answerMatches(card, answer)) return session

  const correct = gradeAnswer(card, answer)
  const responseMs = timingEnabled(session.settings)
    ? Math.max(0, Math.round(now - session.startedAt))
    : null
  const place = positionStat(card, answer)
  const attempt: AttemptRecord = {
    card,
    correct,
    responseMs,
    positionKey: place.positionKey,
    positionLabel: place.positionLabel,
  }
  return {
    ...session,
    status: 'graded',
    correct,
    attempts: [...session.attempts, attempt],
    memory: rememberAttempt(session.memory, attempt),
  }
}

export type AdvanceResult =
  | { type: 'card'; session: PlaySession }
  | { type: 'summary'; session: PlaySession }

export function advanceSession(session: PlaySession, now: number, rng?: () => number): AdvanceResult {
  if (session.status !== 'graded') return { type: 'card', session }
  const nextIndex = session.index + 1
  if (nextIndex < session.cards.length) {
    return {
      type: 'card',
      session: {
        ...session,
        index: nextIndex,
        status: 'asking',
        correct: null,
        selection: null,
        startedAt: now,
      },
    }
  }

  const limit = session.mode === 'review' ? session.cards.length : session.settings.questionCount
  if (limit != null && nextIndex >= limit) return { type: 'summary', session }

  const card = drawCard({
    settings: session.settings,
    memory: session.memory,
    recent: session.cards,
    serial: nextIndex,
    rng,
  })
  if (!card) return { type: 'summary', session }
  return {
    type: 'card',
    session: {
      ...session,
      cards: [...session.cards, card],
      index: nextIndex,
      status: 'asking',
      correct: null,
      selection: null,
      startedAt: now,
    },
  }
}

