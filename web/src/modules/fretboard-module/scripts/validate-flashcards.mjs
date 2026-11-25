/**
 * Checks for the fretboard flashcard trainer.
 * Run: node src/modules/fretboard-module/scripts/validate-flashcards.mjs
 */

import { buildScaleShapes } from '../shapes.ts'
import { GUITAR_STRINGS, KEY_OPTIONS, pitchClassAt } from '../theory.ts'
import {
  DEFAULT_SETTINGS,
  TRAINER_SCALES,
  drawSession,
  emptyMemory,
  enumerateCards,
  gradeAnswer,
  missedCards,
  normalizeDegree,
  parsePitchClass,
  rememberAttempt,
  scaleSummary,
  scopeError,
  summarizeAttempts,
} from '../trainer/engine.ts'
import {
  advanceSession,
  gradeSession,
  revealCard,
  startPractice,
  startReview,
} from '../trainer/session.ts'
import { shortcutAction, shortcutBlocked } from '../trainer/shortcuts.ts'
import { normalizeSettings } from '../trainer/storage.ts'

const DEGREE_TABLE = {
  major: '1 2 3 4 5 6 7',
  'natural-minor': '1 2 ♭3 4 5 ♭6 ♭7',
  'harmonic-minor': '1 2 ♭3 4 5 ♭6 7',
  'melodic-minor': '1 2 ♭3 4 5 6 7',
  'major-pentatonic': '1 2 3 5 6',
  'minor-pentatonic': '1 ♭3 4 5 ♭7',
  blues: '1 ♭3 4 ♭5 5 ♭7',
  ionian: '1 2 3 4 5 6 7',
  dorian: '1 2 ♭3 4 5 6 ♭7',
  phrygian: '1 ♭2 ♭3 4 5 ♭6 ♭7',
  lydian: '1 2 3 ♯4 5 6 7',
  mixolydian: '1 2 3 4 5 6 ♭7',
  aeolian: '1 2 ♭3 4 5 ♭6 ♭7',
  locrian: '1 ♭2 ♭3 4 ♭5 ♭6 ♭7',
}

let checks = 0

function assert(condition, message) {
  checks += 1
  if (!condition) throw new Error(message)
}

function mulberry32(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function settings(partial) {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    modes: partial.modes ? [...partial.modes] : [...DEFAULT_SETTINGS.modes],
    variations: partial.variations ? [...partial.variations] : [...DEFAULT_SETTINGS.variations],
  }
}

for (const preset of TRAINER_SCALES) {
  assert(DEGREE_TABLE[preset.id], `Add ${preset.id} to the degree table`)
}

for (const tonic of KEY_OPTIONS) {
  for (const preset of TRAINER_SCALES) {
    const summary = scaleSummary(tonic, preset.id)
    assert(summary, `${tonic} ${preset.id} did not build`)
    assert(summary.degrees === DEGREE_TABLE[preset.id], `${tonic} ${preset.id} degrees: ${summary.degrees}`)
    const cards = enumerateCards(
      settings({ tonic, scaleId: preset.id, range: 'entire', modes: ['fret-to-note', 'note-to-degree', 'degree-to-note', 'note-to-fret'] }),
    )
    assert(cards.length > 0, `${tonic} ${preset.id} produced no cards`)
    for (const card of cards) {
      assert(parsePitchClass(card.noteName) === card.pitchClass, `${card.noteName} does not spell ${card.pitchClass}`)
      assert(card.positions.length > 0, `${card.signature} has no position`)
      for (const position of card.positions) {
        const guitarString = GUITAR_STRINGS.find((item) => item.id === position.stringId)
        assert(guitarString, `missing string ${position.stringId}`)
        assert(
          pitchClassAt(guitarString.openPitchClass, position.fret) === position.pitchClass,
          `${position.stringLabel} fret ${position.fret} pitch mismatch`,
        )
        assert(position.pitchClass === card.pitchClass, `${card.signature} highlights a different note`)
      }
    }
  }
}

const pentatonic = scaleSummary('A', 'minor-pentatonic')
assert(pentatonic.degrees.split(' ')[2] === '4', 'Minor pentatonic third note must be degree 4')
assert(!pentatonic.degrees.split(' ').includes('3'), 'Minor pentatonic has no major 3')

const blues = scaleSummary('A', 'blues')
assert(blues.degrees.split(' ')[3] === '♭5', 'Blues fourth note is ♭5')
assert(blues.degrees.includes('5'), 'Blues keeps the natural 5 next to ♭5')

