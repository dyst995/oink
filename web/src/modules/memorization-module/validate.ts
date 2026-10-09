import { describePosition, parseNoteAnswer, positionKey } from './notes.ts'
import type { AnswerPayload, AnswerResult, TrainerQuestion } from './types.ts'

export function validateAnswer(question: TrainerQuestion, payload: AnswerPayload): AnswerResult {
  if (question.kind === 'position-to-note') {
    if (payload.kind !== 'position-to-note') {
      return { correct: false, message: 'Type a note name.', expected: question.position.note }
    }
    const parsed = parseNoteAnswer(payload.text)
    if (!parsed) {
      return {
        correct: false,
        message: 'Could not read that note. Try C, F#, Bb, etc.',
        expected: question.position.note,
      }
    }
    const correct = question.acceptedNotes.includes(parsed)
    return {
      correct,
      message: correct
        ? `Correct — ${question.position.note}.`
        : `Not quite. That position is ${question.position.note}.`,
      expected: question.position.note,
    }
  }

  if (question.kind === 'note-to-position') {
    if (payload.kind !== 'note-to-position') {
      return { correct: false, message: 'Tap a fretboard position.' }
    }
    const hit = question.accepted.some(
      (position) =>
        position.stringNumber === payload.stringNumber && position.fret === payload.fret,
    )
    return {
      correct: hit,
      message: hit
        ? `Correct — that is ${question.note}.`
        : `That spot is not ${question.note} in your practice range.`,
      expected: question.accepted.map(describePosition).slice(0, 3).join('; '),
    }
  }

  if (question.kind === 'find-all') {
    if (payload.kind !== 'find-all') {
      return { correct: false, message: 'Select all matching positions, then check.' }
    }
    const targetKeys = new Set(question.targets.map(positionKey))
    const selectedKeys = new Set(
      payload.positions.map((item) => positionKey(item)),
    )
    const missing = [...targetKeys].filter((key) => !selectedKeys.has(key))
    const extra = [...selectedKeys].filter((key) => !targetKeys.has(key))
    const correct = missing.length === 0 && extra.length === 0
    if (correct) {
      return {
        correct: true,
        message: `Perfect — all ${question.targets.length} ${question.note} positions.`,
      }
    }
    const parts: string[] = []
    if (missing.length) parts.push(`${missing.length} missing`)
    if (extra.length) parts.push(`${extra.length} incorrect`)
    return {
      correct: false,
      message: `Not complete (${parts.join(', ')}).`,
      expected: `${question.targets.length} positions`,
    }
  }

  // octave
  if (payload.kind !== 'octave') {
    return { correct: false, message: 'Tap another same pitch-class position.' }
  }
  if (
    payload.stringNumber === question.origin.stringNumber &&
    payload.fret === question.origin.fret
  ) {
    return { correct: false, message: 'Pick a different string or fret.' }
  }
  const hit = question.accepted.some(
    (position) =>
      position.stringNumber === payload.stringNumber && position.fret === payload.fret,
  )
  return {
    correct: hit,
    message: hit
      ? `Correct — another ${question.origin.note}.`
      : `That is not the same pitch class as ${question.origin.note}.`,
  }
}
