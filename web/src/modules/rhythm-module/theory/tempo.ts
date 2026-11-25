import { clampBpm } from './duration.ts'

export type TempoSettings = {
  enabled: boolean
  targetBpm: number
  increment: number
  barsPerStep: number
  manual: boolean
  repeat: boolean
  approvedStep: number
}

export function bpmForBar(tempo: TempoSettings, startBpm: number, bar: number): number {
  const start = clampBpm(startBpm)
  if (!tempo.enabled || bar < 0) return start
  const bars = Math.max(1, Math.round(tempo.barsPerStep))
  const autoStep = Math.floor(bar / bars)
  const step = tempo.repeat || tempo.manual ? Math.min(Math.max(0, tempo.approvedStep), autoStep) : autoStep
  const raw = start + step * tempo.increment
  const capped = tempo.increment >= 0 ? Math.min(raw, tempo.targetBpm) : Math.max(raw, tempo.targetBpm)
  return clampBpm(capped)
}

export function nextTempoStep(tempo: TempoSettings, startBpm: number, bar: number): number | null {
  if (!tempo.enabled || tempo.repeat) return null
  const bars = Math.max(1, Math.round(tempo.barsPerStep))
  const autoStep = Math.floor(Math.max(0, bar) / bars)
  if (!tempo.manual || autoStep <= tempo.approvedStep) return null
  return bpmForBar({ ...tempo, manual: false, approvedStep: autoStep }, startBpm, bar)
}
