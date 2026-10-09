import {
  GUITAR_STRINGS,
  mod12,
  pitchClassAt,
  type GuitarString,
} from '../fretboard-module/theory.ts'

/** Pitch-class labels used throughout the trainer (sharps). */
export const NOTE_NAMES = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
] as const

export type NoteName = (typeof NOTE_NAMES)[number]

export type NeckPosition = {
  stringNumber: number
  stringLabel: string
  fret: number
  pitchClass: number
  note: NoteName
}

export const TRAINER_STRINGS: readonly GuitarString[] = GUITAR_STRINGS

export const TRAINER_FRET_MAX = 12

export function noteNameFromPitchClass(pitchClass: number): NoteName {
  return NOTE_NAMES[mod12(pitchClass)]
}

export function normalizeNoteInput(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/♯/g, '#')
    .replace(/♭/g, 'B')
    .replace(/^([A-G])B$/, (_, letter: string) => {
      // Cb → B, Db → C#, etc. handled below via enharmonic map
      return `${letter}B`
    })
    .replace(/\s+/g, '')
}

const ENHARMONIC_TO_SHARP: Record<string, NoteName> = {
  C: 'C',
  'C#': 'C♯',
  DB: 'C♯',
  D: 'D',
  'D#': 'D♯',
  EB: 'D♯',
  E: 'E',
  FB: 'E',
  F: 'F',
  'E#': 'F',
  'F#': 'F♯',
  GB: 'F♯',
  G: 'G',
  'G#': 'G♯',
  AB: 'G♯',
  A: 'A',
  'A#': 'A♯',
  BB: 'A♯',
  B: 'B',
  CB: 'B',
  'B#': 'C',
}

export function parseNoteAnswer(input: string): NoteName | null {
  const normalized = normalizeNoteInput(input)
  return ENHARMONIC_TO_SHARP[normalized] ?? null
}

export function positionAt(stringNumber: number, fret: number): NeckPosition | null {
  const guitarString = TRAINER_STRINGS.find((item) => item.number === stringNumber)
  if (!guitarString) return null
  if (fret < 0 || fret > TRAINER_FRET_MAX) return null
  const pitchClass = pitchClassAt(guitarString.openPitchClass, fret)
  return {
    stringNumber,
    stringLabel: guitarString.label,
    fret,
    pitchClass,
    note: noteNameFromPitchClass(pitchClass),
  }
}

export function allPositions(options: {
  strings?: readonly number[]
  fretMin?: number
  fretMax?: number
  notes?: readonly NoteName[]
}): NeckPosition[] {
  const stringFilter = options.strings?.length ? new Set(options.strings) : null
  const noteFilter = options.notes?.length ? new Set(options.notes) : null
  const fretMin = options.fretMin ?? 0
  const fretMax = options.fretMax ?? TRAINER_FRET_MAX
  const positions: NeckPosition[] = []

  for (const guitarString of TRAINER_STRINGS) {
    if (stringFilter && !stringFilter.has(guitarString.number)) continue
    for (let fret = fretMin; fret <= fretMax; fret += 1) {
      const pitchClass = pitchClassAt(guitarString.openPitchClass, fret)
      const note = noteNameFromPitchClass(pitchClass)
      if (noteFilter && !noteFilter.has(note)) continue
      positions.push({
        stringNumber: guitarString.number,
        stringLabel: guitarString.label,
        fret,
        pitchClass,
        note,
      })
    }
  }

  return positions
}

export function occurrencesOf(
  note: NoteName,
  options: {
    strings?: readonly number[]
    fretMin?: number
    fretMax?: number
  },
): NeckPosition[] {
  return allPositions({ ...options, notes: [note] })
}

export function positionKey(position: Pick<NeckPosition, 'stringNumber' | 'fret'>): string {
  return `${position.stringNumber}:${position.fret}`
}

export function describePosition(position: Pick<NeckPosition, 'stringNumber' | 'stringLabel' | 'fret'>): string {
  const fretLabel = position.fret === 0 ? 'open' : `fret ${position.fret}`
  return `${position.stringNumber}${ordinalSuffix(position.stringNumber)} string (${position.stringLabel}), ${fretLabel}`
}

function ordinalSuffix(value: number): string {
  const mod100 = value % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (value % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
