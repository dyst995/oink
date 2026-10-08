import {
  FRET_COUNT,
  GUITAR_STRINGS,
  INLAY_FRETS,
  pitchClassAt,
  type FormulaTone,
} from './theory.ts'

const STRING_GAUGES = [1, 1.5, 2, 2.4, 2.8, 3.4]

type FretboardProps = {
  tones: readonly FormulaTone[]
}

function inlayLeft(fret: number): string {
  return `calc(var(--open-w) + ${(fret - 0.5)} * var(--fret-w))`
}

export function Fretboard({ tones }: FretboardProps) {
  const toneByPitchClass = new Map(tones.map((tone) => [tone.pitchClass, tone]))
  const frets = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret)

  return (
    <div className="board-scroll">
      <div className="fretboard">
        <div className="fret-numbers" aria-hidden="true">
          <span className="fret-number" />
          {frets.map((fret) => (
            <span key={fret} className="fret-number">
              {fret}
            </span>
          ))}
        </div>

        <div className="board-body">
          <div className="headstock">
            {GUITAR_STRINGS.map((string) => (
              <div className="string-label" key={string.id}>
                {string.label}
              </div>
            ))}
          </div>

          <div className="neck">
            <div className="inlays" aria-hidden="true">
              {INLAY_FRETS.single.map((fret) => (
                <span key={fret} className="inlay" style={{ left: inlayLeft(fret) }} />
              ))}
              <span
                className="inlay inlay-high"
                style={{ left: inlayLeft(INLAY_FRETS.double) }}
              />
              <span className="inlay inlay-low" style={{ left: inlayLeft(INLAY_FRETS.double) }} />
            </div>

            {GUITAR_STRINGS.map((string, index) => (
              <div className="string-row" key={string.id}>
                <div className="string-line" style={{ height: STRING_GAUGES[index] }} />
                {frets.map((fret) => {
                  const tone = toneByPitchClass.get(pitchClassAt(string.openPitchClass, fret))
                  return (
                    <div key={fret} className={fret === 0 ? 'fret fret-open' : 'fret'}>
                      {tone ? (
                        <span
                          className={tone.isRoot ? 'note note-root' : 'note'}
                          data-string={string.label}
                          data-fret={fret}
                          data-note={tone.name}
                          data-degree={tone.degreeLabel}
                          title={`${tone.degreeLabel} · ${tone.name}`}
                        >
                          <span className="sr-only">
                            {string.label} string, fret {fret}, {tone.degreeLabel},{' '}
                          </span>
                          {tone.name}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
