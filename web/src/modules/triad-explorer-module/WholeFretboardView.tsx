import { useMemo, useState, type CSSProperties } from 'react'
import {
  INVERSION_META,
  NECK_FRET_COUNT,
  NECK_STRINGS,
  buildTriad,
  chordSymbol,
  neckNotesForTriad,
  neckVoicings,
  shortDegreeLabel,
  type InversionId,
  type StringSet,
  type TriadQuality,
  type TriadVoicing,
} from './theory.ts'

type WholeFretboardViewProps = {
  root: string
  quality: TriadQuality
  stringSets: readonly StringSet[]
}

const INLAYS = [3, 5, 7, 9, 12, 15, 17, 19, 21] as const

export function WholeFretboardView({ root, quality, stringSets }: WholeFretboardViewProps) {
  const [visibleInversions, setVisibleInversions] = useState<Record<InversionId, boolean>>({
    root: true,
    first: true,
    second: true,
  })

  const tones = useMemo(() => buildTriad(root, quality), [root, quality])
  const notes = useMemo(() => neckNotesForTriad(tones), [tones])
  const voicings = useMemo(() => neckVoicings(tones, stringSets), [tones, stringSets])
  const highlighted = voicings.filter((voicing) => visibleInversions[voicing.inversion])

  const noteLookup = useMemo(() => {
    const map = new Map<string, (typeof notes)[number]>()
    for (const note of notes) map.set(`${note.stringNumber}:${note.fret}`, note)
    return map
  }, [notes])

  const frets = Array.from({ length: NECK_FRET_COUNT + 1 }, (_, fret) => fret)
  const symbol = chordSymbol(root, quality)
  const boardStyle = {
    '--neck-cols': NECK_FRET_COUNT + 1,
  } as CSSProperties

  return (
    <section className="triad-neck" aria-label="Whole fretboard view">
      <header className="triad-neck-header">
        <div>
          <p className="triad-inversion-kicker">Whole fretboard</p>
          <h2>
            {symbol}{' '}
            <span className="triad-neck-quality">{quality.label.toLowerCase()} triad</span>
          </h2>
          <p className="triad-neck-lede">
            Every chord tone on the neck, with close-position inversions outlined on{' '}
            {stringSets.length === 1 ? stringSets[0].label : 'all selected string sets'}.
          </p>
        </div>
        <div className="triad-neck-toggles" role="group" aria-label="Highlight inversions">
          {(Object.keys(INVERSION_META) as InversionId[]).map((id) => (
            <label key={id} className="triad-neck-toggle">
              <input
                type="checkbox"
                checked={visibleInversions[id]}
                onChange={() =>
                  setVisibleInversions((current) => ({ ...current, [id]: !current[id] }))
                }
              />
              <span className={`triad-neck-swatch triad-outline-${id}`} aria-hidden="true" />
              {INVERSION_META[id].label}
            </label>
          ))}
        </div>
      </header>

      <div className="triad-neck-scroll">
        <div
          className="triad-neck-board"
          style={boardStyle}
          role="img"
          aria-label={`${symbol} chord tones and highlighted inversions on frets 0 to ${NECK_FRET_COUNT}`}
        >
          {INLAYS.map((fret) => (
            <span
              key={`inlay-${fret}`}
              className={fret === 12 ? 'triad-neck-inlay is-double' : 'triad-neck-inlay'}
              style={{ gridColumn: fret + 2, gridRow: '1 / 7' }}
              aria-hidden="true"
            />
          ))}

          {highlighted.map((voicing) => (
            <InversionOutline key={outlineKey(voicing)} voicing={voicing} />
          ))}

          {NECK_STRINGS.map((string) => (
            <span
              key={`wire-${string.number}`}
              className="triad-neck-wire-full"
              style={{ gridRow: string.number, gridColumn: '2 / -1' }}
              aria-hidden="true"
            />
          ))}

          {NECK_STRINGS.map((string) => (
            <span
              key={`label-${string.number}`}
              className="triad-neck-string-label"
              style={{ gridRow: string.number, gridColumn: 1 }}
            >
              {string.label}
            </span>
          ))}

          {NECK_STRINGS.map((string) =>
            frets.map((fret) => {
              const note = noteLookup.get(`${string.number}:${fret}`)
              return (
                <div
                  key={`${string.number}-${fret}`}
                  className={fret === 0 ? 'triad-neck-cell triad-neck-open' : 'triad-neck-cell'}
                  style={{ gridRow: string.number, gridColumn: fret + 2 }}
                >
                  {note ? (
                    <span
                      className={`triad-neck-dot triad-dot-${note.tone.role}`}
                      title={`${note.tone.degreeLabel} · ${note.tone.name}`}
                    >
                      {shortDegreeLabel(note.tone)}
                    </span>
                  ) : null}
                </div>
              )
            }),
          )}

          <span className="triad-neck-fret-spacer" style={{ gridRow: 7, gridColumn: 1 }} />
          {frets.map((fret) => (
            <span
              key={`fnum-${fret}`}
              className="triad-neck-fretnum"
              style={{ gridRow: 7, gridColumn: fret + 2 }}
            >
              {fret}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function InversionOutline({
  voicing,
}: {
  voicing: TriadVoicing & { stringSetId: string }
}) {
  const stringNumbers = voicing.notes.map((note) => note.stringNumber)
  const minString = Math.min(...stringNumbers)
  const maxString = Math.max(...stringNumbers)
  const minFret = Math.min(...voicing.frets)
  const maxFret = Math.max(...voicing.frets)

  return (
    <div
      className={`triad-neck-outline triad-outline-${voicing.inversion}`}
      style={{
        gridRow: `${minString} / ${maxString + 1}`,
        gridColumn: `${minFret + 2} / ${maxFret + 3}`,
      }}
      title={`${INVERSION_META[voicing.inversion].label}: frets ${voicing.frets.join('–')}`}
    />
  )
}

function outlineKey(voicing: TriadVoicing & { stringSetId: string }): string {
  return `${voicing.stringSetId}-${voicing.inversion}-${voicing.frets.join('-')}`
}
