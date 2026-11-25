import { barTicks, beatTicks, isDottedTicks, type TimeSignature } from './theory/duration.ts'
import { patternWords, type RhythmNote, type RhythmPattern } from './theory/pattern.ts'

type StaffProps = {
  signature: TimeSignature
  notes: RhythmNote[]
  bars?: number
  activeTick?: number | null
}

const LINE = 8
const TOP = 28

export function StaffNotation({ signature, notes, bars, activeTick = null }: StaffProps) {
  const barCount = bars ?? Math.max(1, Math.ceil((notes.at(-1)?.start ?? 0) / barTicks(signature) + 0.001))
  const size = barTicks(signature)
  const beat = beatTicks(signature)
  const barWidth = 232
  const left = 58
  const width = left + barCount * barWidth + 12
  const glyphs = notes.map((note) => {
    const bar = Math.floor(note.start / size)
    const into = note.start % size
    return {
      ...note,
      bar,
      x: left + bar * barWidth + (into / size) * (barWidth - 28) + 16,
      beat: Math.floor(note.start / beat),
    }
  })
  return (
    <svg className="rh-staff" viewBox={`0 0 ${width} 118`} role="img" aria-label={patternWords({ signature, bars: barCount, notes })}>
      <Clef />
      <text x="34" y="48" className="rh-meter-num">{signature.numerator}</text>
      <text x="34" y="64" className="rh-meter-num">{signature.denominator}</text>
      {Array.from({ length: barCount }, (_, bar) => {
        const x = left + bar * barWidth
        return (
          <g key={bar}>
            {Array.from({ length: 5 }, (_, line) => (
              <line key={line} x1={x} x2={x + barWidth - 8} y1={TOP + line * LINE} y2={TOP + line * LINE} className="rh-staff-line" />
            ))}
            <line x1={x + barWidth - 8} x2={x + barWidth - 8} y1={TOP} y2={TOP + 4 * LINE} className="rh-barline" />
          </g>
        )
      })}
      {glyphs.map((note, index) => (
        <NoteGlyph
          key={`${note.start}-${index}`}
          note={note}
          x={note.x}
          previousX={note.tied ? glyphs[index - 1]?.x ?? null : null}
          active={activeTick !== null && activeTick >= note.start && activeTick < note.start + note.ticks}
          beamed={beamedWith(glyphs, index)}
        />
      ))}
      {beamSpans(glyphs).map((span) => (
        <g key={`${span.x1}-${span.x2}`}>
          <line x1={span.x1} x2={span.x2} y1={TOP + 2 * LINE - 26} y2={TOP + 2 * LINE - 26} className="rh-beam" />
          {span.second ? <line x1={span.x1} x2={span.x2} y1={TOP + 2 * LINE - 20} y2={TOP + 2 * LINE - 20} className="rh-beam" /> : null}
        </g>
      ))}
      <TupletMarks glyphs={glyphs} beat={beat} />
    </svg>
  )
}

export function patternToStaff(pattern: RhythmPattern, activeTick?: number | null) {
  return <StaffNotation signature={pattern.signature} notes={pattern.notes} bars={pattern.bars} activeTick={activeTick} />
}

function Clef() {
  return (
    <path
      d="M22 78c2-14 8-22 8-32 0-8-4-12-8-12-6 0-8 6-6 12 2 8-2 14-8 16 8 2 12 8 14 16"
      className="rh-clef"
      fill="none"
    />
  )
}

function NoteGlyph({
  note,
  x,
  previousX,
  active,
  beamed,
}: {
  note: RhythmNote
  x: number
  previousX: number | null
  active: boolean
  beamed: boolean
}) {
  const y = TOP + 2 * LINE
  const open = note.ticks >= 480
  const stem = note.ticks < 960 && !note.rest
  const flags = !beamed && note.ticks <= 180 ? (note.ticks <= 90 ? 2 : 1) : 0
  return (
    <g className={active ? 'rh-glyph is-active' : 'rh-glyph'}>
      {note.rest ? (
        <Rest ticks={note.ticks} x={x} />
      ) : (
        <>
          <ellipse cx={x} cy={y} rx="5.2" ry="3.6" className={open ? 'rh-head is-open' : 'rh-head'} />
          {stem ? <line x1={x + 5} x2={x + 5} y1={y} y2={y - 26} className="rh-stem" /> : null}
          {Array.from({ length: flags }, (_, flag) => (
            <path key={flag} d={`M${x + 5} ${y - 26 + flag * 6} q8 4 4 10`} className="rh-flag" />
          ))}
          {isDottedTicks(note.ticks) ? <circle cx={x + 10} cy={y - 2} r="1.5" className="rh-dot" /> : null}
          {note.accent ? <path d={`M${x - 6} ${y - 32} l6 4 l6-4`} className="rh-accent-mark" /> : null}
        </>
      )}
      {previousX !== null ? (
        <path d={`M${previousX + 6} ${y + 8} Q${(previousX + x) / 2} ${y + 16} ${x - 6} ${y + 8}`} className="rh-tie" />
      ) : null}
    </g>
  )
}

