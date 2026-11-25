/** Integer ticks. A quarter note is 240 so every standard subdivision lands on a whole tick. */
export const TICKS_PER_QUARTER = 240

export type Denominator = 2 | 4 | 8 | 16

export type TimeSignature = {
  numerator: number
  denominator: Denominator
  /** How many denominator-notes make one metronome beat. 3 groups eighths into dotted-quarter beats. */
  beatGroup: number
}

export type DurationId =
  | 'whole'
  | 'half'
  | 'dotted-half'
  | 'quarter'
  | 'dotted-quarter'
  | 'eighth'
  | 'dotted-eighth'
  | 'sixteenth'
  | 'dotted-sixteenth'

export const DURATIONS: { id: DurationId; ticks: number; label: string; dotted: boolean }[] = [
  { id: 'whole', ticks: 960, label: 'Whole', dotted: false },
  { id: 'dotted-half', ticks: 720, label: 'Dotted half', dotted: true },
  { id: 'half', ticks: 480, label: 'Half', dotted: false },
  { id: 'dotted-quarter', ticks: 360, label: 'Dotted quarter', dotted: true },
  { id: 'quarter', ticks: 240, label: 'Quarter', dotted: false },
  { id: 'dotted-eighth', ticks: 180, label: 'Dotted eighth', dotted: true },
  { id: 'eighth', ticks: 120, label: 'Eighth', dotted: false },
  { id: 'dotted-sixteenth', ticks: 90, label: 'Dotted sixteenth', dotted: true },
  { id: 'sixteenth', ticks: 60, label: 'Sixteenth', dotted: false },
]

const DURATION_NAMES: Record<number, string> = {
  960: 'whole note',
  720: 'dotted half note',
  480: 'half note',
  360: 'dotted quarter note',
  240: 'quarter note',
  180: 'dotted eighth note',
  120: 'eighth note',
  90: 'dotted sixteenth note',
  80: 'eighth-note triplet',
  60: 'sixteenth note',
  48: 'quintuplet',
  40: 'sextuplet',
  30: 'thirty-second note',
}

export const METER_PRESETS: { id: string; label: string; signature: TimeSignature }[] = [
  { id: '2/4', label: '2/4', signature: { numerator: 2, denominator: 4, beatGroup: 1 } },
  { id: '3/4', label: '3/4', signature: { numerator: 3, denominator: 4, beatGroup: 1 } },
  { id: '4/4', label: '4/4', signature: { numerator: 4, denominator: 4, beatGroup: 1 } },
  { id: '5/4', label: '5/4', signature: { numerator: 5, denominator: 4, beatGroup: 1 } },
  { id: '6/4', label: '6/4', signature: { numerator: 6, denominator: 4, beatGroup: 1 } },
  { id: '7/4', label: '7/4', signature: { numerator: 7, denominator: 4, beatGroup: 1 } },
  { id: '3/8', label: '3/8', signature: { numerator: 3, denominator: 8, beatGroup: 1 } },
  { id: '6/8', label: '6/8', signature: { numerator: 6, denominator: 8, beatGroup: 3 } },
  { id: '9/8', label: '9/8', signature: { numerator: 9, denominator: 8, beatGroup: 3 } },
  { id: '12/8', label: '12/8', signature: { numerator: 12, denominator: 8, beatGroup: 3 } },
]

export const SUBDIVISION_PARTS = [1, 2, 3, 4, 5, 6, 8] as const
export type SubdivisionParts = (typeof SUBDIVISION_PARTS)[number]

export function clampBpm(value: number): number {
  if (!Number.isFinite(value)) return 80
  return Math.min(300, Math.max(20, Math.round(value)))
}

export function ticksPerDenominator(denominator: Denominator): number {
  return (TICKS_PER_QUARTER * 4) / denominator
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const next = y
    y = x % y
    x = next
  }
  return x || 1
}

export function barTicks(signature: TimeSignature): number {
  return signature.numerator * ticksPerDenominator(signature.denominator)
}

