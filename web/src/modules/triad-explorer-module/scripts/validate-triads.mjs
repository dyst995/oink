/**
 * Validate triad explorer voicing + spelling logic.
 * Run: node src/modules/triad-explorer-module/scripts/validate-triads.mjs
 */

import assert from 'node:assert/strict'

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const LETTER_PITCH = [0, 2, 4, 5, 7, 9, 11]
const OPEN_MIDI = [40, 45, 50, 55, 59, 64]
const MAX_FRET = 24

const QUALITIES = {
  major: { offsets: [0, 4, 7], degrees: ['1', '3', '5'], degreeNums: [1, 3, 5] },
  minor: { offsets: [0, 3, 7], degrees: ['1', '♭3', '5'], degreeNums: [1, 3, 5] },
  diminished: { offsets: [0, 3, 6], degrees: ['1', '♭3', '♭5'], degreeNums: [1, 3, 5] },
  augmented: { offsets: [0, 4, 8], degrees: ['1', '3', '♯5'], degreeNums: [1, 3, 5] },
}

const STRING_SETS = {
  gbe: { numbers: [3, 2, 1], labels: ['G', 'B', 'e'] },
  dgb: { numbers: [4, 3, 2], labels: ['D', 'G', 'B'] },
  adg: { numbers: [5, 4, 3], labels: ['A', 'D', 'G'] },
  ead: { numbers: [6, 5, 4], labels: ['E', 'A', 'D'] },
}

function mod12(value) {
  return ((value % 12) + 12) % 12
}

function mod7(value) {
  return ((value % 7) + 7) % 7
}

function accidentalGlyph(amount) {
  if (amount === 0) return ''
  if (amount > 0) return '♯'.repeat(amount)
  return '♭'.repeat(-amount)
}

