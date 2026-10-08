/**
 * Lightweight theory checks for the fretboard explorer.
 * Run: node src/modules/fretboard-module/scripts/validate-theory.mjs
 *
 * Mirrors key behaviors from theory.ts without a test runner.
 */

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const LETTER_PITCH = [0, 2, 4, 5, 7, 9, 11]
const MAJOR_SEMITONES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12, 9: 14, 10: 16, 11: 17, 12: 19, 13: 21 }

function mod12(value) {
  return ((value % 12) + 12) % 12
}

function parseKey(input) {
  const match = input.trim().replace(/♭/g, 'b').replace(/♯/g, '#').match(/^([A-Ga-g])(bb|##|b|#)?$/)
  if (!match) throw new Error(`bad key ${input}`)
  const letter = match[1].toUpperCase()
  const token = match[2] ?? ''
  const accidental = token === 'bb' ? -2 : token === 'b' ? -1 : token === '#' ? 1 : token === '##' ? 2 : 0
  const letterIndex = LETTERS.indexOf(letter)
  return {
    name: letter + (accidental > 0 ? '#'.repeat(accidental) : 'b'.repeat(-accidental)),
    letter,
    letterIndex,
    accidental,
    pitchClass: mod12(LETTER_PITCH[letterIndex] + accidental),
  }
}

function normalizeFormula(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/[–—−]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
}

function tokenize(input) {
  return normalizeFormula(input)
    .split(/\s+/)
    .flatMap((chunk) => chunk.split('-'))
    .filter(Boolean)
}

function parseDegreeToken(token) {
  const match = token.match(/^(bb|##|b|#)?(1[0-3]|[1-9])(bb|##|b|#)?$/)
  if (!match || (match[1] && match[3])) throw new Error(`bad degree ${token}`)
  const accidentalToken = match[1] ?? match[3] ?? ''
  const degree = Number(match[2])
  const alter =
    accidentalToken === 'bb'
      ? -2
      : accidentalToken === 'b'
        ? -1
        : accidentalToken === '#'
          ? 1
          : accidentalToken === '##'
            ? 2
            : 0
  return { degree, alter, semitones: mod12(MAJOR_SEMITONES[degree] + alter) }
}

function parseByKind(input, kind) {
  const tokens = tokenize(input)
  if (kind === 'degrees') return tokens.map((token) => parseDegreeToken(token).semitones)
  if (kind === 'offsets') return tokens.map(Number).map(mod12)
  if (kind === 'steps') {
    const values = [0]
    let cursor = 0
    for (const step of tokens.map(Number)) {
      cursor += step
      values.push(mod12(cursor))
    }
    return values
  }
  throw new Error('unknown kind')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const c = parseKey('C')
assert(c.pitchClass === 0, 'C should be pitch class 0')
assert(parseKey('F#').pitchClass === 6, 'F# should be 6')
assert(parseKey('Bb').pitchClass === 10, 'Bb should be 10')

const majorDegrees = parseByKind('1 2 3 4 5 6 7', 'degrees')
assert(majorDegrees.join(',') === '0,2,4,5,7,9,11', 'major degrees')

const majorSteps = parseByKind('2 2 1 2 2 2 1', 'steps')
assert(majorSteps.join(',') === '0,2,4,5,7,9,11,0', 'major steps wrap')

const majorOffsets = parseByKind('0 2 4 5 7 9 11', 'offsets')
assert(majorOffsets.join(',') === '0,2,4,5,7,9,11', 'major offsets')

const minor = parseByKind('1 2 b3 4 5 b6 b7', 'degrees')
assert(minor.join(',') === '0,2,3,5,7,8,10', 'natural minor degrees')

const dom7 = parseByKind('1 3 5 b7', 'degrees')
assert(dom7.join(',') === '0,4,7,10', 'dominant 7')

assert(normalizeFormula('1  2, b3') === '1 2 b3', 'normalize spacing')

// C major shapes (root on low E at fret 8) — guitarscale-style positions
function buildShapes(rootPitchClass) {
  const lowE = 4
  const rootOnE = mod12(rootPitchClass - lowE)
  const offsets = [-1, 2, 4, -6, -4]
  return offsets.map((delta, index) => {
    const raw = rootOnE + delta
    const wrapped = mod12(raw)
    return {
      id: index + 1,
      start: wrapped === 0 && raw !== 0 ? 12 : wrapped,
    }
  })
}

const cShapes = buildShapes(0)
assert(
  cShapes.map((shape) => shape.start).join(',') === '7,10,12,2,4',
  `C major shape starts expected 7,10,12,2,4 got ${cShapes.map((s) => s.start)}`,
)

// A major: A-form starts at 11 and should stay contiguous past 12 (11–14), not wrap to 1–2
const aShape4Start = buildShapes(9).find((shape) => shape.id === 4)?.start
assert(aShape4Start === 11, `A major shape 4 start expected 11 got ${aShape4Start}`)

function fretsForWindow(startFret, span = 4, fretCount = 15) {
  const frets = []
  for (let offset = 0; offset < span; offset += 1) {
    const absolute = startFret + offset
    if (absolute <= fretCount) frets.push(absolute)
  }
  return frets
}

assert(
  fretsForWindow(11).join(',') === '11,12,13,14',
  'shape window past octave must stay contiguous',
)

console.log('fretboard theory validation: ok')
