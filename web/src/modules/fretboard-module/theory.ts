const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

const LETTER_PITCH = [0, 2, 4, 5, 7, 9, 11]

/** Semitones above the root for an unaltered scale degree (1–13). */
const MAJOR_SEMITONES: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
  8: 12,
  9: 14,
  10: 16,
  11: 17,
  12: 19,
  13: 21,
}

type Spelling = {
  degree: number
  label: string
}

const SHARP_SPELLING: Spelling[] = [
  { degree: 1, label: '1' },
  { degree: 2, label: '♭2' },
  { degree: 2, label: '2' },
  { degree: 3, label: '♭3' },
  { degree: 3, label: '3' },
  { degree: 4, label: '4' },
  { degree: 4, label: '♯4' },
  { degree: 5, label: '5' },
  { degree: 6, label: '♭6' },
  { degree: 6, label: '6' },
  { degree: 7, label: '♭7' },
  { degree: 7, label: '7' },
]

const FLAT_SPELLING: Spelling[] = [
  { degree: 1, label: '1' },
  { degree: 2, label: '♭2' },
  { degree: 2, label: '2' },
  { degree: 3, label: '♭3' },
  { degree: 3, label: '3' },
  { degree: 4, label: '4' },
  { degree: 5, label: '♭5' },
  { degree: 5, label: '5' },
  { degree: 6, label: '♭6' },
  { degree: 6, label: '6' },
  { degree: 7, label: '♭7' },
  { degree: 7, label: '7' },
]

export type FormulaKind = 'degrees' | 'steps' | 'offsets'

export type FormulaTone = {
  degreeLabel: string
  /** Interval size in semitones, wrapped into one octave. */
  semitones: number
  pitchClass: number
  name: string
  isRoot: boolean
}

export type ParsedKey = {
  name: string
  letter: (typeof LETTERS)[number]
  letterIndex: number
  accidental: number
  pitchClass: number
}

export type ParsedFormula = {
  kind: FormulaKind
  tones: FormulaTone[]
}

export type GuitarString = {
  id: string
  label: string
  openPitchClass: number
}

