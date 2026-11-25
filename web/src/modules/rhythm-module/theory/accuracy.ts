export type TapKind = 'on-time' | 'early' | 'late' | 'miss'

export type MatchedTap = {
  expectedMs: number
  actualMs: number | null
  deltaMs: number | null
  kind: TapKind
}

export type AccuracyReport = {
  matches: MatchedTap[]
  extraMs: number[]
  onTime: number
  early: number
  late: number
  missed: number
  extras: number
  accuracy: number
  meanAbsMs: number
  meanSignedMs: number
  consistencyMs: number
}

export function toleranceMs(bpm: number, subdivisionTicks: number, ticksPerBeat: number, difficulty = 1): number {
  const subdivisionMs = (subdivisionTicks * (60 / bpm) / ticksPerBeat) * 1000
  const window = Math.min(90, Math.max(28, subdivisionMs * 0.32))
  const factor = difficulty >= 5 ? 0.82 : difficulty <= 2 ? 1.2 : 1
  return window * factor
}

/**
 * Match each expected onset to at most one tap. The closest in-window pair wins,
 * so one tap cannot cover two notes.
 */
export function evaluateTaps(expectedMs: number[], tapsMs: number[], tolerance: number): AccuracyReport {
  const expected = expectedMs.map((time, index) => ({ time, index })).sort((a, b) => a.time - b.time)
  const taps = tapsMs.map((time, index) => ({ time, index })).sort((a, b) => a.time - b.time)
  const pairs: { expected: number; tap: number; delta: number }[] = []
  for (const note of expected) {
    for (const tap of taps) {
      const delta = tap.time - note.time
      if (Math.abs(delta) <= tolerance) pairs.push({ expected: note.index, tap: tap.index, delta })
    }
  }
  pairs.sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta) || a.expected - b.expected)
  const usedExpected = new Set<number>()
  const usedTaps = new Set<number>()
  const chosen = new Map<number, { actualMs: number; deltaMs: number }>()
  for (const pair of pairs) {
    if (usedExpected.has(pair.expected) || usedTaps.has(pair.tap)) continue
    usedExpected.add(pair.expected)
    usedTaps.add(pair.tap)
    chosen.set(pair.expected, { actualMs: tapsMs[pair.tap] ?? 0, deltaMs: pair.delta })
  }
  const tight = tolerance * 0.35
  const matches: MatchedTap[] = expectedMs.map((time, index) => {
    const hit = chosen.get(index)
    if (!hit) return { expectedMs: time, actualMs: null, deltaMs: null, kind: 'miss' }
    const kind = Math.abs(hit.deltaMs) <= tight ? 'on-time' : hit.deltaMs < 0 ? 'early' : 'late'
    return { expectedMs: time, actualMs: hit.actualMs, deltaMs: hit.deltaMs, kind }
  })
  const extraMs = tapsMs.filter((_, index) => !usedTaps.has(index))
  const deltas = matches.flatMap((match) => (match.deltaMs === null ? [] : [match.deltaMs]))
  const onTime = matches.filter((match) => match.kind === 'on-time').length
  const early = matches.filter((match) => match.kind === 'early').length
  const late = matches.filter((match) => match.kind === 'late').length
  const missed = matches.filter((match) => match.kind === 'miss').length
  const accepted = onTime + early + late
  return {
    matches,
    extraMs,
    onTime,
    early,
    late,
    missed,
    extras: extraMs.length,
    accuracy: expectedMs.length ? accepted / expectedMs.length : 0,
    meanAbsMs: deltas.length ? deltas.reduce((sum, delta) => sum + Math.abs(delta), 0) / deltas.length : 0,
    meanSignedMs: deltas.length ? deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length : 0,
    consistencyMs: deviation(deltas),
  }
}

function deviation(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function estimateLatency(pairs: { clickMs: number; tapMs: number }[]): number | null {
  if (pairs.length < 3) return null
  const deltas = pairs.map((pair) => pair.tapMs - pair.clickMs).sort((a, b) => a - b)
  const mid = Math.floor(deltas.length / 2)
  const median = deltas.length % 2 === 0 ? ((deltas[mid - 1] ?? 0) + (deltas[mid] ?? 0)) / 2 : (deltas[mid] ?? 0)
  if (Math.abs(median) > 250) return null
  return Math.round(median)
}

export function onsetMs(ticks: number[], bpm: number, ticksPerBeat: number): number[] {
  const seconds = 60 / bpm / ticksPerBeat
  return ticks.map((tick) => tick * seconds * 1000)
}
