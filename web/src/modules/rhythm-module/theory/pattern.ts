import { barTicks, beatTicks, durationIdForTicks, spellTicks, type TimeSignature } from './duration.ts'

export type RhythmNote = {
  start: number
  ticks: number
  rest: boolean
  accent: boolean
  tied: boolean
}

export type RhythmPattern = {
  signature: TimeSignature
  bars: number
  notes: RhythmNote[]
}

const PULSE_POOL = [960, 720, 480, 360, 240, 180, 120, 90, 60]

export function emptyPattern(signature: TimeSignature, bars = 1): RhythmPattern {
  const safeBars = Math.max(1, Math.min(16, Math.round(bars)))
  const notes: RhythmNote[] = []
  const size = barTicks(signature)
  const spelled = spellTicks(size, [pulseTicks(signature), ...PULSE_POOL]) ?? spellTicks(size, [60]) ?? []
  for (let bar = 0; bar < safeBars; bar += 1) {
    let cursor = bar * size
    for (const ticks of spelled) {
      notes.push({ start: cursor, ticks, rest: false, accent: cursor % size === 0, tied: false })
      cursor += ticks
    }
  }
  return { signature, bars: safeBars, notes }
}

export function pulseTicks(signature: TimeSignature): number {
  const beat = beatTicks(signature)
  if (durationIdForTicks(beat)) return beat
  const spelled = spellTicks(beat, [240, 120, 60])
  return spelled?.[0] ?? beat
}

export function patternError(pattern: RhythmPattern): string | null {
  if (pattern.bars < 1) return 'Add at least one bar.'
  const size = barTicks(pattern.signature)
  const notes = [...pattern.notes].sort((a, b) => a.start - b.start)
  if (notes.length !== pattern.notes.length) return 'The rhythm has a gap.'
  for (let bar = 0; bar < pattern.bars; bar += 1) {
    const origin = bar * size
    const end = origin + size
    const slice = notes.filter((note) => note.start >= origin && note.start < end)
    if (!slice.length) return `Bar ${bar + 1} is empty.`
    if (slice[0]?.start !== origin) return `Bar ${bar + 1} does not start on the downbeat.`
    let cursor = origin
    for (const note of slice) {
      if (note.start !== cursor) return `Bar ${bar + 1} has a gap or an overlap.`
      if (note.ticks <= 0) return 'A note needs a duration.'
      if (!durationIdForTicks(note.ticks)) return 'A note uses a duration this editor cannot spell.'
      if (note.tied && note.rest) return 'A rest cannot be tied.'
      cursor += note.ticks
    }
    if (cursor !== end) return `Bar ${bar + 1} does not fill ${pattern.signature.numerator}/${pattern.signature.denominator}.`
  }
  const outside = notes.some((note) => note.start < 0 || note.start >= pattern.bars * size)
  if (outside) return 'A note sits outside the pattern.'
  return null
}

export function onsets(pattern: RhythmPattern): number[] {
  return pattern.notes.filter((note) => !note.rest && !note.tied).map((note) => note.start)
}

export function barNotes(pattern: RhythmPattern, bar: number): RhythmNote[] {
  const size = barTicks(pattern.signature)
  const origin = bar * size
  return pattern.notes
    .filter((note) => note.start >= origin && note.start < origin + size)
    .sort((a, b) => a.start - b.start)
}

export function withBarNotes(pattern: RhythmPattern, bar: number, notes: Omit<RhythmNote, 'start'>[]): RhythmPattern {
  const size = barTicks(pattern.signature)
  const origin = bar * size
  const timed: RhythmNote[] = []
  let cursor = origin
  for (const note of notes) {
    timed.push({ ...note, start: cursor })
    cursor += note.ticks
  }
  const others = pattern.notes.filter((note) => note.start < origin || note.start >= origin + size)
  return {
    ...pattern,
    notes: [...others, ...timed].sort((a, b) => a.start - b.start),
  }
}

export function noteIndexAt(pattern: RhythmPattern, start: number): number {
  return pattern.notes.findIndex((note) => note.start === start)
}

