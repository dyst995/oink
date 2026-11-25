import { barTicks, beatTicks, durationIdForTicks, ticksMakeable, type TimeSignature } from './duration.ts'
import { emptyPattern, patternError, type RhythmNote, type RhythmPattern } from './pattern.ts'

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6

export const DIFFICULTIES: { level: Difficulty; label: string; detail: string }[] = [
  { level: 1, label: 'Basic pulse', detail: 'One note value on every beat, with no rests.' },
  { level: 2, label: 'Basic subdivisions', detail: 'Eighths or sixteenths, held for the whole exercise.' },
  { level: 3, label: 'Subdivision changes', detail: 'The subdivision can change from beat to beat.' },
  { level: 4, label: 'Mixed rhythms', detail: 'Eighths and sixteenths can share a beat, with simple rests.' },
  { level: 5, label: 'Rhythmic independence', detail: 'Offbeat accents, sixteenth rests, and syncopation.' },
  { level: 6, label: 'Advanced rhythms', detail: 'Dotted notes, ties across beats, and denser syncopation.' },
]

export type GenerateOptions = {
  signature: TimeSignature
  bars: number
  difficulty: Difficulty
  rests: boolean
  dotted: boolean
  ties: boolean
  accents: boolean
  syncopation: boolean
  seed?: number
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function defaultOptions(level: Difficulty, signature: TimeSignature, bars = 1): GenerateOptions {
  return {
    signature,
    bars,
    difficulty: level,
    rests: level >= 4,
    dotted: level >= 6,
    ties: level >= 6,
    accents: level >= 5,
    syncopation: level >= 5,
  }
}

export function generatePattern(options: GenerateOptions, rng: () => number = Math.random): RhythmPattern {
  const bars = Math.max(1, Math.min(16, Math.round(options.bars)))
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const pattern = attemptPattern(options, bars, rng)
    if (!pattern || patternError(pattern)) continue
    if (!constraintsHold(pattern, options)) continue
    return pattern
  }
  return emptyPattern(options.signature, bars)
}

function attemptPattern(options: GenerateOptions, bars: number, rng: () => number): RhythmPattern | null {
  const signature = options.signature
  const size = barTicks(signature)
  const beat = beatTicks(signature)
  const pool = durationPool(options, beat)
  if (!pool.length || !ticksMakeable(size, pool)) return null
  const notes: RhythmNote[] = []
  for (let bar = 0; bar < bars; bar += 1) {
    const filled = options.difficulty <= 2 || !options.syncopation
      ? fillByBeat(size, beat, pool, options, rng)
      : fillSpan(size, pool, options.rests && options.difficulty >= 4, rng)
    if (!filled) return null
    let cursor = bar * size
    for (const item of filled) {
      notes.push({
        start: cursor,
        ticks: item.ticks,
        rest: item.rest,
        accent: false,
        tied: false,
      })
      cursor += item.ticks
    }
  }
  let pattern: RhythmPattern = { signature, bars, notes }
  pattern = applyTies(pattern, options, rng)
  pattern = applyAccents(pattern, options, rng)
  if (options.syncopation && options.difficulty >= 5) pattern = ensureSyncopation(pattern)
  return pattern
}

function durationPool(options: GenerateOptions, beat: number): number[] {
  if (options.difficulty === 1) return durationIdForTicks(beat) ? [beat] : []
  const base = options.difficulty === 2 ? [120, 60] : [240, 120, 60]
  const dotted = options.dotted ? [360, 180, 90] : []
  const pool = [...dotted, ...base].filter((ticks) => durationIdForTicks(ticks))
  if (options.difficulty <= 3) return pool.filter((ticks) => ticks === 240 || ticks === 120 || ticks === 60 || ticks === beat)
  return pool
}

function fillByBeat(
  barSize: number,
  beat: number,
  pool: number[],
  options: GenerateOptions,
  rng: () => number,
): { ticks: number; rest: boolean }[] | null {
  if (barSize % beat !== 0) return null
  const notes: { ticks: number; rest: boolean }[] = []
  let locked: number | null = null
  for (let cursor = 0; cursor < barSize; cursor += beat) {
    const usable = pool.filter((ticks) => ticks <= beat && beat % ticks === 0)
    if (!usable.length) return null
    let chosen = usable[Math.floor(rng() * usable.length)] ?? usable[0] ?? beat
    if (options.difficulty === 1) chosen = beat
    if (options.difficulty === 2) chosen = locked ?? (rng() < 0.5 && usable.includes(60) ? 60 : usable.includes(120) ? 120 : chosen)
    if (options.difficulty === 2) locked = chosen
    if (options.difficulty === 3) {
      const even = usable.filter((ticks) => beat % ticks === 0)
      chosen = even[Math.floor(rng() * even.length)] ?? chosen
    }
    if (options.difficulty >= 4 && options.difficulty < 5) {
      const mixed = usable.filter((ticks) => ticks === 120 || ticks === 60 || ticks === beat)
      chosen = mixed[Math.floor(rng() * mixed.length)] ?? chosen
    }
    const span = fillSpan(beat, [chosen, ...usable.filter((ticks) => ticks <= chosen)], options.rests && options.difficulty >= 4, options.difficulty >= 4 ? rng : () => 0)
    if (!span) return null
    if (!options.syncopation && span[0]?.rest) span[0] = { ...span[0], rest: false }
    if (options.difficulty <= 3 && span.some((item) => item.ticks !== chosen || item.rest)) {
      const plain = fillSpan(beat, [chosen], false, () => 0)
      if (!plain) return null
      notes.push(...plain)
    } else {
      notes.push(...span)
    }
  }
  return notes
}

