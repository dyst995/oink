/**
 * Rhythm and metronome theory checks.
 * Run: node src/modules/rhythm-module/scripts/validate-rhythm.mjs
 */

import {
  METER_PRESETS,
  barTicks,
  beatTicks,
  beatsPerBar,
  clampBpm,
  signatureError,
  slotTicks,
  secondsPerTick,
} from '../theory/duration.ts'
import { defaultAccentMap, syllables } from '../theory/grid.ts'
import {
  DIFFICULTIES,
  defaultOptions,
  generatePattern,
  mulberry32,
} from '../theory/generate.ts'
import { emptyPattern, onsets, patternError } from '../theory/pattern.ts'
import { evaluateTaps, onsetMs, toleranceMs } from '../theory/accuracy.ts'
import {
  gapSilent,
  metronomeVoices,
  projectClock,
  startClock,
  stepClock,
  timeAtTick,
  tickAtTime,
} from '../theory/schedule.ts'
import { buildMetronomeSpec, DEFAULT_SETTINGS } from '../theory/spec.ts'
import { bpmForBar } from '../theory/tempo.ts'
import { createSubdivisionClock } from '../theory/subdivision.ts'
import { generateQuestion, uniformPattern } from '../theory/questions.ts'
import { normalizeSettings } from '../storage.ts'

let checks = 0

function assert(condition, message) {
  checks += 1
  if (!condition) throw new Error(message || 'Assertion failed')
}

assert(clampBpm(10) === 20)
assert(clampBpm(400) === 300)
assert(clampBpm(88.4) === 88)

for (const preset of METER_PRESETS) {
  assert(!signatureError(preset.signature), `${preset.id} is invalid`)
  assert(beatsPerBar(preset.signature) > 0, `${preset.id} has no beats`)
  assert(barTicks(preset.signature) % beatTicks(preset.signature) === 0, `${preset.id} beat does not divide the bar`)
}

const sixEight = METER_PRESETS.find((item) => item.id === '6/8').signature
assert(beatsPerBar(sixEight) === 2, '6/8 should have two dotted-quarter beats')
assert(beatTicks(sixEight) === 360, '6/8 beat should be a dotted quarter')

const four = METER_PRESETS.find((item) => item.id === '4/4').signature
assert(slotTicks(four, 1) === 240)
assert(slotTicks(four, 2) === 120)
assert(slotTicks(four, 3) === 80)
assert(slotTicks(four, 4) === 60)
assert(slotTicks(four, 5) === 48)
assert(slotTicks(four, 6) === 40)
assert(slotTicks(four, 8) === 30)

const labels = syllables(4, 4, 240)
assert(labels.join(' ') === '1 e & a 2 e & a 3 e & a 4 e & a', labels.join(' '))
assert(syllables(4, 2, 240).join(' ') === '1 & 2 & 3 & 4 &')

const map = defaultAccentMap(four, 4, true, true)
assert(map[0] === 'accent')
assert(map[1] === 'normal')
assert(defaultAccentMap(four, 4, true, false)[1] === 'silent')

const voices = metronomeVoices(0, four, 4, map, { mode: 'off', audibleBars: 1, silentBars: 1, audibleBeats: 1, silentBeats: 1, muteChance: 0, seed: 1 }, 0)
assert(voices.includes('accent'))

const gap = { mode: 'bars', audibleBars: 1, silentBars: 1, audibleBeats: 1, silentBeats: 1, muteChance: 0, seed: 1 }
assert(!gapSilent(gap, 0, 0, 4))
assert(gapSilent(gap, 1, 0, 4))

let clock = startClock(120, 0)
const ticksInBeat = beatTicks(four)
assert(Math.abs(timeAtTick(clock.segments, ticksInBeat, ticksInBeat) - 0.5) < 1e-9)
assert(Math.abs(tickAtTime(clock.segments, 0.5, ticksInBeat) - ticksInBeat) < 1e-9)

