import { beatTicks, beatsPerBar, clampBpm, type TimeSignature } from './duration.ts'
import type { AccentState } from './grid.ts'

export type Voice = 'accent' | 'beat' | 'subdivision' | 'rhythm' | 'rhythm-accent'

export type Segment = {
  tick: number
  time: number
  bpm: number
}

export type Clock = {
  tick: number
  bpm: number
  segments: Segment[]
}

export type ClickEvent = {
  tick: number
  time: number
  voices: Voice[]
  bpm: number
}

export type TransportSpec = {
  signature: TimeSignature
  countInBars: number
  slotTicksAt: (tick: number) => number
  voicesAt: (tick: number) => Voice[]
  /** Called on beat boundaries. Return the BPM that should start at this tick. */
  resolveBpm: (tick: number, previous: number) => number
  doneAt: (tick: number) => boolean
}

export type GapMode = 'off' | 'bars' | 'beats' | 'random-beats'

export type GapPlan = {
  mode: GapMode
  audibleBars: number
  silentBars: number
  audibleBeats: number
  silentBeats: number
  /** Fraction of beats to mute when mode is random-beats. */
  muteChance: number
  seed: number
}

export function startClock(bpm: number, audioTime: number): Clock {
  const safe = clampBpm(bpm)
  return { tick: 0, bpm: safe, segments: [{ tick: 0, time: audioTime, bpm: safe }] }
}

export function timeAtTick(segments: Segment[], tick: number, ticksInBeat: number): number {
  let segment = segments[0]
  if (!segment) return 0
  for (const item of segments) {
    if (item.tick <= tick) segment = item
    else break
  }
  const seconds = 60 / segment.bpm / ticksInBeat
  return segment.time + (tick - segment.tick) * seconds
}

export function tickAtTime(segments: Segment[], audioTime: number, ticksInBeat: number): number {
  let segment = segments[0]
  if (!segment) return 0
  for (const item of segments) {
    if (item.time <= audioTime) segment = item
    else break
  }
  const seconds = 60 / segment.bpm / ticksInBeat
  if (seconds <= 0) return segment.tick
  return segment.tick + (audioTime - segment.time) / seconds
}

export function stepClock(clock: Clock, spec: TransportSpec): { clock: Clock; event: ClickEvent } | null {
  if (spec.doneAt(clock.tick)) return null
  const ticksInBeat = beatTicks(spec.signature)
  const slot = spec.slotTicksAt(clock.tick)
  if (!Number.isInteger(slot) || slot <= 0) {
    throw new Error('Subdivision does not divide the beat.')
  }
  let bpm = clock.bpm
  let segments = clock.segments
  if (ticksInBeat > 0 && clock.tick % ticksInBeat === 0) {
    const resolved = clampBpm(spec.resolveBpm(clock.tick, bpm))
    if (resolved !== bpm) {
      const time = timeAtTick(segments, clock.tick, ticksInBeat)
      segments = [...segments, { tick: clock.tick, time, bpm: resolved }]
      bpm = resolved
    }
  }
  const time = timeAtTick(segments, clock.tick, ticksInBeat)
  const event: ClickEvent = {
    tick: clock.tick,
    time,
    voices: spec.voicesAt(clock.tick),
    bpm,
  }
  return {
    clock: { tick: clock.tick + slot, bpm, segments },
    event,
  }
}

export function projectClock(spec: TransportSpec, untilTick: number, startTime = 0, bpm = 80): ClickEvent[] {
  let clock = startClock(bpm, startTime)
  const events: ClickEvent[] = []
  let guard = 0
  while (clock.tick < untilTick && guard < 100000) {
    const stepped = stepClock(clock, spec)
    if (!stepped) break
    events.push(stepped.event)
    clock = stepped.clock
    guard += 1
  }
  return events
}

export function gapSilent(plan: GapPlan, bar: number, beat: number, beats: number): boolean {
  if (plan.mode === 'off' || bar < 0) return false
  if (plan.mode === 'bars') {
    const audible = Math.max(0, plan.audibleBars)
    const silent = Math.max(0, plan.silentBars)
    const cycle = audible + silent
    if (cycle <= 0 || silent === 0) return false
    return bar % cycle >= audible
  }
  if (plan.mode === 'beats') {
    const audible = Math.max(0, plan.audibleBeats)
    const silent = Math.max(0, plan.silentBeats)
    const cycle = audible + silent
    if (cycle <= 0 || silent === 0) return false
    const index = bar * beats + beat
    return index % cycle >= audible
  }
  const chance = Math.min(1, Math.max(0, plan.muteChance))
  return unitHash(plan.seed, bar, beat) < chance
}

export function unitHash(seed: number, bar: number, beat: number): number {
  let x = (seed | 0) ^ Math.imul(bar + 1, 0x9e3779b1) ^ Math.imul(beat + 1, 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d)
  x ^= x >>> 15
  return (x >>> 0) / 4294967296
}

export function metronomeVoices(
  tick: number,
  signature: TimeSignature,
  parts: number,
  accentMap: AccentState[],
  gap: GapPlan,
  countInBars: number,
): Voice[] {
  const barSize = signature.numerator * (beatTicks(signature) / signature.beatGroup)
  const beatSize = beatTicks(signature)
  const slot = beatSize / parts
  if (!Number.isInteger(slot) || tick % slot !== 0) return []
  const bar = Math.floor(tick / barSize)
  const inBar = tick % barSize
  const beat = Math.floor(inBar / beatSize)
  const slotInBeat = (inBar % beatSize) / slot
  const slotIndex = beat * parts + slotInBeat
  const playBar = bar - countInBars
  if (playBar >= 0 && gapSilent(gap, playBar, beat, beatsPerBar(signature))) return []
  const state = accentMap[slotIndex] ?? 'normal'
  if (state === 'silent') return []
  if (state === 'accent') return ['accent']
  if (slotInBeat === 0) return ['beat']
  return ['subdivision']
}

export function placeInBar(tick: number, signature: TimeSignature, parts: number): {
  bar: number
  beat: number
  slotInBeat: number
  slotInBar: number
} {
  const beatSize = beatTicks(signature)
  const barSize = beatSize * beatsPerBar(signature)
  const slot = beatSize / parts
  const bar = Math.floor(tick / barSize)
  const inBar = tick % barSize
  const beat = Math.floor(inBar / beatSize)
  const slotInBeat = slot > 0 ? Math.floor((inBar % beatSize) / slot) : 0
  return { bar, beat, slotInBeat, slotInBar: beat * parts + slotInBeat }
}
