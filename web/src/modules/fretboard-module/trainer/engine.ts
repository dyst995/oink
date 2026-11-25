import { buildScaleShapes, type ScaleShape } from '../shapes.ts'
import {
  FORMULA_PRESETS,
  FRET_COUNT,
  GUITAR_STRINGS,
  KEY_OPTIONS,
  parseFormula,
  parseKey,
  pitchClassAt,
  type FormulaPreset,
  type FormulaTone,
  type GuitarString,
  type ParsedKey,
} from '../theory.ts'
import type {
  BoardPosition,
  ExerciseMode,
  Flashcard,
  MissCount,
  MissMemory,
  ModeStats,
  SessionSummary,
  TrainerSettings,
  UserAnswer,
} from './types.ts'

export const TRAINER_SCALES: readonly FormulaPreset[] = FORMULA_PRESETS.filter(
  (preset) =>
    preset.category === 'scales' || preset.category === 'pentatonics' || preset.category === 'modes',
)

export const DEFAULT_SETTINGS: TrainerSettings = {
  tonic: 'G',
  scaleId: 'major',
  modes: ['note-to-fret', 'fret-to-note', 'note-to-degree', 'degree-to-note'],
  variations: ['string', 'any'],
  range: 'entire',
  fretMin: 0,
  fretMax: 12,
  stringNumbers: null,
  shapeId: null,
  questionCount: 20,
  trackTime: false,
  timeLimitSec: null,
  autoAdvance: false,
  prioritizeMisses: false,
  hideBoardUntilReveal: false,
}

export type ResolvedPractice = {
  key: ParsedKey
  preset: FormulaPreset
  tones: FormulaTone[]
  positions: BoardPosition[]
  shape: ScaleShape | null
  context: string
}

type Scope = {
  fretMin: number
  fretMax: number
  stringNumbers: number[] | null
  shapeId: number | null
}

export function emptyMemory(): MissMemory {
  return { notes: {}, degrees: {}, positions: {}, modes: {} }
}

export function fretOrdinal(fret: number): string {
  if (fret === 0) return 'open'
  const mod100 = fret % 100
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? 'th'
      : fret % 10 === 1
        ? 'st'
        : fret % 10 === 2
          ? 'nd'
          : fret % 10 === 3
            ? 'rd'
            : 'th'
  return `${fret}${suffix}`
}

export function stringName(stringNumber: number, label: string): string {
  if (stringNumber === 6 && label === 'E') return 'low E string'
  if (stringNumber === 1 && label === 'e') return 'high e string'
  return `${label} string`
}

export function formatPosition(position: BoardPosition): string {
  const place = position.fret === 0 ? 'open' : `${fretOrdinal(position.fret)} fret`
  return `${stringName(position.stringNumber, position.stringLabel)}, ${place}`
}

export function positionKey(position: Pick<BoardPosition, 'stringId' | 'fret'>): string {
  return `${position.stringId}:${position.fret}`
}

export function parsePitchClass(input: string): number | null {
  const compact = input
    .trim()
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .replace(/sharp/gi, '#')
    .replace(/flat/gi, 'b')
    .replace(/\s+/g, '')
  if (!compact) return null
  try {
    return parseKey(compact).pitchClass
  } catch {
    return null
  }
}