const gMajor = scaleSummary('G', 'major')
assert(gMajor.notes === 'G A B C D E F♯', `G major spelling: ${gMajor.notes}`)
const gMinor = scaleSummary('G', 'natural-minor')
assert(gMinor.notes.includes('B♭'), `G natural minor spelling: ${gMinor.notes}`)
assert(!gMinor.notes.split(' ').includes('B'), 'G natural minor does not include B natural')

const fMajor = scaleSummary('F', 'major')
assert(fMajor.notes.includes('B♭') && !fMajor.notes.includes('A♯'), `F major spelling: ${fMajor.notes}`)
const fSharp = scaleSummary('F#', 'major')
assert(fSharp.notes.includes('E♯'), `F♯ major spelling: ${fSharp.notes}`)
const gFlat = scaleSummary('Gb', 'major')
assert(gFlat.notes.startsWith('G♭'), `G♭ major spelling: ${gFlat.notes}`)
const dFlatMinor = scaleSummary('Db', 'natural-minor')
assert(dFlatMinor.notes.includes('F♭'), `D♭ minor spelling: ${dFlatMinor.notes}`)
assert(dFlatMinor.notes.includes('B♭♭'), `D♭ minor spelling: ${dFlatMinor.notes}`)

const gMajorFrets = enumerateCards(
  settings({ tonic: 'G', scaleId: 'major', modes: ['note-to-fret'], variations: ['string'], range: 'entire' }),
)
const bOnD = gMajorFrets.find((card) => card.noteName === 'B' && card.stringId === '4')
assert(bOnD, 'Missing B on the D string')
assert(bOnD.prompt === 'Where is B on the D string?', bOnD.prompt)
assert(bOnD.expected === '9th fret', bOnD.expected)
assert(bOnD.degreeLabel === '3', bOnD.degreeLabel)
assert(gradeAnswer(bOnD, { kind: 'position', stringId: '4', fret: 9 }), '9th fret should be accepted')
assert(!gradeAnswer(bOnD, { kind: 'position', stringId: '4', fret: 8 }), '8th fret should be rejected')
assert(!gradeAnswer(bOnD, { kind: 'position', stringId: '3', fret: 9 }), 'Wrong string should be rejected')

const cOnB = gMajorFrets.find((card) => card.noteName === 'C' && card.stringId === '2')
assert(cOnB && cOnB.positions.length > 1, 'C on the B string should have more than one fret')
for (const position of cOnB.positions) {
  assert(gradeAnswer(cOnB, { kind: 'position', stringId: position.stringId, fret: position.fret }))
}

const gMinorDegrees = enumerateCards(
  settings({ tonic: 'G', scaleId: 'natural-minor', modes: ['note-to-degree'], range: 'entire' }),
)
const flatThree = gMinorDegrees.find((card) => card.noteName === 'B♭')
assert(flatThree?.degreeLabel === '♭3', flatThree?.degreeLabel)
assert(gradeAnswer(flatThree, { kind: 'degree', text: 'b3' }))
assert(gradeAnswer(flatThree, { kind: 'degree', text: 'flat 3' }))
assert(!gradeAnswer(flatThree, { kind: 'degree', text: '3' }))

const aMinorDegree = enumerateCards(
  settings({ tonic: 'A', scaleId: 'natural-minor', modes: ['degree-to-note'], range: 'entire' }),
).find((card) => card.degreeLabel === '♭7')
assert(aMinorDegree?.noteName === 'G', aMinorDegree?.noteName)
assert(aMinorDegree?.prompt === 'What note corresponds to degree ♭7?', aMinorDegree?.prompt)
assert(gradeAnswer(aMinorDegree, { kind: 'note', text: 'G' }))

const leading = enumerateCards(
  settings({ tonic: 'F#', scaleId: 'major', modes: ['degree-to-note'], range: 'entire' }),
).find((card) => card.degreeLabel === '7')
assert(leading?.noteName === 'E♯', leading?.noteName)
assert(gradeAnswer(leading, { kind: 'note', text: 'E#' }))
assert(gradeAnswer(leading, { kind: 'note', text: 'F' }))
assert(!gradeAnswer(leading, { kind: 'note', text: 'F#' }))