function parseKey(input) {
  const match = input.trim().replace(/♭/g, 'b').replace(/♯/g, '#').match(/^([A-Ga-g])(bb|##|b|#)?$/)
  if (!match) throw new Error(`bad key ${input}`)
  const letter = match[1].toUpperCase()
  const token = match[2] ?? ''
  const accidental = token === 'bb' ? -2 : token === 'b' ? -1 : token === '#' ? 1 : token === '##' ? 2 : 0
  const letterIndex = LETTERS.indexOf(letter)
  return {
    name: letter + accidentalGlyph(accidental),
    letter,
    letterIndex,
    accidental,
    pitchClass: mod12(LETTER_PITCH[letterIndex] + accidental),
  }
}

function spell(root, degree, semitones) {
  const letterIndex = mod7(root.letterIndex + ((degree - 1) % 7))
  const letter = LETTERS[letterIndex]
  let diff = mod12(root.pitchClass + semitones) - LETTER_PITCH[letterIndex]
  if (diff > 6) diff -= 12
  if (diff < -6) diff += 12
  return letter + accidentalGlyph(diff)
}

function buildTriad(rootInput, qualityId) {
  const root = parseKey(rootInput)
  const quality = QUALITIES[qualityId]
  const roles = ['root', 'third', 'fifth']
  return quality.offsets.map((semitones, index) => ({
    role: roles[index],
    degreeLabel: quality.degrees[index],
    semitones,
    pitchClass: mod12(root.pitchClass + semitones),
    name: spell(root, quality.degreeNums[index], semitones),
  }))
}

function openMidi(stringNumber) {
  return OPEN_MIDI[6 - stringNumber]
}

function fretsFor(open, pitchClass) {
  const first = mod12(pitchClass - mod12(open))
  const frets = []
  for (let fret = first; fret <= MAX_FRET; fret += 12) frets.push(fret)
  return frets
}

function permutations(items) {
  if (items.length <= 1) return [items.slice()]
  const out = []
  for (let i = 0; i < items.length; i += 1) {
    const rest = items.filter((_, index) => index !== i)
    for (const perm of permutations(rest)) out.push([items[i], ...perm])
  }
  return out
}

function findVoicings(tones, setId) {
  const set = STRING_SETS[setId]
  const opens = set.numbers.map(openMidi)
  const buckets = { root: [], first: [], second: [] }

  for (const assignment of permutations(tones)) {
    const choices = assignment.map((tone, index) =>
      fretsFor(opens[index], tone.pitchClass).map((fret) => ({
        fret,
        midi: opens[index] + fret,
        tone,
      })),
    )
    for (const a of choices[0]) {
      for (const b of choices[1]) {
        for (const c of choices[2]) {
          const chosen = [a, b, c]
          const midis = chosen.map((n) => n.midi)
          if (!(midis[0] < midis[1] && midis[1] < midis[2])) continue
          if (midis[2] - midis[0] >= 12) continue
          const frets = chosen.map((n) => n.fret)
          const names = chosen.map((n) => n.tone.name)
          const bassRole = chosen[0].tone.role
          const inversion = bassRole === 'root' ? 'root' : bassRole === 'third' ? 'first' : 'second'
          buckets[inversion].push({ frets, names, bassRole })
        }
      }
    }
  }

  for (const key of Object.keys(buckets)) {
    const seen = new Set()
    buckets[key] = buckets[key]
      .filter((v) => {
        const id = v.frets.join('-')
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .sort((a, b) => {
        const score = (v) => Math.max(...v.frets) * 1000 + v.frets.reduce((s, n) => s + n, 0)
        return score(a) - score(b)
      })
  }
  return buckets
}

function hasVoicing(list, frets, names) {
  return list.some(
    (v) => v.frets.join(',') === frets.join(',') && v.names.join(',') === names.join(','),
  )
}

const cMajGbe = findVoicings(buildTriad('C', 'major'), 'gbe')
assert.ok(hasVoicing(cMajGbe.root, [5, 5, 3], ['C', 'E', 'G']), 'C maj root 5-5-3')
assert.ok(hasVoicing(cMajGbe.first, [9, 8, 8], ['E', 'G', 'C']), 'C maj 1st 9-8-8')
assert.ok(hasVoicing(cMajGbe.second, [12, 13, 12], ['G', 'C', 'E']), 'C maj 2nd 12-13-12')
assert.deepEqual(cMajGbe.root[0].frets, [5, 5, 3])
assert.deepEqual(cMajGbe.first[0].frets, [9, 8, 8])
assert.deepEqual(cMajGbe.second[0].frets, [0, 1, 0]) // lowest-fret 2nd inv

const gMajDgb = findVoicings(buildTriad('G', 'major'), 'dgb')
assert.ok(hasVoicing(gMajDgb.second, [0, 0, 0], ['D', 'G', 'B']), 'open G maj 2nd')

assert.deepEqual(
  buildTriad('Db', 'major').map((t) => t.name),
  ['D♭', 'F', 'A♭'],
)
assert.deepEqual(
  buildTriad('C', 'diminished').map((t) => t.name),
  ['C', 'E♭', 'G♭'],
)
assert.deepEqual(
  buildTriad('C', 'augmented').map((t) => t.name),
  ['C', 'E', 'G♯'],
)

const cAug = findVoicings(buildTriad('C', 'augmented'), 'gbe')
assert.equal(cAug.first[0].bassRole, 'third')
assert.equal(cAug.second[0].bassRole, 'fifth')

for (const setId of Object.keys(STRING_SETS)) {
  const voicings = findVoicings(buildTriad('C', 'major'), setId)
  assert.ok(voicings.root.length > 0, `${setId} has root`)
  assert.ok(voicings.first.length > 0, `${setId} has first`)
  assert.ok(voicings.second.length > 0, `${setId} has second`)
}

assert.deepEqual(findVoicings(buildTriad('C', 'major'), 'dgb').root[0].frets, [10, 9, 8])
assert.deepEqual(findVoicings(buildTriad('C', 'major'), 'adg').root[0].frets, [3, 2, 0])
assert.deepEqual(findVoicings(buildTriad('C', 'major'), 'ead').root[0].frets, [8, 7, 5])

console.log('validate-triads: all checks passed')