/** Canonical degree text so ♭3, b3, and "flat 3" match. */
export function normalizeDegree(input: string): string | null {
  const compact = input
    .trim()
    .toLowerCase()
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .replace(/sharp/g, '#')
    .replace(/flat/g, 'b')
    .replace(/\s+/g, '')
  const match = compact.match(/^(bb|##|b|#)?(1[0-3]|[1-9])$/)
  if (!match) return null
  const alter = match[1] ?? ''
  const glyph = alter === 'bb' ? '♭♭' : alter === 'b' ? '♭' : alter === '##' ? '♯♯' : alter === '#' ? '♯' : ''
  return `${glyph}${match[2]}`
}

export function scaleSummary(
  tonic: string,
  scaleId: string,
): { context: string; notes: string; degrees: string } | null {
  const preset = TRAINER_SCALES.find((item) => item.id === scaleId)
  if (!preset) return null
  try {
    const key = parseKey(tonic)
    const tones = parseFormula(preset.formula, key, preset.kind ?? 'degrees').tones
    return {
      context: contextLabel(key, preset),
      notes: tones.map((tone) => tone.name).join(' '),
      degrees: tones.map((tone) => tone.degreeLabel).join(' '),
    }
  } catch {
    return null
  }
}

function contextLabel(key: ParsedKey, preset: FormulaPreset): string {
  return `${key.name} ${preset.label.toLowerCase()}`
}

function activeScope(settings: TrainerSettings): Scope {
  if (settings.range === 'entire') {
    return { fretMin: 0, fretMax: FRET_COUNT, stringNumbers: null, shapeId: null }
  }
  return {
    fretMin: settings.fretMin,
    fretMax: settings.fretMax,
    stringNumbers: settings.stringNumbers,
    shapeId: settings.shapeId,
  }
}

export function scopeError(
  settings: TrainerSettings,
  strings: readonly GuitarString[] = GUITAR_STRINGS,
): string | null {
  if (!KEY_OPTIONS.includes(settings.tonic as (typeof KEY_OPTIONS)[number])) {
    return 'Choose a tonic.'
  }
  if (!TRAINER_SCALES.some((preset) => preset.id === settings.scaleId)) {
    return 'Choose a scale.'
  }
  if (settings.modes.length === 0) return 'Select at least one exercise.'
  if (settings.modes.includes('note-to-fret') && settings.variations.length === 0) {
    return 'Select a string-and-fret variation.'
  }
  if (
    settings.questionCount != null &&
    (!Number.isInteger(settings.questionCount) ||
      settings.questionCount < 1 ||
      settings.questionCount > 200)
  ) {
    return 'Use 1 to 200 cards, or turn on unlimited.'
  }
  if (
    settings.trackTime &&
    settings.timeLimitSec != null &&
    (!Number.isInteger(settings.timeLimitSec) ||
      settings.timeLimitSec < 3 ||
      settings.timeLimitSec > 120)
  ) {
    return 'Time limit must be from 3 to 120 seconds.'
  }

  const scope = activeScope(settings)
  if (
    !Number.isInteger(scope.fretMin) ||
    !Number.isInteger(scope.fretMax) ||
    scope.fretMin < 0 ||
    scope.fretMax > FRET_COUNT ||
    scope.fretMin > scope.fretMax
  ) {
    return 'Fret range must run from a lower fret to a higher one.'
  }
  if (scope.stringNumbers && scope.stringNumbers.length === 0) return 'Select at least one string.'
  if (
    scope.stringNumbers &&
    scope.stringNumbers.every((number) => !strings.some((string) => string.number === number))
  ) {
    return 'Select at least one string.'
  }

  let key: ParsedKey
  try {
    key = parseKey(settings.tonic)
  } catch {
    return 'Choose a tonic.'
  }
  if (scope.shapeId != null) {
    const shapes = buildScaleShapes(key.pitchClass)
    const shape = shapes.find((item) => item.id === scope.shapeId)
    if (!shape) return "That shape isn't available for this key."
    if (shape.frets.every((fret) => fret < scope.fretMin || fret > scope.fretMax)) {
      return 'That shape sits outside the fret range.'
    }
  }

  const resolved = resolvePractice(settings, strings)
  if (!resolved.ok) return resolved.error
  if (resolved.practice.positions.length === 0) {
    return 'No notes of this scale fall in that range.'
  }
  return null
}

export function resolvePractice(
  settings: TrainerSettings,
  strings: readonly GuitarString[] = GUITAR_STRINGS,
): { ok: true; practice: ResolvedPractice } | { ok: false; error: string } {
  const preset = TRAINER_SCALES.find((item) => item.id === settings.scaleId)
  if (!preset) return { ok: false, error: 'Choose a scale.' }

  let key: ParsedKey
  try {
    key = parseKey(settings.tonic)
  } catch {
    return { ok: false, error: 'Choose a tonic.' }
  }

  let tones: FormulaTone[]
  try {
    tones = parseFormula(preset.formula, key, preset.kind ?? 'degrees').tones
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'That scale could not be built.'
    return { ok: false, error: message }
  }
  if (tones.length === 0) return { ok: false, error: 'That scale has no notes.' }

  const scope = activeScope(settings)
  const shapes = buildScaleShapes(key.pitchClass)
  const shape =
    scope.shapeId == null ? null : (shapes.find((item) => item.id === scope.shapeId) ?? null)
  if (scope.shapeId != null && !shape) {
    return { ok: false, error: "That shape isn't available for this key." }
  }

  const pitchClasses = new Set(tones.map((tone) => tone.pitchClass))
  const allowedStrings = scope.stringNumbers ? new Set(scope.stringNumbers) : null
  const shapeFrets = shape ? new Set(shape.frets) : null
  const positions: BoardPosition[] = []

  for (const guitarString of strings) {
    if (allowedStrings && !allowedStrings.has(guitarString.number)) continue
    for (let fret = scope.fretMin; fret <= scope.fretMax; fret += 1) {
      if (shapeFrets && !shapeFrets.has(fret)) continue
      const pitchClass = pitchClassAt(guitarString.openPitchClass, fret)
      if (!pitchClasses.has(pitchClass)) continue
      positions.push({
        stringId: guitarString.id,
        stringNumber: guitarString.number,
        stringLabel: guitarString.label,
        fret,
        pitchClass,
      })
    }
  }

  return {
    ok: true,
    practice: {
      key,
      preset,
      tones,
      positions,
      shape,
      context: contextLabel(key, preset),
    },
  }
}

function joinOr(items: readonly string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} or ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, or ${items[items.length - 1]}`
}

function fretPhrase(frets: readonly number[]): string {
  const phrases = [...frets]
    .sort((a, b) => a - b)
    .map((fret) => (fret === 0 ? 'open' : `${fretOrdinal(fret)} fret`))
  return joinOr(phrases)
}

function describePositions(positions: readonly BoardPosition[]): string {
  const grouped = new Map<string, { position: BoardPosition; frets: number[] }>()
  for (const position of positions) {
    const current = grouped.get(position.stringId)
    if (current) current.frets.push(position.fret)
    else grouped.set(position.stringId, { position, frets: [position.fret] })
  }
  const parts = [...grouped.values()].map(
    (group) =>
      `${stringName(group.position.stringNumber, group.position.stringLabel)}, ${fretPhrase(group.frets)}`,
  )
  if (parts.length <= 6) return parts.join('; ')
  return `${parts.slice(0, 6).join('; ')}; and ${parts.length - 6} more`
}

function revealSentence(
  noteName: string,
  degreeLabel: string,
  context: string,
  positions: readonly BoardPosition[],
  mode: ExerciseMode,
): string {
  const place = describePositions(positions)
  if (mode === 'note-to-degree') {
    return `${noteName} is degree ${degreeLabel} in ${context}. ${place}.`
  }
  if (mode === 'degree-to-note') {
    return `Degree ${degreeLabel} in ${context} is ${noteName}. ${place}.`
  }
  if (mode === 'fret-to-note') {
    return `${place} is ${noteName}, degree ${degreeLabel} in ${context}.`
  }
  return `${noteName} is at ${place}. Degree ${degreeLabel} in ${context}.`
}

function makeCard(
  partial: Omit<Flashcard, 'id' | 'reveal'> & { serial: number },
): Flashcard {
  const { serial, ...rest } = partial
  return {
    ...rest,
    id: `${rest.signature}#${serial}`,
    reveal: revealSentence(rest.noteName, rest.degreeLabel, rest.context, rest.positions, rest.mode),
  }
}

