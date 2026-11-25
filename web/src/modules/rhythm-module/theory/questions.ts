import { barTicks, beatTicks, beatsPerBar, meterLabel, subdivisionName, type TimeSignature } from './duration.ts'
import { defaultOptions, generatePattern, mulberry32, type Difficulty } from './generate.ts'
import { patternWords, type RhythmPattern } from './pattern.ts'

export type QuestionKind =
  | 'subdivision'
  | 'transition'
  | 'mixed'
  | 'rests'
  | 'tap'
  | 'notation'

export type RecognitionQuestion = {
  id: string
  kind: QuestionKind
  prompt: string
  pattern: RhythmPattern
  choices: { id: string; label: string; pattern?: RhythmPattern }[]
  answerId: string
}

export type QuestionConfig = {
  signature: TimeSignature
  bpm: number
  bars: number
  difficulty: Difficulty
  subdivisions: number[]
  kinds: QuestionKind[]
  metronomeAudible: boolean
  replays: number
}

export function generateQuestion(config: QuestionConfig, rng: () => number = Math.random): RecognitionQuestion {
  const kinds = config.kinds.length ? config.kinds : (['subdivision'] as QuestionKind[])
  const kind = kinds[Math.floor(rng() * kinds.length)] ?? 'subdivision'
  if (kind === 'transition') return transitionQuestion(config, rng)
  if (kind === 'notation' || kind === 'mixed') return matchQuestion(config, rng, kind)
  if (kind === 'rests') return restQuestion(config, rng)
  if (kind === 'tap') return tapQuestion(config, rng)
  return subdivisionQuestion(config, rng)
}

function subdivisionQuestion(config: QuestionConfig, rng: () => number): RecognitionQuestion {
  const parts = pick(config.subdivisions, rng) ?? 1
  const pattern = uniformPattern(config.signature, config.bars, parts)
  const choices = unique(config.subdivisions.length ? config.subdivisions : [1, 2, 4]).map((value) => ({
    id: String(value),
    label: subdivisionName(value, beatTicks(config.signature)),
  }))
  return {
    id: cryptoId(rng),
    kind: 'subdivision',
    prompt: 'Which subdivision did you hear?',
    pattern,
    choices,
    answerId: String(parts),
  }
}

function transitionQuestion(config: QuestionConfig, rng: () => number): RecognitionQuestion {
  const options = unique(config.subdivisions.length > 1 ? config.subdivisions : [1, 2, 4])
  const first = pick(options, rng) ?? 1
  let second = pick(options, rng) ?? 2
  if (second === first) second = options.find((value) => value !== first) ?? first
  const bars = Math.max(2, config.bars)
  const pattern = joined(uniformPattern(config.signature, Math.floor(bars / 2), first), uniformPattern(config.signature, bars - Math.floor(bars / 2), second))
  const forward = `${subdivisionName(first, beatTicks(config.signature))} → ${subdivisionName(second, beatTicks(config.signature))}`
  const reverse = `${subdivisionName(second, beatTicks(config.signature))} → ${subdivisionName(first, beatTicks(config.signature))}`
  const steady = subdivisionName(first, beatTicks(config.signature))
  return {
    id: cryptoId(rng),
    kind: 'transition',
    prompt: 'What changed during the rhythm?',
    pattern,
    choices: [
      { id: 'forward', label: forward },
      { id: 'reverse', label: reverse },
      { id: 'steady', label: `Only ${steady}` },
    ],
    answerId: 'forward',
  }
}

function matchQuestion(config: QuestionConfig, rng: () => number, kind: QuestionKind): RecognitionQuestion {
  const level = (kind === 'mixed' ? Math.max(4, config.difficulty) : config.difficulty) as Difficulty
  const correct = generatePattern({ ...defaultOptions(level, config.signature, config.bars), seed: Math.floor(rng() * 10000) }, rng)
  const decoys = [0, 1].map((offset) =>
    generatePattern(defaultOptions(level, config.signature, config.bars), mulberry32(Math.floor(rng() * 100000) + offset + 3)),
  )
  const patterns = shuffle([correct, ...decoys], rng).slice(0, 3)
  if (!patterns.some((item) => patternWords(item) === patternWords(correct))) patterns[0] = correct
  const answerIndex = Math.max(0, patterns.findIndex((item) => item === correct))
  return {
    id: cryptoId(rng),
    kind,
    prompt: kind === 'mixed' ? 'Which notation matches the mixed rhythm?' : 'Which notation matches what you heard?',
    pattern: correct,
    choices: patterns.map((pattern, index) => ({ id: String(index), label: `Option ${index + 1}`, pattern })),
    answerId: String(answerIndex),
  }
}

function restQuestion(config: QuestionConfig, rng: () => number): RecognitionQuestion {
  const withRests = generatePattern({ ...defaultOptions(4, config.signature, config.bars), rests: true, syncopation: false }, rng)
  const plain = uniformPattern(config.signature, config.bars, 2)
  const heardRests = withRests.notes.some((note) => note.rest)
  const pattern = heardRests && rng() < 0.7 ? withRests : plain
  const answer = pattern.notes.some((note) => note.rest) ? 'rests' : 'notes'
  return {
    id: cryptoId(rng),
    kind: 'rests',
    prompt: 'Did the rhythm include a rest?',
    pattern,
    choices: [
      { id: 'rests', label: 'Yes, there is a rest' },
      { id: 'notes', label: 'No, every attack is a note' },
    ],
    answerId: answer,
  }
}

function tapQuestion(config: QuestionConfig, rng: () => number): RecognitionQuestion {
  const pattern = generatePattern(defaultOptions(Math.min(4, config.difficulty) as Difficulty, config.signature, config.bars), rng)
  return {
    id: cryptoId(rng),
    kind: 'tap',
    prompt: `Tap the rhythm back in ${meterLabel(config.signature)}.`,
    pattern,
    choices: [],
    answerId: 'tap',
  }
}

export function uniformPattern(signature: TimeSignature, bars: number, parts: number): RhythmPattern {
  const beat = beatTicks(signature)
  const ticks = beat % parts === 0 ? beat / parts : beat
  const safeBars = Math.max(1, bars)
  const notes = []
  const size = barTicks(signature)
  for (let bar = 0; bar < safeBars; bar += 1) {
    for (let cursor = 0; cursor < size; cursor += ticks) {
      notes.push({
        start: bar * size + cursor,
        ticks,
        rest: false,
        accent: cursor === 0,
        tied: false,
      })
    }
  }
  return { signature, bars: safeBars, notes }
}

function joined(left: RhythmPattern, right: RhythmPattern): RhythmPattern {
  const shift = barTicks(left.signature) * left.bars
  return {
    signature: left.signature,
    bars: left.bars + right.bars,
    notes: [...left.notes, ...right.notes.map((note) => ({ ...note, start: note.start + shift }))],
  }
}

function pick<T>(items: T[], rng: () => number): T | undefined {
  if (!items.length) return undefined
  return items[Math.floor(rng() * items.length)]
}

function unique(values: number[]): number[] {
  return [...new Set(values)]
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swap] as T
    copy[swap] = current as T
  }
  return copy
}

function cryptoId(rng: () => number): string {
  return `q-${Math.floor(rng() * 1e9).toString(36)}`
}

export function beatsIn(signature: TimeSignature): number {
  return beatsPerBar(signature)
}
