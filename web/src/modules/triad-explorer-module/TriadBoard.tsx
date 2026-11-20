import type { CSSProperties } from 'react'
import { fretWindow, type TriadVoicing } from './theory.ts'

type TriadBoardProps = {
  voicing: TriadVoicing
  /** Low → high */
  stringLabels: readonly [string, string, string]
}

export function TriadBoard({ voicing, stringLabels }: TriadBoardProps) {
  const { from, to } = fretWindow(voicing, 1)
  const frets = Array.from({ length: to - from + 1 }, (_, index) => from + index)
  const noteByString = new Map(voicing.notes.map((note) => [note.stringLabel, note]))
  const displayStrings = [...stringLabels].reverse()
  const columns = {
    '--triad-cols': `28px repeat(${frets.length}, minmax(34px, 1fr))`,
  } as CSSProperties

  return (
    <div
      className="triad-board"
      style={columns}
      role="img"
      aria-label={diagramLabel(voicing, stringLabels)}
    >
      <div className="triad-board-row triad-fret-numbers" aria-hidden="true">
        <span />
        {frets.map((fret) => (
          <span key={fret} className="triad-fret-number">
            {fret}
          </span>
        ))}
      </div>

      {displayStrings.map((label) => {
        const note = noteByString.get(label)
        return (
          <div key={label} className="triad-board-row triad-string-row">
            <span className="triad-string-label">{label}</span>
            {frets.map((fret) => {
              const active = note?.fret === fret
              const isBass = Boolean(active && note && note.midi === voicing.bass.midi)
              return (
                <div
                  key={fret}
                  className={fret === 0 ? 'triad-fret triad-fret-open' : 'triad-fret'}
                >
                  <span className="triad-string-wire" aria-hidden="true" />
                  {active && note ? (
                    <span
                      className={[
                        'triad-dot',
                        `triad-dot-${note.tone.role}`,
                        isBass ? 'is-bass' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="triad-dot-text">
                        {note.tone.degreeLabel}
                        <span className="triad-dot-sep"> · </span>
                        {note.tone.name}
                      </span>
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function diagramLabel(
  voicing: TriadVoicing,
  stringLabels: readonly [string, string, string],
): string {
  return `${stringLabels.join(' ')} frets ${voicing.frets.join(', ')}; sounding ${voicing.soundingNames.join(', ')}`
}
