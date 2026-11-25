import {
  beatTicks,
  beatsPerBar,
  durationName,
  type SubdivisionParts,
  type TimeSignature,
} from './duration.ts'

export type AccentState = 'accent' | 'normal' | 'silent'

export function defaultAccentMap(
  signature: TimeSignature,
  parts: number,
  accentFirst: boolean,
  subdivisionAudible: boolean,
): AccentState[] {
  const beats = beatsPerBar(signature)
  const slots = beats * parts
  return Array.from({ length: slots }, (_, index) => {
    const onBeat = index % parts === 0
    if (!onBeat && !subdivisionAudible) return 'silent'
    if (index === 0 && accentFirst) return 'accent'
    return 'normal'
  })
}

export function cycleAccent(state: AccentState): AccentState {
  if (state === 'accent') return 'normal'
  if (state === 'normal') return 'silent'
  return 'accent'
}

export function syllables(beats: number, parts: number, beatSize: number): string[] {
  const inner = innerSyllables(parts, beatSize)
  const labels: string[] = []
  for (let beat = 1; beat <= beats; beat += 1) {
    for (let part = 0; part < parts; part += 1) {
      labels.push(part === 0 ? String(beat) : (inner[part] ?? '·'))
    }
  }
  return labels
}

function innerSyllables(parts: number, beatSize: number): string[] {
  if (parts === 2) return ['1', '&']
  if (parts === 3 && beatSize === 360) return ['1', '&', 'a']
  if (parts === 3) return ['1', 'la', 'li']
  if (parts === 4) return ['1', 'e', '&', 'a']
  if (parts === 5) return ['1', 'ta', 'ka', 'ta', 'ma']
  if (parts === 6) return ['1', 'ta', 'la', 'ta', 'li', 'ta']
  if (parts === 8) return ['1', 'ti', 'e', 'ti', '&', 'ti', 'a', 'ti']
  return ['1']
}

/** Alternate picking is guidance for even divisions, not a rule of the rhythm. */
export function pickingDirections(parts: number): string[] | null {
  if (parts === 1) return ['D']
  if (parts === 2 || parts === 4 || parts === 6 || parts === 8) {
    return Array.from({ length: parts }, (_, index) => (index % 2 === 0 ? 'D' : 'U'))
  }
  if (parts === 3) return ['D', 'M', 'U']
  return null
}

export function notesPerBeat(parts: number): number {
  return parts
}

export function notesPerBar(signature: TimeSignature, parts: number): number {
  return beatsPerBar(signature) * parts
}

export function gridCaption(signature: TimeSignature, parts: number): string {
  const beat = beatTicks(signature)
  const name = durationName(beat) ?? 'beat'
  return `${parts} ${parts === 1 ? 'note' : 'notes'} per ${name}`
}

export const TRANSITION_PRESETS: { id: string; label: string; parts: SubdivisionParts[] }[] = [
  { id: 'q-8', label: 'Quarter → eighth', parts: [1, 2] },
  { id: '8-16', label: 'Eighth → sixteenth', parts: [2, 4] },
  { id: 'q-16', label: 'Quarter → sixteenth', parts: [1, 4] },
  { id: 'q-8-16', label: 'Quarter → eighth → sixteenth', parts: [1, 2, 4] },
  { id: '16-8-q', label: 'Sixteenth → eighth → quarter', parts: [4, 2, 1] },
  { id: 'q-8-16-8', label: 'Quarter → eighth → sixteenth → eighth', parts: [1, 2, 4, 2] },
  { id: 'random', label: 'Random subdivision transitions', parts: [] },
]

export type SubdivisionInterval = {
  unit: 'beat' | 'bar'
  count: number
}

export function intervalBeats(interval: SubdivisionInterval, beats: number): number {
  const size = interval.unit === 'bar' ? beats * Math.max(1, interval.count) : Math.max(1, interval.count)
  return size
}