export const KEY_OPTIONS = [
  'C',
  'C#',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const

export const FORMULA_PRESETS = [
  { id: 'major', label: 'Major', formula: '1 2 3 4 5 6 7' },
  { id: 'natural-minor', label: 'Natural minor', formula: '1 2 b3 4 5 b6 b7' },
  { id: 'harmonic-minor', label: 'Harmonic minor', formula: '1 2 b3 4 5 b6 7' },
  { id: 'melodic-minor', label: 'Melodic minor', formula: '1 2 b3 4 5 6 7' },
  { id: 'dorian', label: 'Dorian', formula: '1 2 b3 4 5 6 b7' },
  { id: 'mixolydian', label: 'Mixolydian', formula: '1 2 3 4 5 6 b7' },
  { id: 'lydian', label: 'Lydian', formula: '1 2 3 #4 5 6 7' },
  { id: 'major-pentatonic', label: 'Major pentatonic', formula: '1 2 3 5 6' },
  { id: 'minor-pentatonic', label: 'Minor pentatonic', formula: '1 b3 4 5 b7' },
  { id: 'major-triad', label: 'Major triad', formula: '1 3 5' },
  { id: 'minor-triad', label: 'Minor triad', formula: '1 b3 5' },
  { id: 'dominant-7', label: 'Dominant 7', formula: '1 3 5 b7' },
  { id: 'major-steps', label: 'Major steps', formula: '2-2-1-2-2-2-1' },
] as const

/** High string first, the view looking down at a guitar in standard tuning. */
export const GUITAR_STRINGS: readonly GuitarString[] = [
  { id: '1', label: 'e', openPitchClass: 4 },
  { id: '2', label: 'B', openPitchClass: 11 },
  { id: '3', label: 'G', openPitchClass: 7 },
  { id: '4', label: 'D', openPitchClass: 2 },
  { id: '5', label: 'A', openPitchClass: 9 },
  { id: '6', label: 'E', openPitchClass: 4 },
]

export const FRET_COUNT = 12

const SINGLE_INLAY_FRETS = [3, 5, 7, 9] as const

export const INLAY_FRETS = {
  single: SINGLE_INLAY_FRETS,
  double: 12,
} as const

export function mod12(value: number): number {
  return ((value % 12) + 12) % 12
}

export function pitchClassAt(openPitchClass: number, fret: number): number {
  return mod12(openPitchClass + fret)
}

function accidentalGlyph(amount: number): string {
  if (amount === 0) return ''
  if (amount > 0) return '♯'.repeat(amount)
  return '♭'.repeat(-amount)
}

export function parseKey(input: string): ParsedKey {
  const normalized = input.trim().replace(/♭/g, 'b').replace(/♯/g, '#')
  const match = normalized.match(/^([A-Ga-g])(bb|##|b|#)?$/)
  if (!match) {
    throw new Error('Use a key like C, F#, or Bb.')
  }

  const letter = match[1].toUpperCase() as ParsedKey['letter']
  const accidentalToken = match[2] ?? ''
  const accidental =
    accidentalToken === 'bb'
      ? -2
      : accidentalToken === 'b'
        ? -1
        : accidentalToken === '#'
          ? 1
          : accidentalToken === '##'
            ? 2
            : 0
  const letterIndex = LETTERS.indexOf(letter)

  return {
    name: letter + accidentalGlyph(accidental),
    letter,
    letterIndex,
    accidental,
    pitchClass: mod12(LETTER_PITCH[letterIndex] + accidental),
  }
}

export function normalizeFormula(input: string): string {
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

function tokenizeFormula(input: string): string[] {
  return normalizeFormula(input)
    .split(/[\s]+/)
    .flatMap((chunk) => chunk.split('-'))
    .map((token) => token.trim())
    .filter(Boolean)
}

function prefersFlats(root: ParsedKey): boolean {
  return root.accidental < 0 || (root.letter === 'F' && root.accidental === 0)
}

function spell(root: ParsedKey, degree: number, semitones: number): string {
  const letterIndex = mod7(root.letterIndex + ((degree - 1) % 7))
  const letter = LETTERS[letterIndex]
  let diff = mod12(root.pitchClass + semitones) - LETTER_PITCH[letterIndex]
  if (diff > 6) diff -= 12
  if (diff < -6) diff += 12
  return letter + accidentalGlyph(diff)
}

function mod7(value: number): number {
  return ((value % 7) + 7) % 7
}

function toneFromDegree(
  root: ParsedKey,
  degree: number,
  alter: number,
  degreeLabel: string,
): FormulaTone {
  const semitones = MAJOR_SEMITONES[degree] + alter
  return {
    degreeLabel,
    semitones: mod12(semitones),
    pitchClass: mod12(root.pitchClass + semitones),
    name: spell(root, degree, semitones),
    isRoot: alter === 0 && (degree === 1 || degree === 8),
  }
}

function toneFromSemitone(root: ParsedKey, semitones: number): FormulaTone {
  const wrapped = mod12(semitones)
  const spec = (prefersFlats(root) ? FLAT_SPELLING : SHARP_SPELLING)[wrapped]
  return {
    degreeLabel: spec.label,
    semitones: wrapped,
    pitchClass: mod12(root.pitchClass + wrapped),
    name: spell(root, spec.degree, wrapped),
    isRoot: wrapped === 0,
  }
}

function parseDegreeToken(token: string): { degree: number; alter: number; label: string } {
  if (token === 'r') {
    return { degree: 1, alter: 0, label: '1' }
  }

  const match = token.match(/^(bb|##|b|#)?(1[0-3]|[1-9])(bb|##|b|#)?$/)
  if (!match || (match[1] && match[3])) {
    throw new Error(
      `Can't read “${token}”. Use degrees like 1, b3, #4, or steps like 2-2-1-2-2-2-1.`,
    )
  }

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
  const label = `${accidentalGlyph(alter)}${degree}`
  return { degree, alter, label }
}

function parseDegrees(tokens: string[], root: ParsedKey): FormulaTone[] {
  return tokens.map((token) => {
    const parsed = parseDegreeToken(token)
    return toneFromDegree(root, parsed.degree, parsed.alter, parsed.label)
  })
}

function parseSteps(steps: number[], root: ParsedKey): FormulaTone[] {
  const tones = [toneFromSemitone(root, 0)]
  let cursor = 0
  for (const step of steps) {
    cursor += step
    tones.push(toneFromSemitone(root, cursor))
  }
  return tones
}

function parseOffsets(offsets: number[], root: ParsedKey): FormulaTone[] {
  return offsets.map((offset) => toneFromSemitone(root, offset))
}

function dedupe(tones: FormulaTone[]): FormulaTone[] {
  const seen = new Set<number>()
  const unique: FormulaTone[] = []
  for (const tone of tones) {
    if (seen.has(tone.pitchClass)) continue
    seen.add(tone.pitchClass)
    unique.push(tone)
  }
  if (unique.length === 0) {
    throw new Error('That formula does not include any notes.')
  }
  return unique
}

function isStrictlyIncreasing(values: number[]): boolean {
  return values.every((value, index) => index === 0 || value > values[index - 1])
}

function classify(input: string, tokens: string[]): FormulaKind {
  const allIntegers = tokens.every((token) => /^\d+$/.test(token))
  if (!allIntegers) return 'degrees'

  const values = tokens.map(Number)
  if (values.some((value) => value === 0)) return 'offsets'
  if (values.length === 1) return 'degrees'
  if (values[0] === 1 && isStrictlyIncreasing(values)) return 'degrees'
  if (values.every((value) => value >= 1 && value <= 4)) return 'steps'
  if (input.includes('-') && values.every((value) => value >= 1 && value <= 12)) return 'steps'
  return 'degrees'
}

export function parseFormula(input: string, root: ParsedKey): ParsedFormula {
  const tokens = tokenizeFormula(input)
  if (tokens.length === 0) {
    throw new Error('Enter an interval formula.')
  }

  const kind = classify(normalizeFormula(input), tokens)
  const tones =
    kind === 'offsets'
      ? parseOffsets(tokens.map(Number), root)
      : kind === 'steps'
        ? parseSteps(tokens.map(Number), root)
        : parseDegrees(tokens, root)

  return { kind, tones: dedupe(tones) }
}

export function formulaKindLabel(kind: FormulaKind): string {
  if (kind === 'steps') return 'semitone steps from the root'
  if (kind === 'offsets') return 'semitone offsets from the root'
  return 'scale degrees'
}
