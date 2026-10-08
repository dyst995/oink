import { FRET_COUNT, mod12 } from './theory.ts'

/** Low E open pitch class (string 6). */
const LOW_E = 4

/**
 * Five movable box shapes (CAGED-style), relative to the root on the low E string.
 * Matches common position layouts such as those on guitarscale.org for major scales.
 */
const SHAPE_OFFSETS = [
  { id: 1, delta: -1, caged: 'E' },
  { id: 2, delta: 2, caged: 'D' },
  { id: 3, delta: 4, caged: 'C' },
  { id: 4, delta: -6, caged: 'A' },
  { id: 5, delta: -4, caged: 'G' },
] as const

const SHAPE_SPAN = 4

export type ScaleShape = {
  id: number
  label: string
  caged: string
  /** Fret where the box begins. */
  startFret: number
  positionLabel: string
  /** Contiguous frets belonging to this shape on the extended neck. */
  frets: number[]
}

function ordinal(n: number): string {
  if (n === 0) return 'Open'
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

/** Contiguous frets for a shape — never wraps; uses frets past 12 when needed. */
function fretsForWindow(startFret: number): number[] {
  const frets: number[] = []
  for (let offset = 0; offset < SHAPE_SPAN; offset += 1) {
    const absolute = startFret + offset
    if (absolute <= FRET_COUNT) frets.push(absolute)
  }
  return frets
}

/**
 * Choose a start fret on the extended neck.
 * Windows never wrap: a start at 11 becomes frets 11–14 instead of 11–12 + 1–2.
 */
function shapeStartFret(rootOnLowE: number, delta: number): number {
  const raw = rootOnLowE + delta
  let start = mod12(raw)
  if (start === 0 && raw !== 0) start = 12
  if (start + SHAPE_SPAN - 1 > FRET_COUNT) {
    return Math.max(0, FRET_COUNT - SHAPE_SPAN + 1)
  }
  return start
}

export function buildScaleShapes(rootPitchClass: number): ScaleShape[] {
  const rootOnLowE = mod12(rootPitchClass - LOW_E)

  return SHAPE_OFFSETS.map((spec) => {
    const startFret = shapeStartFret(rootOnLowE, spec.delta)
    return {
      id: spec.id,
      label: `Shape ${spec.id}`,
      caged: spec.caged,
      startFret,
      positionLabel: `${ordinal(startFret)} position`,
      frets: fretsForWindow(startFret),
    }
  }).sort((a, b) => a.id - b.id)
}

/**
 * Pick the best shape for a fret. Prefer the shape whose window contains the fret
 * with the smallest distance from that shape's start (handles overlaps cleanly).
 */
export function shapeForFret(fret: number, shapes: readonly ScaleShape[]): ScaleShape | null {
  let best: { shape: ScaleShape; distance: number } | null = null

  for (const shape of shapes) {
    if (!shape.frets.includes(fret)) continue
    const distance = shape.frets.indexOf(fret)
    if (!best || distance < best.distance || (distance === best.distance && shape.id < best.shape.id)) {
      best = { shape, distance }
    }
  }

  return best?.shape ?? null
}

export function shapesContainingFret(fret: number, shapes: readonly ScaleShape[]): ScaleShape[] {
  return shapes.filter((shape) => shape.frets.includes(fret))
}

export type ShapeRegion = {
  from: number
  to: number
}

/** Contiguous fret spans for drawing boxes. */
export function shapeRegions(frets: readonly number[]): ShapeRegion[] {
  if (frets.length === 0) return []
  const sorted = [...frets].sort((a, b) => a - b)
  const regions: ShapeRegion[] = []
  let from = sorted[0]
  let prev = sorted[0]

  for (let index = 1; index < sorted.length; index += 1) {
    const fret = sorted[index]
    if (fret === prev + 1) {
      prev = fret
      continue
    }
    regions.push({ from, to: prev })
    from = fret
    prev = fret
  }
  regions.push({ from, to: prev })
  return regions
}

/** Left edge of a fret column inside `.neck` (fret 0 = open). */
export function fretColumnLeft(fret: number): string {
  if (fret <= 0) return '0px'
  return `calc(var(--open-w) + (100% - var(--open-w)) * ${(fret - 1) / FRET_COUNT})`
}

/** Width covering inclusive frets from–to inside `.neck`. */
export function fretColumnWidth(from: number, to: number): string {
  if (from <= 0) {
    if (to <= 0) return 'var(--open-w)'
    return `calc(var(--open-w) + (100% - var(--open-w)) * ${to} / ${FRET_COUNT})`
  }
  const count = to - from + 1
  return `calc((100% - var(--open-w)) * ${count} / ${FRET_COUNT})`
}