const doubleFlat = enumerateCards(
  settings({ tonic: 'Db', scaleId: 'natural-minor', modes: ['degree-to-note'], range: 'entire' }),
).find((card) => card.noteName === 'B♭♭')
assert(doubleFlat, 'D♭ natural minor should ask for B♭♭')
assert(gradeAnswer(doubleFlat, { kind: 'note', text: 'A' }))
assert(gradeAnswer(doubleFlat, { kind: 'note', text: 'Bbb' }))

const openE = enumerateCards(
  settings({ tonic: 'C', scaleId: 'major', modes: ['fret-to-note'], range: 'entire' }),
).find((card) => card.asked?.stringNumber === 1 && card.asked.fret === 0)
assert(openE?.noteName === 'E', openE?.noteName)
assert(gradeAnswer(openE, { kind: 'note', text: 'Fb' }))
assert(gradeAnswer(openE, { kind: 'note', text: 'E' }))

const narrow = enumerateCards(
  settings({
    tonic: 'G',
    scaleId: 'major',
    modes: ['fret-to-note', 'note-to-fret', 'note-to-degree'],
    range: 'custom',
    fretMin: 5,
    fretMax: 7,
    stringNumbers: null,
    shapeId: null,
  }),
)
assert(narrow.length > 0, 'Custom fret range produced nothing')
assert(narrow.every((card) => card.positions.every((position) => position.fret >= 5 && position.fret <= 7)))

const dString = enumerateCards(
  settings({
    tonic: 'G',
    scaleId: 'major',
    modes: ['fret-to-note', 'note-to-degree'],
    range: 'custom',
    fretMin: 0,
    fretMax: 12,
    stringNumbers: [4],
    shapeId: null,
  }),
)
assert(dString.length > 0)
assert(dString.every((card) => card.positions.every((position) => position.stringNumber === 4)))

const gShapes = buildScaleShapes(parsePitchClass('G'))
const shape = gShapes.find((item) => item.id === 1)
const shaped = enumerateCards(
  settings({
    tonic: 'G',
    scaleId: 'major',
    modes: ['fret-to-note'],
    range: 'custom',
    fretMin: 0,
    fretMax: 15,
    stringNumbers: null,
    shapeId: 1,
  }),
)
assert(shaped.length > 0, 'Shape 1 produced no cards')
assert(shaped.every((card) => card.positions.every((position) => shape.frets.includes(position.fret))))

const dropped = GUITAR_STRINGS.map((guitarString) =>
  guitarString.number === 6 ? { ...guitarString, openPitchClass: 2, label: 'D' } : guitarString,
)
const droppedOpen = enumerateCards(
  settings({ tonic: 'C', scaleId: 'major', modes: ['fret-to-note'], range: 'entire' }),
  dropped,
).find((card) => card.asked?.stringNumber === 6 && card.asked.fret === 0)
assert(droppedOpen?.noteName === 'D', `Dropped D open string was ${droppedOpen?.noteName}`)
assert(droppedOpen?.degreeLabel === '2', droppedOpen?.degreeLabel)

const mixed = drawSession(
  settings({
    tonic: 'G',
    scaleId: 'major',
    modes: ['note-to-fret', 'fret-to-note', 'note-to-degree', 'degree-to-note'],
    variations: ['string', 'any'],
    questionCount: 40,
  }),
  40,
  emptyMemory(),
  mulberry32(3),
)
assert(new Set(mixed.map((card) => card.mode)).size === 4, `Mixed modes: ${mixed.map((card) => card.mode).join(',')}`)
assert(mixed.some((card) => card.variation === 'string') && mixed.some((card) => card.variation === 'any'))
assert(mixed.every((card, index) => index === 0 || card.signature !== mixed[index - 1].signature))

const degreeRun = drawSession(
  settings({ tonic: 'G', scaleId: 'major', modes: ['note-to-degree'], questionCount: 12 }),
  12,
  emptyMemory(),
  mulberry32(9),
)
assert(degreeRun.every((card, index) => index === 0 || card.signature !== degreeRun[index - 1].signature))

const weighted = drawSession(
  settings({ tonic: 'G', scaleId: 'major', modes: ['note-to-degree'], prioritizeMisses: true, questionCount: 24 }),
  24,
  { ...emptyMemory(), notes: { 11: 20 } },
  mulberry32(4),
)
const bCount = weighted.filter((card) => card.noteName === 'B').length
assert(bCount >= 10, `Weak-note priority only drew B ${bCount} times`)

