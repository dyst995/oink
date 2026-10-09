import {
  NOTE_NAMES,
  allPositions,
  describePosition,
  occurrencesOf,
  type NeckPosition,
  type NoteName,
} from './notes.ts'
import type { ExerciseMode, TrainerConfig, TrainerQuestion } from './types.ts'

function shuffleInPlace<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[items[index], items[swap]] = [items[swap], items[index]]
  }
  return items
}

function pick<T>(items: readonly T[]): T | null {
  if (items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)] ?? null
}

function scope(config: TrainerConfig) {
  return {
    strings: config.strings.length ? config.strings : undefined,
    fretMin: config.fretMin,
    fretMax: config.fretMax,
    notes: config.notes.length ? config.notes : undefined,
  }
}

function activeNotes(config: TrainerConfig): NoteName[] {
  return config.notes.length ? config.notes : [...NOTE_NAMES]
}

function makeId(kind: ExerciseMode, seed: string): string {
  return `${kind}:${seed}:${Math.random().toString(36).slice(2, 8)}`
}

function createPositionToNote(position: NeckPosition): TrainerQuestion {
  return {
    id: makeId('position-to-note', `${position.stringNumber}-${position.fret}`),
    kind: 'position-to-note',
    prompt: `What pitch class is at ${describePosition(position)}?`,
    position,
    acceptedNotes: [position.note],
  }
}

function createNoteToPosition(note: NoteName, accepted: NeckPosition[]): TrainerQuestion | null {
  if (accepted.length === 0) return null
  return {
    id: makeId('note-to-position', note),
    kind: 'note-to-position',
    prompt: `Tap any ${note} on the fretboard (within your practice range).`,
    note,
    accepted,
  }
}

function createFindAll(note: NoteName, targets: NeckPosition[]): TrainerQuestion | null {
  if (targets.length === 0) return null
  return {
    id: makeId('find-all', note),
    kind: 'find-all',
    prompt: `Select every ${note} in your practice range (${targets.length} total).`,
    note,
    targets,
  }
}

function createOctave(origin: NeckPosition, others: NeckPosition[]): TrainerQuestion | null {
  const accepted = others.filter(
    (item) => item.stringNumber !== origin.stringNumber || item.fret !== origin.fret,
  )
  if (accepted.length === 0) return null
  return {
    id: makeId('octave', `${origin.stringNumber}-${origin.fret}`),
    kind: 'octave',
    prompt: `Find another ${origin.note} (same pitch class, different string or fret) from ${describePosition(origin)}.`,
    origin,
    accepted,
  }
}

function questionForMode(mode: ExerciseMode, config: TrainerConfig): TrainerQuestion | null {
  const options = scope(config)
  const pool = allPositions(options)
  if (pool.length === 0) return null

  if (mode === 'position-to-note') {
    const position = pick(pool)
    return position ? createPositionToNote(position) : null
  }

  if (mode === 'note-to-position') {
    const note = pick(activeNotes(config))
    if (!note) return null
    return createNoteToPosition(note, occurrencesOf(note, options))
  }

  if (mode === 'find-all') {
    const candidates = activeNotes(config)
      .map((note) => ({ note, targets: occurrencesOf(note, options) }))
      .filter((item) => item.targets.length >= 2)
    const chosen = pick(candidates)
    if (!chosen) return null
    return createFindAll(chosen.note, chosen.targets)
  }

  // octave
  const withOthers = pool
    .map((origin) => ({
      origin,
      others: occurrencesOf(origin.note, options),
    }))
    .filter((item) => item.others.length >= 2)
  const chosen = pick(withOthers)
  if (!chosen) return null
  return createOctave(chosen.origin, chosen.others)
}

export function generateQuestions(config: TrainerConfig): TrainerQuestion[] {
  const modes = config.modes.length ? config.modes : (['position-to-note'] as ExerciseMode[])
  const questions: TrainerQuestion[] = []
  let attempts = 0
  const maxAttempts = config.questionCount * 8

  while (questions.length < config.questionCount && attempts < maxAttempts) {
    attempts += 1
    const mode = modes[questions.length % modes.length]
    const question = questionForMode(mode, config)
    if (!question) continue
    const duplicate = questions.some(
      (item) => item.kind === question.kind && item.prompt === question.prompt,
    )
    if (duplicate) continue
    questions.push(question)
  }

  return shuffleInPlace(questions)
}

export function canBuildSession(config: TrainerConfig): { ok: true } | { ok: false; reason: string } {
  if (config.modes.length === 0) {
    return { ok: false, reason: 'Choose at least one exercise type.' }
  }
  if (config.fretMin > config.fretMax) {
    return { ok: false, reason: 'Fret range is invalid.' }
  }
  if (config.questionCount < 1) {
    return { ok: false, reason: 'Ask for at least one question.' }
  }
  const pool = allPositions(scope(config))
  if (pool.length === 0) {
    return { ok: false, reason: 'No positions match that string / fret / note filter.' }
  }
  if (config.modes.includes('find-all') || config.modes.includes('octave')) {
    const notes = activeNotes(config)
    const hasMulti = notes.some((note) => occurrencesOf(note, scope(config)).length >= 2)
    if (!hasMulti && config.modes.every((mode) => mode === 'find-all' || mode === 'octave')) {
      return {
        ok: false,
        reason: 'Widen the range so some notes appear more than once (needed for Find all / Octave).',
      }
    }
  }
  return { ok: true }
}