function Rest({ ticks, x }: { ticks: number; x: number }) {
  if (ticks >= 960) return <rect x={x - 6} y={TOP + LINE} width="12" height="5" className="rh-rest" />
  if (ticks >= 480) return <rect x={x - 6} y={TOP + 2 * LINE} width="12" height="5" className="rh-rest" />
  if (ticks >= 240) return <path d={`M${x} ${TOP + 4} l4 6 l-4 6 l4 6 l-4 8`} className="rh-rest-line" />
  if (ticks >= 120) return <path d={`M${x + 2} ${TOP + 10} q-8 8-2 14 q8 2 2 8`} className="rh-rest-line" />
  return <path d={`M${x + 2} ${TOP + 6} q-8 8-2 12 q8 2 2 7 m-2 2 q-8 6-2 10`} className="rh-rest-line" />
}

function beamSpans(glyphs: { x: number; beat: number; ticks: number; rest: boolean; start: number }[]) {
  const spans: { x1: number; x2: number; second: boolean }[] = []
  let group: typeof glyphs = []
  function flush() {
    if (group.length >= 2) {
      spans.push({
        x1: (group[0]?.x ?? 0) + 5,
        x2: (group.at(-1)?.x ?? 0) + 5,
        second: group.some((note) => note.ticks <= 90),
      })
    }
    group = []
  }
  for (const note of glyphs) {
    const joins = group.length > 0 && !note.rest && note.ticks <= 120 && note.beat === group[0]?.beat && group.at(-1)!.start + group.at(-1)!.ticks === note.start
    if (!joins) flush()
    if (!note.rest && note.ticks <= 120) group.push(note)
  }
  flush()
  return spans
}

function beamedWith(glyphs: { beat: number; ticks: number; rest: boolean; start: number }[], index: number): boolean {
  const note = glyphs[index]
  if (!note || note.rest || note.ticks > 120) return false
  const previous = glyphs[index - 1]
  const next = glyphs[index + 1]
  const withPrevious = previous && !previous.rest && previous.ticks <= 120 && previous.beat === note.beat && previous.start + previous.ticks === note.start
  const withNext = next && !next.rest && next.ticks <= 120 && next.beat === note.beat && note.start + note.ticks === next.start
  return Boolean(withPrevious || withNext)
}

function TupletMarks({
  glyphs,
  beat,
}: {
  glyphs: { x: number; start: number; ticks: number; rest: boolean; beat: number }[]
  beat: number
}) {
  const groups: { x1: number; x2: number; label: string }[] = []
  let bucket: typeof glyphs = []
  function flush() {
    if (bucket.length >= 3 && bucket.every((note) => note.ticks === bucket[0]?.ticks && note.ticks === 80)) {
      groups.push({ x1: bucket[0]?.x ?? 0, x2: bucket.at(-1)?.x ?? 0, label: '3' })
    }
    bucket = []
  }
  for (const note of glyphs) {
    const same = bucket.length && bucket[0]?.beat === note.beat && !note.rest && note.ticks * bucket.length < beat
    if (!same) flush()
    if (!note.rest && note.ticks === 80) bucket.push(note)
    else flush()
  }
  flush()
  return (
    <g>
      {groups.map((group) => (
        <text key={`${group.x1}-${group.x2}`} x={(group.x1 + group.x2) / 2} y={TOP - 8} textAnchor="middle" className="rh-tuplet">
          {group.label}
        </text>
      ))}
    </g>
  )
}
