#!/usr/bin/env node
/**
 * Automated checks for guitar theory lesson claims.
 * Standard tuning, string 6 = low E … string 1 = high E.
 * Pitch classes: 0=C … 11=B.
 */

const OPEN = [null, 4, 11, 7, 2, 9, 4] // index by string number 1–6: E B G D A E

const PC = {
  C: 0,
  'C♯': 1,
  'D♭': 1,
  D: 2,
  'D♯': 3,
  'E♭': 3,
  E: 4,
  F: 5,
  'F♯': 6,
  'G♭': 6,
  G: 7,
  'G♯': 8,
  'A♭': 8,
  A: 9,
  'A♯': 10,
  'B♭': 10,
  B: 11,
}

function noteAt(string, fret) {
  return (OPEN[string] + fret) % 12
}

function parseNote(name) {
  const n = name.trim().replace(/#/g, '♯').replace(/b/g, '♭')
  if (PC[n] === undefined) throw new Error(`Unknown note ${name}`)
  return PC[n]
}

function assertNote(string, fret, expectedName, label) {
  const got = noteAt(string, fret)
  const exp = parseNote(expectedName)
  if (got !== exp) {
    throw new Error(
      `${label}: string ${string} fret ${fret} is pc ${got}, expected ${expectedName} (${exp})`,
    )
  }
}

function inversionOfTriad(notesAscBassFirst, root, third, fifth) {
  const bass = notesAscBassFirst[0]
  if (bass === root) return 'root'
  if (bass === third) return 'first'
  if (bass === fifth) return 'second'
  throw new Error(`Bass ${bass} not in triad`)
}

function motionTotal(fromFrets, toFrets) {
  return fromFrets.reduce((sum, f, i) => sum + Math.abs(toFrets[i] - f), 0)
}

const errors = []
function check(name, fn) {
  try {
    fn()
    console.log(`OK  ${name}`)
  } catch (e) {
    errors.push(`${name}: ${e.message}`)
    console.error(`FAIL ${name}: ${e.message}`)
  }
}

// --- Lesson 20 tables ---
check('20 G major inversions on 4-3-2', () => {
  assertNote(4, 5, 'G', 'root')
  assertNote(3, 4, 'B', 'root')
  assertNote(2, 3, 'D', 'root')
  assertNote(4, 9, 'B', '1st')
  assertNote(3, 7, 'D', '1st')
  assertNote(2, 8, 'G', '1st')
  assertNote(4, 0, 'D', '2nd')
  assertNote(3, 0, 'G', '2nd')
  assertNote(2, 0, 'B', '2nd')
})

check('20 G minor inversions on 4-3-2', () => {
  assertNote(4, 5, 'G', 'root')
  assertNote(3, 3, 'B♭', 'root')
  assertNote(2, 3, 'D', 'root')
  assertNote(4, 8, 'B♭', '1st')
  assertNote(3, 7, 'D', '1st')
  assertNote(2, 8, 'G', '1st')
  assertNote(4, 12, 'D', '2nd')
  assertNote(3, 12, 'G', '2nd')
  assertNote(2, 11, 'B♭', '2nd')
})

check('20 C major inversions on 4-3-2', () => {
  assertNote(4, 10, 'C', 'root')
  assertNote(3, 9, 'E', 'root')
  assertNote(2, 8, 'G', 'root')
  assertNote(4, 14, 'E', '1st')
  assertNote(3, 12, 'G', '1st')
  assertNote(2, 13, 'C', '1st')
  assertNote(4, 5, 'G', '2nd')
  assertNote(3, 5, 'C', '2nd')
  assertNote(2, 5, 'E', '2nd')
})

check('20 exercise 2 inversion IDs', () => {
  const dm = inversionOfTriad(
    [parseNote('A'), parseNote('D'), parseNote('F')],
    parseNote('D'),
    parseNote('F'),
    parseNote('A'),
  )
  if (dm !== 'second') throw new Error(`A D F should be Dm second, got ${dm}`)
  const g = inversionOfTriad(
    [parseNote('B'), parseNote('D'), parseNote('G')],
    parseNote('G'),
    parseNote('B'),
    parseNote('D'),
  )
  if (g !== 'first') throw new Error(`B D G should be G first, got ${g}`)
  const cm = inversionOfTriad(
    [parseNote('E♭'), parseNote('G'), parseNote('C')],
    parseNote('C'),
    parseNote('E♭'),
    parseNote('G'),
  )
  if (cm !== 'first') throw new Error(`E♭ G C should be Cm first, got ${cm}`)
})

check('20 exercise 5 slide 3 3 3 = B♭ major second', () => {
  assertNote(4, 3, 'F', 'bass')
  assertNote(3, 3, 'B♭', 'root')
  assertNote(2, 3, 'D', 'fifth')
  const inv = inversionOfTriad(
    [parseNote('F'), parseNote('B♭'), parseNote('D')],
    parseNote('B♭'),
    parseNote('D'),
    parseNote('F'),
  )
  if (inv !== 'second') throw new Error(inv)
})

check('20 exercise 6 D major first 4 2 3', () => {
  assertNote(4, 4, 'F♯', 'a')
  assertNote(3, 2, 'A', 'b')
  assertNote(2, 3, 'D', 'c')
})

// --- Lesson 21 ---
check('21 C major on 5-4-3', () => {
  assertNote(5, 3, 'C', 'r')
  assertNote(4, 2, 'E', 'r')
  assertNote(3, 0, 'G', 'r')
  assertNote(5, 7, 'E', '1')
  assertNote(4, 5, 'G', '1')
  assertNote(3, 5, 'C', '1')
  assertNote(5, 10, 'G', '2')
  assertNote(4, 10, 'C', '2')
  assertNote(3, 9, 'E', '2')
})

check('21 C minor from C major on 4-3-2', () => {
  assertNote(4, 10, 'C', 'r')
  assertNote(3, 8, 'E♭', 'r')
  assertNote(2, 8, 'G', 'r')
  assertNote(4, 13, 'E♭', '1')
  assertNote(3, 12, 'G', '1')
  assertNote(2, 13, 'C', '1')
  assertNote(4, 5, 'G', '2')
  assertNote(3, 5, 'C', '2')
  assertNote(2, 4, 'E♭', '2')
})

check('21 D major on 3-2-1', () => {
  assertNote(3, 7, 'D', 'r')
  assertNote(2, 7, 'F♯', 'r')
  assertNote(1, 5, 'A', 'r')
  assertNote(3, 11, 'F♯', '1')
  assertNote(2, 10, 'A', '1')
  assertNote(1, 10, 'D', '1')
  assertNote(3, 2, 'A', '2')
  assertNote(2, 3, 'D', '2')
  assertNote(1, 2, 'F♯', '2')
})

// --- Lesson 23 voice-leading math ---
check('23 C→G nearby vs far', () => {
  const near = motionTotal([10, 9, 8], [9, 7, 8])
  const far = motionTotal([10, 9, 8], [12, 12, 12])
  if (near !== 3) throw new Error(`near=${near}`)
  if (far !== 9) throw new Error(`far=${far}`)
})

check('23 C–Am–F–G–C smooth totals', () => {
  const path = [
    [10, 9, 8],
    [10, 9, 10],
    [10, 10, 10],
    [9, 7, 8],
    [10, 9, 8],
  ]
  const steps = []
  for (let i = 1; i < path.length; i += 1) steps.push(motionTotal(path[i - 1], path[i]))
  const total = steps.reduce((a, b) => a + b, 0)
  if (JSON.stringify(steps) !== JSON.stringify([2, 1, 6, 3])) throw new Error(String(steps))
  if (total !== 12) throw new Error(`total=${total}`)
})

check('23 root-position hop total 42', () => {
  const path = [
    [10, 9, 8],
    [7, 5, 5],
    [3, 2, 1],
    [5, 4, 3],
    [10, 9, 8],
  ]
  const total = path.slice(1).reduce((sum, frets, i) => sum + motionTotal(path[i], frets), 0)
  if (total !== 42) throw new Error(`total=${total}`)
})

check('23 Am–Dm–E–Am motions', () => {
  const path = [
    [7, 5, 5],
    [7, 7, 6],
    [6, 4, 5],
    [7, 5, 5],
  ]
  assertNote(4, 6, 'G♯', 'E bass')
  const steps = path.slice(1).map((frets, i) => motionTotal(path[i], frets))
  if (JSON.stringify(steps) !== JSON.stringify([3, 5, 2])) throw new Error(String(steps))
})

check('23 exercise 8 Dm–G–C', () => {
  if (motionTotal([7, 7, 6], [9, 7, 8]) !== 4) throw new Error('Dm→G')
  if (motionTotal([9, 7, 8], [10, 9, 8]) !== 3) throw new Error('G→C')
})

if (errors.length) {
  console.error(`\n${errors.length} failure(s)`)
  process.exit(1)
}
console.log('\nAll validation checks passed.')
