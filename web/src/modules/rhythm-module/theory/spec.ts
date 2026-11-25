import {
  barTicks,
  beatTicks,
  clampBpm,
  gcd,
  slotTicks,
  type TimeSignature,
} from './duration.ts'
import { defaultAccentMap, type AccentState } from './grid.ts'
import { onsets, type RhythmPattern } from './pattern.ts'
import { metronomeVoices, type GapPlan, type TransportSpec, type Voice } from './schedule.ts'
import type { TempoSettings } from './tempo.ts'
import { bpmForBar } from './tempo.ts'

export type ClickKind = 'digital' | 'woodblock' | 'cowbell' | 'mechanical' | 'beep'
export type DisplayMode = 'grid' | 'notation' | 'both'
export type Assistance = 'guided' | 'intermediate' | 'independent'

export type RhythmSettings = {
  bpm: number
  signature: TimeSignature
  parts: number
  subdivisionAudible: boolean
  accentFirst: boolean
  accentMap: AccentState[] | null
  volumes: { master: number; accent: number; beat: number; subdivision: number }
  click: ClickKind
  countInBars: number
  display: DisplayMode
  gap: GapPlan
  tempo: TempoSettings
  tapKey: string
  latencyMs: number
}

export function accentMapFor(settings: Pick<RhythmSettings, 'signature' | 'parts' | 'accentFirst' | 'subdivisionAudible' | 'accentMap'>): AccentState[] {
  const fallback = defaultAccentMap(settings.signature, settings.parts, settings.accentFirst, settings.subdivisionAudible)
  if (!settings.accentMap || settings.accentMap.length !== fallback.length) return fallback
  return settings.accentMap
}

export function buildMetronomeSpec(
  read: () => RhythmSettings,
  options?: { maxBars?: number | null; assistance?: Assistance; partsAt?: (tick: number) => number },
): TransportSpec {
  const initial = read()
  const signature = initial.signature
  const countInBars = Math.max(0, Math.round(initial.countInBars))
  return {
    signature,
    countInBars,
    slotTicksAt(tick) {
      const parts = options?.partsAt?.(tick) ?? read().parts
      return slotTicks(signature, parts) ?? beatTicks(signature)
    },
    voicesAt(tick) {
      const settings = read()
      const parts = options?.partsAt?.(tick) ?? settings.parts
      const audible = options?.assistance === 'guided' ? true : options?.assistance ? false : settings.subdivisionAudible
      const map = options?.partsAt
        ? defaultAccentMap(signature, parts, settings.accentFirst, audible)
        : accentMapFor({ ...settings, parts, subdivisionAudible: audible })
      return metronomeVoices(tick, signature, parts, map, settings.gap, countInBars)
    },
    resolveBpm(tick, previous) {
      const settings = read()
      const beat = beatTicks(signature)
      if (beat <= 0 || tick % beat !== 0) return previous
      const bar = Math.floor(tick / barTicks(signature)) - countInBars
      if (settings.tempo.enabled) return bpmForBar(settings.tempo, settings.bpm, Math.max(0, bar))
      return clampBpm(settings.bpm)
    },
    doneAt(tick) {
      if (!options?.maxBars) return false
      const limit = (countInBars + options.maxBars) * barTicks(signature)
      return tick >= limit
    },
  }
}

export function buildPatternSpec(
  read: () => RhythmSettings,
  pattern: RhythmPattern,
  mode: 'metro' | 'rhythm' | 'both',
  loop: boolean,
): TransportSpec {
  const settings = read()
  const signature = pattern.signature
  const countInBars = Math.max(0, Math.round(settings.countInBars))
  const origin = countInBars * barTicks(signature)
  const length = Math.max(1, pattern.bars) * barTicks(signature)
  const grid = patternGrid(pattern, signature, settings.parts)
  return {
    signature,
    countInBars,
    slotTicksAt() {
      return grid
    },
    voicesAt(tick) {
      const current = read()
      const voices: Voice[] = []
      const inCountIn = tick < origin
      if (mode !== 'rhythm' || inCountIn) {
        voices.push(
          ...metronomeVoices(
            tick,
            signature,
            current.parts,
            accentMapFor({ ...current, signature }),
            { ...current.gap, mode: 'off' },
            countInBars,
          ),
        )
      }
      if (mode !== 'metro' && tick >= origin) {
        const local = loop ? (tick - origin) % length : tick - origin
        if (local < length) {
          const attack = pattern.notes.find((note) => note.start === local && !note.rest && !note.tied)
          if (attack) voices.push(attack.accent ? 'rhythm-accent' : 'rhythm')
        }
      }
      return voices
    },
    resolveBpm(tick, previous) {
      const current = read()
      const beat = beatTicks(signature)
      if (tick % beat !== 0) return previous
      return clampBpm(current.bpm)
    },
    doneAt(tick) {
      return !loop && tick >= origin + length
    },
  }
}

function patternGrid(pattern: RhythmPattern, signature: TimeSignature, parts: number): number {
  let grid = beatTicks(signature)
  const metro = slotTicks(signature, parts)
  if (metro) grid = gcd(grid, metro)
  for (const note of pattern.notes) {
    grid = gcd(grid, note.ticks)
    if (note.start) grid = gcd(grid, note.start)
  }
  for (const onset of onsets(pattern)) {
    if (onset) grid = gcd(grid, onset)
  }
  return Math.max(1, grid)
}

export const DEFAULT_SETTINGS: RhythmSettings = {
  bpm: 80,
  signature: { numerator: 4, denominator: 4, beatGroup: 1 },
  parts: 1,
  subdivisionAudible: true,
  accentFirst: true,
  accentMap: null,
  volumes: { master: 0.8, accent: 1, beat: 0.72, subdivision: 0.38 },
  click: 'digital',
  countInBars: 1,
  display: 'both',
  gap: { mode: 'off', audibleBars: 1, silentBars: 1, audibleBeats: 3, silentBeats: 1, muteChance: 0.25, seed: 1 },
  tempo: {
    enabled: false,
    targetBpm: 100,
    increment: 5,
    barsPerStep: 8,
    manual: false,
    repeat: false,
    approvedStep: 0,
  },
  tapKey: 'j',
  latencyMs: 0,
}
