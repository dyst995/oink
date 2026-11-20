import { mod12, parseKey, type ParsedKey } from '../fretboard-module/theory.ts'

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const LETTER_PITCH = [0, 2, 4, 5, 7, 9, 11] as const

/** Standard tuning MIDI pitches, low E → high e. */
export const OPEN_MIDI = [40, 45, 50, 55, 59, 64] as const

export const MAX_FRET = 24

/** Frets shown on the whole-neck overview (0 = open). */
export const NECK_FRET_COUNT = 22

export const NECK_STRINGS = [
  { number: 1, label: 'e', openMidi: 64 },
  { number: 2, label: 'B', openMidi: 59 },
  { number: 3, label: 'G', openMidi: 55 },
  { number: 4, label: 'D', openMidi: 50 },
  { number: 5, label: 'A', openMidi: 45 },
  { number: 6, label: 'E', openMidi: 40 },
] as const

export type NeckNote = {
  stringNumber: number
  stringLabel: string
  fret: number
  tone: TriadTone
}

export type TriadQualityId = 'major' | 'minor' | 'diminished' | 'augmented'

export type ChordDegreeRole = 'root' | 'third' | 'fifth'

export type InversionId = 'root' | 'first' | 'second'

export type TriadTone = {
  role: ChordDegreeRole
  degreeLabel: string
  semitones: number
  pitchClass: number
  name: string
}

export type TriadQuality = {
  id: TriadQualityId
  label: string
  shortLabel: string
  offsets: readonly [number, number, number]
  degreeLabels: readonly [string, string, string]
  formula: string
}

export type StringSetId = 'gbe' | 'dgb' | 'adg' | 'ead'

export type StringSet = {
  id: StringSetId
  label: string
  /** Guitar string numbers 6=low E … 1=high e, low → high. */
  stringNumbers: readonly [number, number, number]
  openLabels: readonly [string, string, string]
}

export type VoicingNote = {
  stringNumber: number
  stringLabel: string
  fret: number
  midi: number
  tone: TriadTone
}

export type TriadVoicing = {
  inversion: InversionId
  frets: readonly [number, number, number]
  notes: readonly [VoicingNote, VoicingNote, VoicingNote]
  soundingNames: readonly [string, string, string]
  bass: VoicingNote
}

export const TRIAD_QUALITIES: readonly TriadQuality[] = [
  {
    id: 'major',
    label: 'Major',
    shortLabel: 'maj',
    offsets: [0, 4, 7],
    degreeLabels: ['1', '3', '5'],
    formula: '1 – 3 – 5',
  },
  {
    id: 'minor',
    label: 'Minor',
    shortLabel: 'min',
    offsets: [0, 3, 7],
    degreeLabels: ['1', '♭3', '5'],
    formula: '1 – ♭3 – 5',
  },
  {
    id: 'diminished',
    label: 'Diminished',
    shortLabel: 'dim',
    offsets: [0, 3, 6],
    degreeLabels: ['1', '♭3', '♭5'],
    formula: '1 – ♭3 – ♭5',
  },
  {
    id: 'augmented',
    label: 'Augmented',
    shortLabel: 'aug',
    offsets: [0, 4, 8],
    degreeLabels: ['1', '3', '♯5'],
    formula: '1 – 3 – ♯5',
  },
] as const

export const STRING_SETS: readonly StringSet[] = [
  {
    id: 'gbe',
    label: 'G – B – high E',
    stringNumbers: [3, 2, 1],
    openLabels: ['G', 'B', 'e'],
  },
  {
    id: 'dgb',
    label: 'D – G – B',
    stringNumbers: [4, 3, 2],
    openLabels: ['D', 'G', 'B'],
  },
  {
    id: 'adg',
    label: 'A – D – G',
    stringNumbers: [5, 4, 3],
    openLabels: ['A', 'D', 'G'],
  },
  {
    id: 'ead',
    label: 'low E – A – D',
    stringNumbers: [6, 5, 4],
    openLabels: ['E', 'A', 'D'],
  },
] as const