export function beatTicks(signature: TimeSignature): number {
  return signature.beatGroup * ticksPerDenominator(signature.denominator)
}

export function beatsPerBar(signature: TimeSignature): number {
  const beat = beatTicks(signature)
  const bar = barTicks(signature)
  if (beat <= 0 || bar % beat !== 0) return 0
  return bar / beat
}

export function signatureError(signature: TimeSignature): string | null {
  if (!Number.isInteger(signature.numerator) || signature.numerator < 1 || signature.numerator > 16) {
    return 'Use 1 to 16 counts in a bar.'
  }
  if (signature.denominator !== 2 && signature.denominator !== 4 && signature.denominator !== 8 && signature.denominator !== 16) {
    return 'The beat division must be 2, 4, 8, or 16.'
  }
  if (!Number.isInteger(signature.beatGroup) || signature.beatGroup < 1) {
    return 'Beat grouping has to be a positive whole number.'
  }
  if (signature.numerator % signature.beatGroup !== 0) {
    return 'That grouping does not divide the bar evenly.'
  }
  return null
}

export function beatGroups(signature: TimeSignature): number[] {
  const groups: number[] = []
  for (let group = 1; group <= signature.numerator; group += 1) {
    if (signature.numerator % group === 0) groups.push(group)
  }
  return groups
}

export function durationName(ticks: number): string | null {
  return DURATION_NAMES[ticks] ?? null
}

export function durationIdForTicks(ticks: number): DurationId | null {
  return DURATIONS.find((item) => item.ticks === ticks)?.id ?? null
}

export function isDottedTicks(ticks: number): boolean {
  return DURATIONS.some((item) => item.dotted && item.ticks === ticks)
}

export function beatUnitLabel(signature: TimeSignature): string {
  return durationName(beatTicks(signature)) ?? `${signature.beatGroup} written beats`
}

export function meterLabel(signature: TimeSignature): string {
  return `${signature.numerator}/${signature.denominator}`
}

export function subdivisionName(parts: number, beatSize: number): string {
  if (parts <= 0 || beatSize % parts !== 0) return `${parts} per beat`
  const ticks = beatSize / parts
  if (parts === 1) return durationName(ticks) ?? 'Beat'
  if (parts === 3 && ticks === 80) return 'Eighth-note triplet'
  if (parts === 5) return 'Quintuplet'
  if (parts === 6) return 'Sextuplet'
  if (parts === 8 && ticks === 30) return 'Thirty-second note'
  return durationName(ticks) ?? `${parts} per beat`
}

export function slotTicks(signature: TimeSignature, parts: number): number | null {
  const beat = beatTicks(signature)
  if (parts < 1 || beat % parts !== 0) return null
  return beat / parts
}

export function secondsPerTick(bpm: number, ticksInBeat: number): number {
  return 60 / clampBpm(bpm) / ticksInBeat
}

/** True when `amount` can be summed from `pool` (each value may be reused). */
export function ticksMakeable(amount: number, pool: number[], memo = new Map<number, boolean>()): boolean {
  if (amount === 0) return true
  if (amount < 0) return false
  const cached = memo.get(amount)
  if (cached !== undefined) return cached
  for (const coin of pool) {
    if (coin > 0 && coin <= amount && ticksMakeable(amount - coin, pool, memo)) {
      memo.set(amount, true)
      return true
    }
  }
  memo.set(amount, false)
  return false
}

export function spellTicks(amount: number, pool: number[]): number[] | null {
  if (!ticksMakeable(amount, pool)) return null
  const coins = [...pool].filter((ticks) => ticks > 0).sort((a, b) => b - a)
  const notes: number[] = []
  let left = amount
  while (left > 0) {
    const coin = coins.find((ticks) => ticks <= left && ticksMakeable(left - ticks, coins))
    if (!coin) return null
    notes.push(coin)
    left -= coin
  }
  return notes
}