const long = projectClock(
  {
    signature: four,
    countInBars: 0,
    slotTicksAt: () => 240,
    voicesAt: () => ['beat'],
    resolveBpm: (_tick, previous) => previous,
    doneAt: (tick) => tick >= 240 * 64,
  },
  240 * 64,
  0,
  120,
)
assert(long.length === 64)
const last = long[long.length - 1]
assert(Math.abs(last.time - (63 * 0.5)) < 1e-6, `drift at event 64: ${last.time}`)

const tempoEvents = projectClock(
  {
    signature: four,
    countInBars: 0,
    slotTicksAt: () => 240,
    voicesAt: () => ['beat'],
    resolveBpm(tick) {
      return tick >= 240 * 4 ? 140 : 100
    },
    doneAt: (tick) => tick >= 240 * 8,
  },
  240 * 8,
  0,
  100,
)
assert(tempoEvents[0].bpm === 100)
assert(tempoEvents[4].bpm === 140)

for (const level of DIFFICULTIES) {
  const rng = mulberry32(level.level * 91)
  for (let i = 0; i < 20; i += 1) {
    const pattern = generatePattern(defaultOptions(level.level, four, 2), rng)
    assert(!patternError(pattern), `level ${level.level} invalid: ${patternError(pattern)}`)
    assert(pattern.bars === 2)
    assert(onsets(pattern).length > 0 || pattern.notes.some((note) => note.rest))
  }
}

assert(!patternError(emptyPattern(four, 1)))
assert(!patternError(uniformPattern(four, 1, 4)))

const expected = onsetMs([0, 240, 480, 720], 120, 240)
assert(expected[1] === 500)
const scored = evaluateTaps(expected, [8, 492, 1040, 1485, 1600], 40)
assert(scored.onTime + scored.early + scored.late === 4, JSON.stringify(scored))
assert(scored.missed === 0)
assert(scored.extras === 1)
assert(scored.late >= 1 || scored.early >= 1)
assert(toleranceMs(60, 60, 240, 1) > toleranceMs(180, 60, 240, 5))

const step = bpmForBar(
  { enabled: true, targetBpm: 100, increment: 5, barsPerStep: 2, manual: false, repeat: false, approvedStep: 0 },
  60,
  4,
)
assert(step === 70, `tempo ladder returned ${step}`)

const subdiv = createSubdivisionClock({
  signature: four,
  sequence: [1, 2, 4],
  random: false,
  choices: [1, 2, 4],
  interval: { unit: 'bar', count: 1 },
  countInBars: 0,
  manual: false,
  seed: 1,
})
assert(subdiv.partsAtTick(0) === 1)
assert(subdiv.partsAtTick(barTicks(four)) === 2)
assert(subdiv.partsAtTick(barTicks(four) * 2) === 4)
assert(subdiv.upcoming(0)?.parts === 2)

const question = generateQuestion({
  signature: four,
  bpm: 80,
  bars: 1,
  difficulty: 2,
  subdivisions: [1, 2, 4],
  kinds: ['subdivision'],
  metronomeAudible: true,
  replays: 1,
}, mulberry32(3))
assert(question.choices.length >= 2)
assert(question.answerId)

const settings = normalizeSettings({ bpm: 999, parts: 4, signature: { numerator: 4, denominator: 4, beatGroup: 1 } })
assert(settings.bpm === 300)
assert(settings.parts === 4)

const live = { ...DEFAULT_SETTINGS, bpm: 90 }
const spec = buildMetronomeSpec(() => live, { maxBars: 1 })
let walk = startClock(90, 0)
let events = 0
while (events < 200) {
  const stepped = stepClock(walk, spec)
  if (!stepped) break
  walk = stepped.clock
  events += 1
}
assert(events > 4)
assert(Math.abs(secondsPerTick(120, 240) - 0.5 / 240) < 1e-12)

console.log(`Rhythm checks passed (${checks}).`)
