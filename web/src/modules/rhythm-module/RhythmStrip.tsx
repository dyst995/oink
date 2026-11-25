import { barTicks } from './theory/duration.ts'
import { durationIdForTicks } from './theory/duration.ts'
import type { RhythmPattern } from './theory/pattern.ts'

type StripProps = {
  pattern: RhythmPattern
  selectedStart: number | null
  activeTick?: number | null
  onSelect: (start: number) => void
}

export function RhythmStrip({ pattern, selectedStart, activeTick = null, onSelect }: StripProps) {
  const size = barTicks(pattern.signature)
  return (
    <div className="rh-bars">
      {Array.from({ length: pattern.bars }, (_, bar) => {
        const origin = bar * size
        const notes = pattern.notes.filter((note) => note.start >= origin && note.start < origin + size)
        return (
          <div key={bar} className="rh-bar" aria-label={`Bar ${bar + 1}`}>
            {notes.map((note) => {
              const active = activeTick !== null && activeTick >= note.start && activeTick < note.start + note.ticks
              const className = [
                'rh-block',
                note.rest ? 'is-rest' : '',
                note.accent ? 'is-accent' : '',
                note.tied ? 'is-tied' : '',
                note.start === selectedStart ? 'is-selected' : '',
                active ? 'is-now' : '',
              ].filter(Boolean).join(' ')
              return (
                <button
                  key={note.start}
                  type="button"
                  className={className}
                  style={{ width: `${(note.ticks / size) * 100}%` }}
                  onClick={() => onSelect(note.start)}
                >
                  <span className="rh-attack" aria-hidden="true" />
                  <span>{note.rest ? 'Rest' : durationIdForTicks(note.ticks) ?? 'Note'}</span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