function fillSpan(amount: number, pool: number[], rests: boolean, rng: () => number): { ticks: number; rest: boolean }[] | null {
  const coins = [...new Set(pool.filter((ticks) => ticks > 0 && durationIdForTicks(ticks)))].sort((a, b) => b - a)
  if (!ticksMakeable(amount, coins)) return null
  const notes: { ticks: number; rest: boolean }[] = []
  let left = amount
  let guard = 0
  while (left > 0 && guard < 64) {
    const fitting = coins.filter((ticks) => ticks <= left && ticksMakeable(left - ticks, coins))
    if (!fitting.length) return null
    const ticks = fitting[Math.min(fitting.length - 1, Math.floor(rng() * fitting.length))] ?? fitting[0]
    if (!ticks) return null
    const rest = rests && left !== ticks && rng() < 0.22
    notes.push({ ticks, rest })
    left -= ticks
    guard += 1
  }
  return left === 0 ? notes : null
}

function applyTies(pattern: RhythmPattern, options: GenerateOptions, rng: () => number): RhythmPattern {
  if (!options.ties || options.difficulty < 6) return pattern
  const notes = pattern.notes.map((note) => ({ ...note }))
  const candidates = notes
    .map((note, index) => ({ note, index }))
    .filter((item, index, list) => {
      const next = list[index + 1]
      return next && !item.note.rest && !next.note.rest && item.note.start + item.note.ticks === next.note.start
    })
  if (!candidates.length || rng() > 0.85) return pattern
  const pick = candidates[Math.floor(rng() * candidates.length)]
  const next = notes[pick.index + 1]
  if (next) next.tied = true
  return { ...pattern, notes }
}

function applyAccents(pattern: RhythmPattern, options: GenerateOptions, rng: () => number): RhythmPattern {
  const beat = beatTicks(pattern.signature)
  const size = barTicks(pattern.signature)
  const notes = pattern.notes.map((note) => {
    if (note.rest || note.tied) return { ...note, accent: false }
    const downbeat = note.start % size === 0
    if (!options.accents) return { ...note, accent: downbeat }
    const offbeat = note.start % beat !== 0
    const accent = downbeat || (offbeat && rng() < 0.45)
    return { ...note, accent }
  })
  return { ...pattern, notes }
}

function ensureSyncopation(pattern: RhythmPattern): RhythmPattern {
  if (isSyncopated(pattern)) return pattern
  const beat = beatTicks(pattern.signature)
  const notes = pattern.notes.map((note) => ({ ...note }))
  const target = notes.find((note) => !note.rest && note.ticks > 60 && note.start % beat === 0)
  if (!target || !durationIdForTicks(60) || !durationIdForTicks(target.ticks - 60)) return pattern
  const index = notes.indexOf(target)
  const rest = { start: target.start, ticks: 60, rest: true, accent: false, tied: false }
  const shifted = { ...target, start: target.start + 60, ticks: target.ticks - 60, accent: true }
  notes.splice(index, 1, rest, shifted)
  return { ...pattern, notes }
}

export function isSyncopated(pattern: RhythmPattern): boolean {
  const beat = beatTicks(pattern.signature)
  return pattern.notes.some((note) => {
    const into = note.start % beat
    const crosses = into + note.ticks > beat
    const restOnBeat = note.rest && into === 0
    const offbeatAccent = note.accent && into !== 0
    return crosses || restOnBeat || offbeatAccent || note.tied
  })
}

function constraintsHold(pattern: RhythmPattern, options: GenerateOptions): boolean {
  const beat = beatTicks(pattern.signature)
  if (pattern.notes.some((note) => note.rest) && !options.rests) return false
  if (pattern.notes.some((note) => note.tied) && !options.ties) return false
  if (pattern.notes.some((note) => durationIdForTicks(note.ticks)?.includes('dotted')) && !options.dotted) return false
  if (options.difficulty === 1) {
    return pattern.notes.every((note) => note.ticks === beat && !note.rest && !note.tied)
  }
  if (options.difficulty === 2) {
    const ticks = pattern.notes[0]?.ticks
    return pattern.notes.every((note) => note.ticks === ticks && !note.rest && !note.tied)
  }
  if (!options.syncopation) {
    const inside = pattern.notes.every((note) => note.start % beat + note.ticks <= beat)
    const noDownbeatRest = pattern.notes.every((note) => !(note.rest && note.start % beat === 0))
    if (!inside || !noDownbeatRest) return false
  }
  if (options.syncopation && options.difficulty >= 5 && !isSyncopated(pattern)) return false
  return true
}
