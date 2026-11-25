import { FRET_COUNT, KEY_OPTIONS } from '../theory.ts'
import { DEFAULT_SETTINGS, TRAINER_SCALES, emptyMemory } from './engine.ts'
import { EXERCISE_MODES } from './types.ts'
import type { MissMemory, TrainerSettings } from './types.ts'

const STORAGE_KEY = 'unfret.fretboard-trainer'

export type StoredTrainer = {
  settings: TrainerSettings
  memory: MissMemory
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function numberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {}
  const next: Record<string, number> = {}
  for (const [key, count] of Object.entries(value)) {
    if (typeof count !== 'number' || !Number.isFinite(count) || count <= 0) continue
    next[key] = Math.min(24, Math.round(count))
  }
  return next
}

function normalizeMemory(value: unknown): MissMemory {
  if (!isRecord(value)) return emptyMemory()
  return {
    notes: numberRecord(value.notes),
    degrees: numberRecord(value.degrees),
    positions: numberRecord(value.positions),
    modes: numberRecord(value.modes),
  }
}

export function normalizeSettings(value: unknown): TrainerSettings {
  const raw = isRecord(value) ? value : {}
  const tonic = typeof raw.tonic === 'string' && KEY_OPTIONS.includes(raw.tonic as (typeof KEY_OPTIONS)[number])
    ? raw.tonic
    : DEFAULT_SETTINGS.tonic
  const scaleId =
    typeof raw.scaleId === 'string' && TRAINER_SCALES.some((preset) => preset.id === raw.scaleId)
      ? raw.scaleId
      : DEFAULT_SETTINGS.scaleId
  const modeSource = Array.isArray(raw.modes) ? raw.modes : null
  const modes = modeSource
    ? EXERCISE_MODES.filter((mode) => modeSource.includes(mode))
    : [...DEFAULT_SETTINGS.modes]
  const variationSource = Array.isArray(raw.variations) ? raw.variations : null
  const variations = variationSource
    ? (['string', 'any'] as const).filter((variation) => variationSource.includes(variation))
    : [...DEFAULT_SETTINGS.variations]
  const range = raw.range === 'custom' ? 'custom' : 'entire'
  const fretMin = clampInt(raw.fretMin, 0, FRET_COUNT, DEFAULT_SETTINGS.fretMin)
  const fretMax = clampInt(raw.fretMax, 0, FRET_COUNT, DEFAULT_SETTINGS.fretMax)
  const stringNumbers = normalizeStrings(raw.stringNumbers)
  const shapeId =
    typeof raw.shapeId === 'number' && raw.shapeId >= 1 && raw.shapeId <= 5 ? Math.round(raw.shapeId) : null
  const questionCount =
    raw.questionCount === null
      ? null
      : clampInt(raw.questionCount, 1, 200, DEFAULT_SETTINGS.questionCount ?? 20)
  const trackTime = raw.trackTime === true
  const timeLimitSec =
    raw.timeLimitSec === null || raw.timeLimitSec === undefined
      ? null
      : clampInt(raw.timeLimitSec, 3, 120, 15)

  return {
    tonic,
    scaleId,
    modes: modes.length > 0 ? modes : [...DEFAULT_SETTINGS.modes],
    variations: variations.length > 0 ? [...variations] : [...DEFAULT_SETTINGS.variations],
    range,
    fretMin: Math.min(fretMin, fretMax),
    fretMax: Math.max(fretMin, fretMax),
    stringNumbers,
    shapeId,
    questionCount,
    trackTime,
    timeLimitSec,
    autoAdvance: raw.autoAdvance === true,
    prioritizeMisses: raw.prioritizeMisses === true,
    hideBoardUntilReveal: raw.hideBoardUntilReveal === true,
  }
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function normalizeStrings(value: unknown): number[] | null {
  if (value === null || value === undefined) return null
  if (!Array.isArray(value)) return null
  const numbers = [...new Set(value.filter((item) => typeof item === 'number' && item >= 1 && item <= 6))]
  if (numbers.length === 0 || numbers.length === 6) return null
  return numbers.sort((a, b) => a - b)
}

export function loadTrainerState(): StoredTrainer {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { settings: cloneSettings(DEFAULT_SETTINGS), memory: emptyMemory() }
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return { settings: cloneSettings(DEFAULT_SETTINGS), memory: emptyMemory() }
    return {
      settings: normalizeSettings(parsed.settings),
      memory: normalizeMemory(parsed.memory),
    }
  } catch {
    return { settings: cloneSettings(DEFAULT_SETTINGS), memory: emptyMemory() }
  }
}

function cloneSettings(settings: TrainerSettings): TrainerSettings {
  return {
    ...settings,
    modes: [...settings.modes],
    variations: [...settings.variations],
    stringNumbers: settings.stringNumbers ? [...settings.stringNumbers] : null,
  }
}

export function saveTrainerState(settings: TrainerSettings, memory: MissMemory): void {
  try {
    const payload: StoredTrainer = { settings, memory }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Storage can be unavailable in private mode. Practice still works for the session.
  }
}