export const ROOT_OPTIONS = [
  'C',
  'C♯',
  'D♭',
  'D',
  'E♭',
  'E',
  'F',
  'F♯',
  'G♭',
  'G',
  'A♭',
  'A',
  'B♭',
  'B',
] as const

export const INVERSION_META: Record<
  InversionId,
  { id: InversionId; label: string; bassRole: ChordDegreeRole; orderLabel: string }
> = {
  root: { id: 'root', label: 'Root position', bassRole: 'root', orderLabel: 'root–third–fifth' },
  first: { id: 'first', label: '1st inversion', bassRole: 'third', orderLabel: 'third–fifth–root' },
  second: {
    id: 'second',
    label: '2nd inversion',
    bassRole: 'fifth',
    orderLabel: 'fifth–root–third',
  },
}

function accidentalGlyph(amount: number): string {
  if (amount === 0) return ''
  if (amount > 0) return '♯'.repeat(amount)
  return '♭'.repeat(-amount)
}

function mod7(value: number): number {
  return ((value % 7) + 7) % 7
}

function spellFromRoot(root: ParsedKey, degree: number, semitones: number): string {
  const letterIndex = mod7(root.letterIndex + ((degree - 1) % 7))
  const letter = LETTERS[letterIndex]
  let diff = mod12(root.pitchClass + semitones) - LETTER_PITCH[letterIndex]
  if (diff > 6) diff -= 12
  if (diff < -6) diff += 12
  return letter + accidentalGlyph(diff)
}

const DEGREE_NUMBER: Record<string, number> = {
  '1': 1,
  '3': 3,
  '♭3': 3,
  '5': 5,
  '♭5': 5,
  '♯5': 5,
}

export function buildTriad(rootInput: string, quality: TriadQuality): TriadTone[] {
  const root = parseKey(rootInput)
  const roles: ChordDegreeRole[] = ['root', 'third', 'fifth']
  return quality.offsets.map((semitones, index) => {
    const degreeLabel = quality.degreeLabels[index]
    const degree = DEGREE_NUMBER[degreeLabel]
    return {
      role: roles[index],
      degreeLabel,
      semitones,
      pitchClass: mod12(root.pitchClass + semitones),
      name: spellFromRoot(root, degree, semitones),
    }
  })
}

export function chordSymbol(rootInput: string, quality: TriadQuality): string {
  const root = parseKey(rootInput)
  if (quality.id === 'major') return root.name
  if (quality.id === 'minor') return `${root.name}m`
  if (quality.id === 'diminished') return `${root.name}dim`
  return `${root.name}aug`
}

export function roleWord(role: ChordDegreeRole): string {
  if (role === 'root') return 'root'
  if (role === 'third') return '3rd'
  return '5th'
}

function openMidiForString(stringNumber: number): number {
  return OPEN_MIDI[6 - stringNumber]
}

function fretsForPitchClass(openMidi: number, pitchClass: number): number[] {
  const openPc = mod12(openMidi)
  const first = mod12(pitchClass - openPc)
  const frets: number[] = []
  for (let fret = first; fret <= MAX_FRET; fret += 12) {
    frets.push(fret)
  }
  return frets
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [items.slice()]
  const result: T[][] = []
  for (let i = 0; i < items.length; i += 1) {
    const rest = items.filter((_, index) => index !== i)
    for (const perm of permutations(rest)) {
      result.push([items[i], ...perm])
    }
  }
  return result
}

function inversionFromBass(role: ChordDegreeRole): InversionId {
  if (role === 'root') return 'root'
  if (role === 'third') return 'first'
  return 'second'
}

function voicingScore(frets: readonly number[]): number {
  const max = Math.max(...frets)
  const sum = frets.reduce((total, fret) => total + fret, 0)
  const span = max - Math.min(...frets)
  return max * 1000 + sum * 10 + span
}