export function setNoteTicks(pattern: RhythmPattern, index: number, ticks: number): RhythmPattern | null {
  const note = pattern.notes[index]
  if (!note || !durationIdForTicks(ticks)) return null
  const size = barTicks(pattern.signature)
  const bar = Math.floor(note.start / size)
  const slice = barNotes(pattern, bar).map((item) => ({ ...item }))
  const local = slice.findIndex((item) => item.start === note.start)
  if (local < 0) return null
  const current = slice[local]
  if (!current) return null
  if (ticks === current.ticks) return pattern
  if (ticks > current.ticks) {
    let need = ticks - current.ticks
    let next = local + 1
    while (need > 0 && next < slice.length) {
      const following = slice[next]
      if (!following) break
      if (following.ticks <= need) {
        need -= following.ticks
        next += 1
      } else {
        const leftover = following.ticks - need
        if (!durationIdForTicks(leftover)) return null
        return withBarNotes(pattern, bar, [
          ...slice.slice(0, local).map(bare),
          { ticks, rest: current.rest, accent: current.accent, tied: current.tied },
          { ticks: leftover, rest: following.rest, accent: false, tied: false },
          ...slice.slice(next + 1).map(bare),
        ])
      }
    }
    if (need !== 0) return null
    return withBarNotes(pattern, bar, [
      ...slice.slice(0, local).map(bare),
      { ticks, rest: current.rest, accent: current.accent, tied: current.tied },
      ...slice.slice(next).map(bare),
    ])
  }
  const extra = current.ticks - ticks
  if (!durationIdForTicks(extra)) return null
  const replacement: Omit<RhythmNote, 'start'>[] = [
    ...slice.slice(0, local).map(bare),
    { ticks, rest: current.rest, accent: current.accent, tied: current.tied },
    { ticks: extra, rest: false, accent: false, tied: false },
    ...slice.slice(local + 1).map(bare),
  ]
  return withBarNotes(pattern, bar, replacement)
}

function bare(note: RhythmNote): Omit<RhythmNote, 'start'> {
  return { ticks: note.ticks, rest: note.rest, accent: note.accent, tied: note.tied }
}

export function updateNote(
  pattern: RhythmPattern,
  index: number,
  patch: Partial<Pick<RhythmNote, 'rest' | 'accent' | 'tied'>>,
): RhythmPattern | null {
  const note = pattern.notes[index]
  if (!note) return null
  if (patch.rest && (note.tied || patch.tied)) return null
  const notes = pattern.notes.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
  const next = { ...pattern, notes }
  return patternError(next) ? null : next
}

export function toggleTie(pattern: RhythmPattern, index: number): RhythmPattern | null {
  const nextNote = pattern.notes[index + 1]
  if (!nextNote || nextNote.rest || pattern.notes[index]?.rest) return null
  return updateNote(pattern, index + 1, { tied: !nextNote.tied })
}

export function splitNote(pattern: RhythmPattern, index: number): RhythmPattern | null {
  const note = pattern.notes[index]
  if (!note || note.ticks % 2 !== 0) return null
  const half = note.ticks / 2
  if (!durationIdForTicks(half)) return null
  return setNoteTicks(pattern, index, half)
}

export function addBar(pattern: RhythmPattern): RhythmPattern {
  const next = emptyPattern(pattern.signature, 1)
  return {
    ...pattern,
    bars: pattern.bars + 1,
    notes: [...pattern.notes, ...next.notes.map((note) => ({ ...note, start: note.start + pattern.bars * barTicks(pattern.signature) }))],
  }
}

export function duplicateBar(pattern: RhythmPattern, bar: number): RhythmPattern {
  const size = barTicks(pattern.signature)
  const copy = barNotes(pattern, bar).map((note) => ({
    ticks: note.ticks,
    rest: note.rest,
    accent: note.accent,
    tied: note.tied,
    start: note.start + size,
  }))
  const shifted = pattern.notes.map((note) =>
    note.start >= (bar + 1) * size ? { ...note, start: note.start + size } : note,
  )
  return { ...pattern, bars: pattern.bars + 1, notes: [...shifted, ...copy].sort((a, b) => a.start - b.start) }
}

export function clearPattern(pattern: RhythmPattern): RhythmPattern {
  return emptyPattern(pattern.signature, 1)
}

export function patternWords(pattern: RhythmPattern): string {
  return pattern.notes
    .map((note) => {
      const name = durationIdForTicks(note.ticks) ?? `${note.ticks} ticks`
      const tie = note.tied ? 'tied ' : ''
      const accent = note.accent ? ' accented' : ''
      return `${tie}${note.rest ? 'rest' : 'note'} ${name}${accent}`
    })
    .join(', ')
}
