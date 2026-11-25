import type { RhythmPattern } from './theory/pattern.ts'
import {
  DEFAULT_SETTINGS,
  type ClickKind,
  type DisplayMode,
  type RhythmSettings,
} from './theory/spec.ts'
import { signatureError, clampBpm, type Denominator, type TimeSignature } from './theory/duration.ts'
import type { AccentState } from './theory/grid.ts'
import type { GapMode } from './theory/schedule.ts'

export const STORAGE_KEY = 'unfret.rhythm'

export type SavedPattern = {
  id: string
  name: string
  pattern: RhythmPattern
  savedAt: string
}

export type PracticeStat = {
  at: string
  kind: 'accuracy' | 'recognition'
  accuracy: number
  deviationMs: number
}

export type RhythmStore = {
  settings: RhythmSettings
  patterns: SavedPattern[]
  stats: PracticeStat[]
}

const CLICKS: ClickKind[] = ['digital', 'woodblock', 'cowbell', 'mechanical', 'beep']
const DISPLAYS: DisplayMode[] = ['grid', 'notation', 'both']
const GAPS: GapMode[] = ['off', 'bars', 'beats', 'random-beats']

export function loadStore(): RhythmStore {
  const empty = { settings: DEFAULT_SETTINGS, patterns: [], stats: [] }
  try {
    if (typeof localStorage === 'undefined') return empty
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    return normalizeStore(JSON.parse(raw) as unknown)
  } catch {
    return empty
  }
}

export function saveStore(store: RhythmStore) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore full or private storage */
  }
}

export function normalizeStore(value: unknown): RhythmStore {
  const record = isRecord(value) ? value : {}
  return {
    settings: normalizeSettings(record.settings),
    patterns: Array.isArray(record.patterns) ? record.patterns.flatMap(normalizePattern).slice(0, 40) : [],
    stats: Array.isArray(record.stats) ? record.stats.flatMap(normalizeStat).slice(-40) : [],
  }
}

export function normalizeSettings(value: unknown): RhythmSettings {
  const record = isRecord(value) ? value : {}
  const signature = normalizeSignature(record.signature)
  const parts = [1, 2, 3, 4, 5, 6, 8].includes(Number(record.parts)) ? Number(record.parts) : DEFAULT_SETTINGS.parts
  const volumes = isRecord(record.volumes) ? record.volumes : {}
  const gap = isRecord(record.gap) ? record.gap : {}
  const tempo = isRecord(record.tempo) ? record.tempo : {}
  const accentMap = Array.isArray(record.accentMap)
    ? record.accentMap.filter((item): item is AccentState => item === 'accent' || item === 'normal' || item === 'silent')
    : null
  return {
    bpm: clampBpm(Number(record.bpm)),
    signature,
    parts,
    subdivisionAudible: record.subdivisionAudible !== false,
    accentFirst: record.accentFirst !== false,
    accentMap,
    volumes: {
      master: clampNumber(volumes.master, 0, 1, DEFAULT_SETTINGS.volumes.master),
      accent: clampNumber(volumes.accent, 0, 1, DEFAULT_SETTINGS.volumes.accent),
      beat: clampNumber(volumes.beat, 0, 1, DEFAULT_SETTINGS.volumes.beat),
      subdivision: clampNumber(volumes.subdivision, 0, 1, DEFAULT_SETTINGS.volumes.subdivision),
    },
    click: CLICKS.includes(record.click as ClickKind) ? (record.click as ClickKind) : 'digital',
    countInBars: clampNumber(record.countInBars, 0, 4, DEFAULT_SETTINGS.countInBars),
    display: DISPLAYS.includes(record.display as DisplayMode) ? (record.display as DisplayMode) : 'both',
    gap: {
      mode: GAPS.includes(gap.mode as GapMode) ? (gap.mode as GapMode) : 'off',
      audibleBars: clampNumber(gap.audibleBars, 0, 16, 1),
      silentBars: clampNumber(gap.silentBars, 0, 16, 1),
      audibleBeats: clampNumber(gap.audibleBeats, 0, 32, 3),
      silentBeats: clampNumber(gap.silentBeats, 0, 32, 1),
      muteChance: clampNumber(gap.muteChance, 0, 1, 0.25),
      seed: clampNumber(gap.seed, 1, 999999, 1),
    },
    tempo: {
      enabled: tempo.enabled === true,
      targetBpm: clampNumber(tempo.targetBpm, 20, 300, 100),
      increment: clampNumber(tempo.increment, -40, 40, 5) || 5,
      barsPerStep: clampNumber(tempo.barsPerStep, 1, 64, 8),
      manual: tempo.manual === true,
      repeat: tempo.repeat === true,
      approvedStep: clampNumber(tempo.approvedStep, 0, 200, 0),
    },
    tapKey: typeof record.tapKey === 'string' && record.tapKey.trim() ? record.tapKey.slice(0, 12) : 'j',
    latencyMs: clampNumber(record.latencyMs, -200, 200, 0),
  }
}

function normalizeSignature(value: unknown): TimeSignature {
  const record = isRecord(value) ? value : {}
  const denominator = Number(record.denominator)
  const signature: TimeSignature = {
    numerator: clampNumber(record.numerator, 1, 16, 4),
    denominator: denominator === 2 || denominator === 8 || denominator === 16 ? (denominator as Denominator) : 4,
    beatGroup: clampNumber(record.beatGroup, 1, 16, 1),
  }
  if (signatureError(signature)) return DEFAULT_SETTINGS.signature
  return signature
}

function normalizePattern(value: unknown): SavedPattern[] {
  if (!isRecord(value) || !isRecord(value.pattern)) return []
  const pattern = value.pattern
  const signature = normalizeSignature(pattern.signature)
  if (!Array.isArray(pattern.notes)) return []
  return [{
    id: typeof value.id === 'string' ? value.id : `pattern-${Date.now()}`,
    name: typeof value.name === 'string' && value.name.trim() ? value.name.slice(0, 48) : 'Saved rhythm',
    savedAt: typeof value.savedAt === 'string' ? value.savedAt : new Date(0).toISOString(),
    pattern: {
      signature,
      bars: clampNumber(pattern.bars, 1, 16, 1),
      notes: pattern.notes.flatMap((note) => {
        if (!isRecord(note)) return []
        const ticks = Number(note.ticks)
        const start = Number(note.start)
        if (!Number.isInteger(ticks) || !Number.isInteger(start)) return []
        return [{
          start,
          ticks,
          rest: note.rest === true,
          accent: note.accent === true,
          tied: note.tied === true,
        }]
      }),
    },
  }]
}

function normalizeStat(value: unknown): PracticeStat[] {
  if (!isRecord(value)) return []
  const accuracy = Number(value.accuracy)
  if (!Number.isFinite(accuracy)) return []
  return [{
    at: typeof value.at === 'string' ? value.at : new Date(0).toISOString(),
    kind: value.kind === 'recognition' ? 'recognition' : 'accuracy',
    accuracy: Math.min(1, Math.max(0, accuracy)),
    deviationMs: clampNumber(value.deviationMs, 0, 5000, 0),
  }]
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number * 1000) / 1000))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
