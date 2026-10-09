import { generateQuestions } from './generate.ts'
import type {
  AnswerPayload,
  AnswerRecord,
  AnswerResult,
  TrainerConfig,
  TrainerQuestion,
  TrainerSession,
} from './types.ts'
import { validateAnswer } from './validate.ts'

export function createIdleSession(config: TrainerConfig): TrainerSession {
  return {
    status: 'idle',
    config,
    queue: [],
    currentIndex: 0,
    current: null,
    answered: 0,
    correctCount: 0,
    incorrectCount: 0,
    records: [],
    retryQueue: [],
    questionStartedAt: null,
    completed: false,
  }
}

export function startSession(config: TrainerConfig): TrainerSession {
  const queue = generateQuestions(config)
  return {
    status: queue.length ? 'active' : 'idle',
    config,
    queue,
    currentIndex: 0,
    current: queue[0] ?? null,
    answered: 0,
    correctCount: 0,
    incorrectCount: 0,
    records: [],
    retryQueue: [],
    questionStartedAt: queue.length ? Date.now() : null,
    completed: queue.length === 0,
  }
}

function mergeRetries(
  session: TrainerSession,
  nextIndex: number,
  queue: TrainerQuestion[],
): { queue: TrainerQuestion[]; retryQueue: TrainerSession['retryQueue'] } {
  const due = session.retryQueue.filter((item) => item.afterIndex <= nextIndex)
  const remaining = session.retryQueue.filter((item) => item.afterIndex > nextIndex)
  if (due.length === 0) return { queue, retryQueue: remaining }

  const nextQueue = [...queue]
  let insertAt = Math.min(nextIndex + 1, nextQueue.length)
  for (const item of due) {
    const currentPrompt = nextQueue[nextIndex]?.prompt
    const at =
      currentPrompt && currentPrompt === item.question.prompt
        ? Math.min(insertAt + 1, nextQueue.length)
        : insertAt
    nextQueue.splice(at, 0, item.question)
    insertAt = at + 2
  }
  return { queue: nextQueue, retryQueue: remaining }
}

/** Grade the current answer without advancing. */
export function gradeAnswer(
  session: TrainerSession,
  payload: AnswerPayload,
  options?: { timedOut?: boolean },
): { session: TrainerSession; result: AnswerResult } {
  if (session.status !== 'active' || !session.current) {
    return {
      session,
      result: { correct: false, message: 'No active question.' },
    }
  }

  const timedOut = Boolean(options?.timedOut)
  const result = timedOut
    ? {
        correct: false as const,
        message: 'Time ran out.',
        expected:
          session.current.kind === 'position-to-note'
            ? session.current.position.note
            : undefined,
      }
    : validateAnswer(session.current, payload)

  const responseTimeMs = session.questionStartedAt
    ? Math.max(0, Date.now() - session.questionStartedAt)
    : 0

  const record: AnswerRecord = {
    questionId: session.current.id,
    kind: session.current.kind,
    correct: result.correct,
    responseTimeMs,
    timedOut,
  }

  let retryQueue = session.retryQueue
  if (!result.correct) {
    retryQueue = [
      ...retryQueue,
      {
        question: session.current,
        afterIndex: session.currentIndex + session.config.retryDelay,
      },
    ]
  }

  return {
    result,
    session: {
      ...session,
      answered: session.answered + 1,
      correctCount: session.correctCount + (result.correct ? 1 : 0),
      incorrectCount: session.incorrectCount + (result.correct ? 0 : 1),
      records: [...session.records, record],
      retryQueue,
      questionStartedAt: null,
    },
  }
}

/** Move to the next question after feedback. */
export function advanceSession(session: TrainerSession): TrainerSession {
  if (session.status !== 'active') return session

  const nextIndex = session.currentIndex + 1
  const merged = mergeRetries(session, nextIndex, session.queue)

  if (nextIndex >= merged.queue.length && merged.retryQueue.length === 0) {
    return {
      ...session,
      queue: merged.queue,
      retryQueue: merged.retryQueue,
      currentIndex: nextIndex,
      current: null,
      questionStartedAt: null,
      status: 'summary',
      completed: true,
    }
  }

  // Still have retries pending past the end — pull them in.
  if (nextIndex >= merged.queue.length && merged.retryQueue.length > 0) {
    const forced = mergeRetries(
      { ...session, retryQueue: merged.retryQueue.map((item) => ({ ...item, afterIndex: nextIndex })) },
      nextIndex,
      merged.queue,
    )
    const current = forced.queue[nextIndex] ?? null
    if (!current) {
      return {
        ...session,
        queue: forced.queue,
        retryQueue: forced.retryQueue,
        current: null,
        status: 'summary',
        completed: true,
        questionStartedAt: null,
      }
    }
    return {
      ...session,
      queue: forced.queue,
      retryQueue: forced.retryQueue,
      currentIndex: nextIndex,
      current,
      questionStartedAt: Date.now(),
    }
  }

  return {
    ...session,
    queue: merged.queue,
    retryQueue: merged.retryQueue,
    currentIndex: nextIndex,
    current: merged.queue[nextIndex] ?? null,
    questionStartedAt: Date.now(),
  }
}

export function endSession(session: TrainerSession): TrainerSession {
  return {
    ...session,
    status: 'summary',
    completed: true,
    current: null,
    questionStartedAt: null,
  }
}

export function sessionStats(session: TrainerSession) {
  const times = session.records.map((item) => item.responseTimeMs)
  const avgMs =
    times.length === 0 ? 0 : Math.round(times.reduce((sum, value) => sum + value, 0) / times.length)
  const accuracy =
    session.answered === 0 ? 0 : Math.round((session.correctCount / session.answered) * 100)

  const byKind = session.records.reduce<Record<string, { correct: number; total: number }>>(
    (acc, record) => {
      const bucket = acc[record.kind] ?? { correct: 0, total: 0 }
      bucket.total += 1
      if (record.correct) bucket.correct += 1
      acc[record.kind] = bucket
      return acc
    },
    {},
  )

  return { avgMs, accuracy, byKind }
}