export function findCloseVoicings(
  tones: readonly TriadTone[],
  stringSet: StringSet,
): Record<InversionId, TriadVoicing[]> {
  const buckets: Record<InversionId, TriadVoicing[]> = {
    root: [],
    first: [],
    second: [],
  }

  const opens = stringSet.stringNumbers.map(openMidiForString)
  const assignments = permutations(tones)

  for (const assignment of assignments) {
    const fretChoices = assignment.map((tone, index) =>
      fretsForPitchClass(opens[index], tone.pitchClass).map((fret) => ({
        fret,
        midi: opens[index] + fret,
        tone,
      })),
    )

    for (const a of fretChoices[0]) {
      for (const b of fretChoices[1]) {
        for (const c of fretChoices[2]) {
          const chosen = [a, b, c]
          const midis = chosen.map((note) => note.midi)
          if (!(midis[0] < midis[1] && midis[1] < midis[2])) continue
          if (midis[2] - midis[0] >= 12) continue

          const notes = chosen.map((note, index) => ({
            stringNumber: stringSet.stringNumbers[index],
            stringLabel: stringSet.openLabels[index],
            fret: note.fret,
            midi: note.midi,
            tone: note.tone,
          })) as [VoicingNote, VoicingNote, VoicingNote]

          const frets = notes.map((note) => note.fret) as [number, number, number]
          const inversion = inversionFromBass(notes[0].tone.role)
          buckets[inversion].push({
            inversion,
            frets,
            notes,
            soundingNames: notes.map((note) => note.tone.name) as [string, string, string],
            bass: notes[0],
          })
        }
      }
    }
  }

  for (const key of Object.keys(buckets) as InversionId[]) {
    const seen = new Set<string>()
    buckets[key] = buckets[key]
      .filter((voicing) => {
        const id = voicing.frets.join('-')
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .sort((left, right) => voicingScore(left.frets) - voicingScore(right.frets))
  }

  return buckets
}

export function getStringSet(id: StringSetId): StringSet {
  const found = STRING_SETS.find((set) => set.id === id)
  if (!found) throw new Error(`Unknown string set: ${id}`)
  return found
}

export function getQuality(id: TriadQualityId): TriadQuality {
  const found = TRIAD_QUALITIES.find((quality) => quality.id === id)
  if (!found) throw new Error(`Unknown quality: ${id}`)
  return found
}

export function fretWindow(voicing: TriadVoicing, pad = 1): { from: number; to: number } {
  const min = Math.min(...voicing.frets)
  const max = Math.max(...voicing.frets)
  const from = Math.max(0, min - pad)
  const to = Math.min(MAX_FRET, Math.max(max + pad, from + 4))
  return { from, to }
}

export function neckNotesForTriad(tones: readonly TriadTone[]): NeckNote[] {
  const byPitch = new Map(tones.map((tone) => [tone.pitchClass, tone]))
  const notes: NeckNote[] = []

  for (const string of NECK_STRINGS) {
    for (let fret = 0; fret <= NECK_FRET_COUNT; fret += 1) {
      const tone = byPitch.get(mod12(string.openMidi + fret))
      if (!tone) continue
      notes.push({
        stringNumber: string.number,
        stringLabel: string.label,
        fret,
        tone,
      })
    }
  }

  return notes
}

/** Close voicings on the neck overview for the given string sets (frets 0–NECK_FRET_COUNT). */
export function neckVoicings(
  tones: readonly TriadTone[],
  stringSets: readonly StringSet[],
): Array<TriadVoicing & { stringSetId: StringSetId }> {
  const results: Array<TriadVoicing & { stringSetId: StringSetId }> = []

  for (const stringSet of stringSets) {
    const buckets = findCloseVoicings(tones, stringSet)
    for (const inversion of Object.keys(buckets) as InversionId[]) {
      for (const voicing of buckets[inversion]) {
        if (Math.max(...voicing.frets) > NECK_FRET_COUNT) continue
        results.push({ ...voicing, stringSetId: stringSet.id })
      }
    }
  }

  return results.sort((left, right) => voicingScore(left.frets) - voicingScore(right.frets))
}

export function shortDegreeLabel(tone: TriadTone): string {
  if (tone.role === 'root') return '1'
  return tone.degreeLabel
}
