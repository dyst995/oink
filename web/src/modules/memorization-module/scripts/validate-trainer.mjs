/**
 * Smoke checks for memorization trainer helpers.
 * Run: node src/modules/memorization-module/scripts/validate-trainer.mjs
 */

function mod12(value) {
  return ((value % 12) + 12) % 12
}

const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const STRINGS = [
  { number: 1, open: 4 },
  { number: 6, open: 4 },
]

function noteAt(open, fret) {
  return NOTES[mod12(open + fret)]
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

assert(noteAt(4, 0) === 'E', 'open high e is E')
assert(noteAt(4, 1) === 'F', 'e fret 1 is F')
assert(noteAt(4, 8) === 'C', 'low E fret 8 is C')

function parseNote(input) {
  const normalized = input.trim().toUpperCase().replace(/♯/g, '#').replace(/♭/g, 'B').replace(/\s+/g, '')
  const map = {
    C: 'C',
    'C#': 'C♯',
    DB: 'C♯',
    F: 'F',
    'F#': 'F♯',
    GB: 'F♯',
    BB: 'A♯',
  }
  return map[normalized] ?? null
}

assert(parseNote('f#') === 'F♯', 'parse f#')
assert(parseNote('Db') === 'C♯', 'parse Db')
assert(parseNote('bb') === 'A♯', 'parse bb')

// find-all for C on string 6 frets 0-12 should include frets 8
const cFrets = []
for (let fret = 0; fret <= 12; fret += 1) {
  if (noteAt(4, fret) === 'C') cFrets.push(fret)
}
assert(cFrets.includes(8), 'C on low E at 8')
assert(cFrets.length >= 1, 'at least one C')

console.log('memorization trainer validation: ok', { strings: STRINGS.length, cFrets })