function toneFor(tones: readonly FormulaTone[], pitchClass: number): FormulaTone | null {
  return tones.find((tone) => tone.pitchClass === pitchClass) ?? null
}

export function enumerateCards(
  settings: TrainerSettings,
  strings: readonly GuitarString[] = GUITAR_STRINGS,
): Flashcard[] {
  const resolved = resolvePractice(settings, strings)
  if (!resolved.ok || resolved.practice.positions.length === 0) return []
  const { tones, positions, context } = resolved.practice
  const cards: Flashcard[] = []
  let serial = 0

  const modes = new Set(settings.modes)
  if (modes.has('fret-to-note')) {
    for (const position of positions) {
      const tone = toneFor(tones, position.pitchClass)
      if (!tone) continue
      const signature = `fret-to-note:${position.stringId}:${position.fret}`
      cards.push(
        makeCard({
          serial,
          mode: 'fret-to-note',
          variation: null,
          prompt: `${formatPosition(position)}.`,
          hint: 'Name the note.',
          context,
          noteName: tone.name,
          pitchClass: tone.pitchClass,
          degreeLabel: tone.degreeLabel,
          stringId: null,
          asked: position,
          positions: [position],
          expected: tone.name,
          signature,
        }),
      )
      serial += 1
    }
  }

  if (modes.has('note-to-fret')) {
    if (settings.variations.includes('string')) {
      const groups = new Map<string, BoardPosition[]>()
      for (const position of positions) {
        const key = `${position.pitchClass}:${position.stringId}`
        const group = groups.get(key)
        if (group) group.push(position)
        else groups.set(key, [position])
      }
      for (const group of groups.values()) {
        const tone = toneFor(tones, group[0].pitchClass)
        if (!tone) continue
        const sample = group[0]
        const signature = `note-to-fret:string:${sample.pitchClass}:${sample.stringId}`
        cards.push(
          makeCard({
            serial,
            mode: 'note-to-fret',
            variation: 'string',
            prompt: `Where is ${tone.name} on the ${stringName(sample.stringNumber, sample.stringLabel)}?`,
            hint: 'Name the fret.',
            context,
            noteName: tone.name,
            pitchClass: tone.pitchClass,
            degreeLabel: tone.degreeLabel,
            stringId: sample.stringId,
            asked: null,
            positions: [...group].sort((a, b) => a.fret - b.fret),
            expected: fretPhrase(group.map((position) => position.fret)),
            signature,
          }),
        )
        serial += 1
      }
    }
    if (settings.variations.includes('any')) {
      const groups = new Map<number, BoardPosition[]>()
      for (const position of positions) {
        const group = groups.get(position.pitchClass)
        if (group) group.push(position)
        else groups.set(position.pitchClass, [position])
      }
      for (const group of groups.values()) {
        const tone = toneFor(tones, group[0].pitchClass)
        if (!tone) continue
        const signature = `note-to-fret:any:${tone.pitchClass}`
        cards.push(
          makeCard({
            serial,
            mode: 'note-to-fret',
            variation: 'any',
            prompt: `Where is ${tone.name}?`,
            hint: 'Any string and fret in range.',
            context,
            noteName: tone.name,
            pitchClass: tone.pitchClass,
            degreeLabel: tone.degreeLabel,
            stringId: null,
            asked: null,
            positions: [...group].sort((a, b) => a.stringNumber - b.stringNumber || a.fret - b.fret),
            expected: describePositions(group),
            signature,
          }),
        )
        serial += 1
      }
    }
  }

  const tonesInRange = tones.filter((tone) => positions.some((position) => position.pitchClass === tone.pitchClass))

  if (modes.has('note-to-degree')) {
    for (const tone of tonesInRange) {
      const related = positions.filter((position) => position.pitchClass === tone.pitchClass)
      const signature = `note-to-degree:${tone.pitchClass}`
      cards.push(
        makeCard({
          serial,
          mode: 'note-to-degree',
          variation: null,
          prompt: `What is the scale degree of ${tone.name}?`,
          hint: null,
          context,
          noteName: tone.name,
          pitchClass: tone.pitchClass,
          degreeLabel: tone.degreeLabel,
          stringId: null,
          asked: null,
          positions: related,
          expected: tone.degreeLabel,
          signature,
        }),
      )
      serial += 1
    }
  }

  if (modes.has('degree-to-note')) {
    for (const tone of tonesInRange) {
      const related = positions.filter((position) => position.pitchClass === tone.pitchClass)
      const signature = `degree-to-note:${tone.degreeLabel}`
      cards.push(
        makeCard({
          serial,
          mode: 'degree-to-note',
          variation: null,
          prompt: `What note corresponds to degree ${tone.degreeLabel}?`,
          hint: null,
          context,
          noteName: tone.name,
          pitchClass: tone.pitchClass,
          degreeLabel: tone.degreeLabel,
          stringId: null,
          asked: null,
          positions: related,
          expected: tone.name,
          signature,
        }),
      )
      serial += 1
    }
  }

  return cards
}

