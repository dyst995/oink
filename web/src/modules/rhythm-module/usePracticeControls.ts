import { useEffect, useRef } from 'react'
import { getMetronomeEngine } from './audio/engine.ts'
import { usePlaying, useRhythm } from './MetronomeContext.tsx'
import { buildMetronomeSpec, type RhythmSettings } from './theory/spec.ts'
import { clampBpm } from './theory/duration.ts'
import type { TransportSpec } from './theory/schedule.ts'

export function usePracticeControls() {
  const rhythm = useRhythm()
  const playing = usePlaying()
  const taps = useRef<number[]>([])

  useEffect(() => {
    getMetronomeEngine().setMix(mixOf(rhythm.settings))
  }, [rhythm.settings])

  function tapTempo() {
    const now = performance.now()
    const recent = taps.current.filter((time) => now - time < 2200)
    recent.push(now)
    taps.current = recent.slice(-6)
    if (recent.length < 2) return
    const gaps = recent.slice(1).map((time, index) => time - (recent[index] ?? time))
    const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
    if (average <= 0) return
    rhythm.update({ bpm: clampBpm(60000 / average) })
  }

  function changeBpm(delta: number) {
    rhythm.update({ bpm: clampBpm(rhythm.read().bpm + delta) })
  }

  function start(spec: TransportSpec, onEnded?: () => void) {
    const current = rhythm.read()
    const engine = getMetronomeEngine()
    engine.setMix({ ...current.volumes, click: current.click })
    return engine.start(spec, current.bpm, onEnded)
  }

  function stop() {
    getMetronomeEngine().stop()
  }

  function restart(spec: TransportSpec, onEnded?: () => void) {
    stop()
    return start(spec, onEnded)
  }

  return { ...rhythm, playing, tapTempo, changeBpm, start, stop, restart }
}

export function mixOf(settings: RhythmSettings) {
  return { ...settings.volumes, click: settings.click }
}

export function metronomeFrom(read: () => RhythmSettings, maxBars?: number | null) {
  return buildMetronomeSpec(read, { maxBars })
}