assert(scopeError(settings({ modes: [] })) === 'Select at least one exercise.')
assert(
  scopeError(settings({ modes: ['note-to-fret'], variations: [] })) === 'Select a string-and-fret variation.',
)
assert(scopeError(settings({ range: 'custom', fretMin: 10, fretMax: 2 })))
assert(scopeError(settings({ range: 'custom', stringNumbers: [] })) === 'Select at least one string.')
assert(
  scopeError(settings({ tonic: 'C', scaleId: 'major', range: 'custom', fretMin: 0, fretMax: 0, shapeId: 1 })),
)

const normalized = normalizeSettings({
  tonic: 'H',
  scaleId: 'nope',
  modes: ['nope'],
  questionCount: 900,
  fretMin: 9,
  fretMax: 2,
  range: 'custom',
})
assert(normalized.tonic === 'G' && normalized.scaleId === 'major')
assert(normalized.modes.length === 4)
assert(normalized.questionCount === 200)
assert(normalized.fretMin <= normalized.fretMax)
assert(normalizeSettings({ questionCount: null }).questionCount === null)
assert(normalizeDegree('flat 3') === '♭3')
assert(parsePitchClass('B sharp') === 0)
assert(parsePitchClass('C flat') === 11)

assert(shortcutAction(' ') === 'reveal')
assert(shortcutAction('Enter') === 'submit')
assert(shortcutAction('ArrowRight') === 'next')
assert(shortcutAction('1') === 'incorrect')
assert(shortcutAction('2') === 'correct')
assert(shortcutAction('Escape') === 'exit')
assert(shortcutAction('a') === null)
assert(shortcutBlocked({ tagName: 'INPUT' }))
assert(shortcutBlocked({ tagName: 'TEXTAREA' }))
assert(shortcutBlocked({ tagName: 'SELECT' }))
assert(shortcutBlocked({ tagName: 'BUTTON' }))
assert(!shortcutBlocked({ tagName: 'DIV' }))
assert(shortcutBlocked({ tagName: 'DIV', isContentEditable: true }))

const practiceSettings = settings({
  tonic: 'G',
  scaleId: 'major',
  modes: ['note-to-degree'],
  questionCount: 2,
  trackTime: true,
  timeLimitSec: null,
})
const started = startPractice(practiceSettings, emptyMemory(), 0, mulberry32(2))
assert(started.ok, started.ok ? '' : started.error)
let session = started.session
const first = session.cards[0]
session = gradeSession(session, { kind: 'degree', text: 'nope' }, 1500)
assert(session.correct === false)
assert(session.attempts[0].responseMs === 1500)
assert(session.attempts[0].card.noteName === first.noteName)
let stepped = advanceSession(session, 2000)
assert(stepped.type === 'card')
session = gradeSession(stepped.session, { kind: 'degree', text: stepped.session.cards[1].degreeLabel }, 3200)
stepped = advanceSession(session, 4000)
assert(stepped.type === 'summary', stepped.type)
const summary = summarizeAttempts(session.attempts, true)
assert(summary.answered === 2 && summary.correct === 1 && summary.incorrect === 1)
assert(summary.accuracy === 50)
assert(summary.streak === 1)
assert(summary.averageResponseMs === (1500 + 1200) / 2)
assert(summary.byMode['note-to-degree'].accuracy === 50)
assert(summary.missedNotes[0].label === first.noteName)
assert(summary.missedDegrees[0].label === first.degreeLabel)
const remembered = rememberAttempt(emptyMemory(), session.attempts[0])
assert(remembered.notes[String(first.pitchClass)] === 1)
assert(rememberAttempt(remembered, { card: first, correct: true }).notes[String(first.pitchClass)] == null)

const revealed = revealCard(startPractice(practiceSettings, emptyMemory(), 0, mulberry32(2)).session)
assert(revealed.status === 'revealed')
assert(gradeSession(revealed, { kind: 'degree', text: revealed.cards[0].degreeLabel }, 10).status === 'revealed')
const selfGraded = gradeSession(revealed, { kind: 'self', correct: false }, 10)
assert(selfGraded.correct === false)
const review = startReview(missedCards(selfGraded.attempts), practiceSettings, selfGraded.memory, 50)
assert(review.mode === 'review' && review.cards.length === 1)
const reviewed = gradeSession(revealCard(review), { kind: 'self', correct: true }, 80)
assert(advanceSession(reviewed, 90).type === 'summary', advanceSession(reviewed, 90).type)

console.log(`Flashcard trainer checks passed (${checks}).`)