export type DrawInput = {
  settings: TrainerSettings
  memory: MissMemory
  recent: readonly Flashcard[]
  serial: number
  rng?: () => number
  strings?: readonly GuitarString[]
}

function cardWeight(card: Flashcard, input: DrawInput, recentSignatures: ReadonlySet<string>): number {
  let weight = 1
  if (input.settings.prioritizeMisses) {
    weight += (input.memory.notes[String(card.pitchClass)] ?? 0) * 4
    weight += (input.memory.degrees[card.degreeLabel] ?? 0) * 4
    weight += (input.memory.modes[card.mode] ?? 0) * 1.5
    for (const position of card.positions) {
      weight += (input.memory.positions[positionKey(position)] ?? 0) * 2
    }
  }
  if (recentSignatures.has(card.signature)) weight *= 0.12
  const last = input.recent[input.recent.length - 1]
  if (
    last &&
    last.signature !== card.signature &&
    last.mode === card.mode &&
    last.pitchClass === card.pitchClass
  ) {
    weight *= 0.2
  }
  return weight
}

function pickWeighted<T>(entries: Array<{ item: T; weight: number }>, rng: () => number): T | null {
  const usable = entries.filter((entry) => entry.weight > 0)
  if (usable.length === 0) return null
  const total = usable.reduce((sum, entry) => sum + entry.weight, 0)
  let cursor = rng() * total
  for (const entry of usable) {
    cursor -= entry.weight
    if (cursor <= 0) return entry.item
  }
  return usable[usable.length - 1].item
}

