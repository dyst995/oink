import { barTicks, beatTicks, beatsPerBar, subdivisionName, type TimeSignature } from './duration.ts'
import { intervalBeats, type SubdivisionInterval } from './grid.ts'
import { mulberry32 } from './generate.ts'

export type SubdivisionClock = {
  partsAtTick: (tick: number) => number
  upcoming: (tick: number) => { parts: number; ticksLeft: number } | null
  releaseAfter: (tick: number) => void
  setManualIndex: (index: number) => void
  reset: () => void
}

export function createSubdivisionClock(input: {
  signature: TimeSignature
  sequence: number[]
  random: boolean
  choices: number[]
  interval: SubdivisionInterval
  countInBars: number
  manual: boolean
  seed: number
}): SubdivisionClock {
  const beat = beatTicks(input.signature)
  const beats = beatsPerBar(input.signature)
  const stepBeats = intervalBeats(input.interval, beats)
  const sequence = input.sequence.length ? input.sequence : input.choices
  const latched = new Map<number, number>()
  const steps = new Map<number, number>()
  let manualIndex = 0

  function partsForStep(step: number): number {
    if (!input.random) return sequence[step % sequence.length] ?? sequence[0] ?? 1
    const cached = steps.get(step)
    if (cached) return cached
    const choices = input.choices.length ? input.choices : sequence
    let previous: number | undefined
    for (let index = 0; index <= step; index += 1) {
      const stored = steps.get(index)
      if (stored) {
        previous = stored
        continue
      }
      const rng = mulberry32((input.seed + index * 9973) >>> 0)
      let pick = choices[Math.floor(rng() * choices.length)] ?? 1
      if (previous !== undefined && pick === previous && choices.length > 1) {
        const choiceIndex = choices.indexOf(pick)
        pick = choices[(choiceIndex + 1) % choices.length] ?? pick
      }
      steps.set(index, pick)
      previous = pick
    }
    return steps.get(step) ?? 1
  }

  function beatIndex(tick: number): number {
    return Math.floor(Math.max(0, tick) / beat)
  }

  function partsForBeat(beatNumber: number): number {
    const cached = latched.get(beatNumber)
    if (cached) return cached
    const countInBeats = input.countInBars * beats
    const playBeat = Math.max(0, beatNumber - countInBeats)
    const step = input.manual ? manualIndex : Math.floor(playBeat / stepBeats)
    const parts = input.manual ? (sequence[step % sequence.length] ?? 1) : partsForStep(step)
    const safe = beat % parts === 0 ? parts : 1
    latched.set(beatNumber, safe)
    return safe
  }

  return {
    partsAtTick(tick: number) {
      return partsForBeat(beatIndex(tick))
    },
    upcoming(tick: number) {
      const beatNumber = beatIndex(tick)
      const countInBeats = input.countInBars * beats
      const playBeat = Math.max(0, beatNumber - countInBeats)
      const step = input.manual ? manualIndex : Math.floor(playBeat / stepBeats)
      const current = partsForBeat(beatNumber)
      const next = input.manual
        ? (sequence[(manualIndex + 1) % sequence.length] ?? current)
        : partsForStep(step + 1)
      if (!input.random && next === current && sequence.length < 2) return null
      if (input.manual) return { parts: next, ticksLeft: -1 }
      const into = playBeat % stepBeats
      const ticksLeft = (stepBeats - into) * beat - (tick % beat)
      return { parts: next, ticksLeft }
    },
    releaseAfter(tick: number) {
      const beatNumber = beatIndex(tick)
      for (const key of latched.keys()) {
        if (key > beatNumber) latched.delete(key)
      }
    },
    setManualIndex(index: number) {
      manualIndex = index
    },
    reset() {
      latched.clear()
      steps.clear()
    },
  }
}

export function subdivisionSummary(signature: TimeSignature, parts: number): string {
  return subdivisionName(parts, beatTicks(signature))
}

export function barLength(signature: TimeSignature): number {
  return barTicks(signature)
}