function pickGroup<T extends string>(
  cards: readonly Flashcard[],
  groupOf: (card: Flashcard) => T,
  lastGroup: T | null,
  weightOf: (group: T) => number,
  rng: () => number,
): Flashcard[] {
  const groups = new Map<T, Flashcard[]>()
  for (const card of cards) {
    const key = groupOf(card)
    const list = groups.get(key)
    if (list) list.push(card)
    else groups.set(key, [card])
  }
  const entries = [...groups.entries()].map(([group, items]) => {
    let weight = weightOf(group)
    if (lastGroup === group && groups.size > 1) weight *= 0.35
    return { item: items, weight }
  })
  return pickWeighted(entries, rng) ?? [...cards]
}

export function drawCard(input: DrawInput): Flashcard | null {
  const pool = enumerateCards(input.settings, input.strings)
  if (pool.length === 0) return null
  const rng = input.rng ?? Math.random
  const last = input.recent[input.recent.length - 1]
  const modeCards = pickGroup(
    pool,
    (card) => card.mode,
    last?.mode ?? null,
    (mode) => 1 + (input.settings.prioritizeMisses ? (input.memory.modes[mode] ?? 0) * 1.5 : 0),
    rng,
  )
  const variationCards =
    modeCards.some((card) => card.variation) && new Set(modeCards.map((card) => card.variation)).size > 1
      ? pickGroup(
          modeCards,
          (card) => card.variation ?? 'string',
          last?.variation ?? null,
          () => 1,
          rng,
        )
      : modeCards
  const withoutImmediate = last
    ? variationCards.filter((card) => card.signature !== last.signature)
    : variationCards
  const candidates = withoutImmediate.length > 0 ? withoutImmediate : variationCards
  const recentSignatures = new Set(input.recent.slice(-8).map((card) => card.signature))
  const picked = pickWeighted(
    candidates.map((card) => ({ item: card, weight: cardWeight(card, input, recentSignatures) })),
    rng,
  )
  if (!picked) return null
  return { ...picked, id: `${picked.signature}#${input.serial}` }
}

export function drawSession(
  settings: TrainerSettings,
  count: number,
  memory: MissMemory = emptyMemory(),
  rng: () => number = Math.random,
  strings: readonly GuitarString[] = GUITAR_STRINGS,
): Flashcard[] {
  const cards: Flashcard[] = []
  for (let index = 0; index < count; index += 1) {
    const card = drawCard({ settings, memory, recent: cards, serial: index, rng, strings })
    if (!card) break
    cards.push(card)
  }
  return cards
}

export function gradeAnswer(card: Flashcard, answer: UserAnswer): boolean {
  if (answer.kind === 'timeout') return false
  if (answer.kind === 'self') return answer.correct
  if (card.mode === 'note-to-fret') {
    if (answer.kind !== 'position') return false
    return card.positions.some(
      (position) => position.stringId === answer.stringId && position.fret === answer.fret,
    )
  }
  if (card.mode === 'note-to-degree') {
    if (answer.kind !== 'degree') return false
    const given = normalizeDegree(answer.text)
    const expected = normalizeDegree(card.degreeLabel)
    return given != null && given === expected
  }
  if (answer.kind !== 'note') return false
  return parsePitchClass(answer.text) === card.pitchClass
}

function bump(record: Record<string, number>, key: string, delta: number): Record<string, number> {
  const value = Math.max(0, Math.min(24, (record[key] ?? 0) + delta))
  if (value === 0) {
    const next = { ...record }
    delete next[key]
    return next
  }
  return { ...record, [key]: value }
}

export function rememberAttempt(
  memory: MissMemory,
  attempt: { card: Flashcard; correct: boolean },
): MissMemory {
  const delta = attempt.correct ? -1 : 1
  let positions = { ...memory.positions }
  for (const position of attempt.card.positions) {
    positions = bump(positions, positionKey(position), delta)
  }
  return {
    notes: bump(memory.notes, String(attempt.card.pitchClass), delta),
    degrees: bump(memory.degrees, attempt.card.degreeLabel, delta),
    modes: bump(memory.modes, attempt.card.mode, delta),
    positions,
  }
}

function percent(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

function topMisses(counts: Map<string, number>): MissCount[] {
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 6)
}

export function summarizeAttempts(
  attempts: readonly { card: Flashcard; correct: boolean; responseMs: number | null; positionLabel: string | null }[],
  trackTime: boolean,
): SessionSummary {
  let correct = 0
  let streak = 0
  const byMode: Partial<Record<ExerciseMode, ModeStats>> = {}
  const missedNotes = new Map<string, number>()
  const missedDegrees = new Map<string, number>()
  const missedPositions = new Map<string, number>()
  const times: number[] = []

  for (const attempt of attempts) {
    if (attempt.correct) correct += 1
    const mode = byMode[attempt.card.mode] ?? { correct: 0, incorrect: 0, accuracy: 0 }
    if (attempt.correct) mode.correct += 1
    else mode.incorrect += 1
    byMode[attempt.card.mode] = mode
    if (attempt.responseMs != null) times.push(attempt.responseMs)
    if (!attempt.correct) {
      missedNotes.set(attempt.card.noteName, (missedNotes.get(attempt.card.noteName) ?? 0) + 1)
      missedDegrees.set(
        attempt.card.degreeLabel,
        (missedDegrees.get(attempt.card.degreeLabel) ?? 0) + 1,
      )
      if (attempt.positionLabel) {
        missedPositions.set(attempt.positionLabel, (missedPositions.get(attempt.positionLabel) ?? 0) + 1)
      }
    }
  }

  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    if (!attempts[index].correct) break
    streak += 1
  }

  for (const mode of Object.keys(byMode) as ExerciseMode[]) {
    const stats = byMode[mode]
    if (!stats) continue
    stats.accuracy = percent(stats.correct, stats.correct + stats.incorrect)
  }

  const answered = attempts.length
  return {
    answered,
    correct,
    incorrect: answered - correct,
    accuracy: percent(correct, answered),
    streak,
    averageResponseMs:
      trackTime && times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : null,
    byMode,
    missedNotes: topMisses(missedNotes),
    missedDegrees: topMisses(missedDegrees),
    missedPositions: topMisses(missedPositions),
  }
}

export function missedCards(attempts: readonly { card: Flashcard; correct: boolean }[]): Flashcard[] {
  const seen = new Set<string>()
  const cards: Flashcard[] = []
  for (const attempt of attempts) {
    if (attempt.correct || seen.has(attempt.card.signature)) continue
    seen.add(attempt.card.signature)
    cards.push(attempt.card)
  }
  return cards
}

export function timingEnabled(settings: TrainerSettings): boolean {
  return settings.trackTime
}
