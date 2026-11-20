import { TriadBoard } from './TriadBoard.tsx'
import {
  FINGER_NAMES,
  INVERSION_META,
  fingeringForVoicing,
  roleWord,
  type InversionId,
  type StringSet,
  type TriadVoicing,
} from './theory.ts'

type InversionCardProps = {
  inversion: InversionId
  voicings: readonly TriadVoicing[]
  occurrenceIndex: number
  onOccurrenceChange: (index: number) => void
  stringSet: StringSet
}

export function InversionCard({
  inversion,
  voicings,
  occurrenceIndex,
  onOccurrenceChange,
  stringSet,
}: InversionCardProps) {
  const meta = INVERSION_META[inversion]
  const safeIndex = Math.min(occurrenceIndex, Math.max(0, voicings.length - 1))
  const voicing = voicings[safeIndex] ?? null

  return (
    <article className="triad-inversion-card" data-inversion={inversion}>
      <header className="triad-inversion-header">
        <div>
          <p className="triad-inversion-kicker">{meta.orderLabel}</p>
          <h4>{meta.label}</h4>
        </div>
        {voicings.length > 1 ? (
          <div className="triad-occurrence">
            <button
              type="button"
              className="triad-occurrence-btn"
              aria-label="Previous occurrence"
              disabled={safeIndex <= 0}
              onClick={() => onOccurrenceChange(safeIndex - 1)}
            >
              ‹
            </button>
            <span className="triad-occurrence-label">
              {safeIndex + 1} / {voicings.length}
            </span>
            <button
              type="button"
              className="triad-occurrence-btn"
              aria-label="Next occurrence"
              disabled={safeIndex >= voicings.length - 1}
              onClick={() => onOccurrenceChange(safeIndex + 1)}
            >
              ›
            </button>
          </div>
        ) : null}
      </header>

      {voicing ? (
        <>
          <p className="triad-bass-label">
            Bass: <strong>{voicing.bass.tone.name}</strong> ({roleWord(voicing.bass.tone.role)})
          </p>
          <TriadBoard voicing={voicing} stringLabels={stringSet.openLabels} />
          <p className="triad-sounding">
            <span className="triad-sounding-label">Low → high</span>
            <span className="triad-sounding-notes">
              {voicing.notes.map((note) => note.tone.name).join(' – ')}
            </span>
            <span className="triad-sounding-frets">
              Frets {voicing.frets.join(' – ')}
            </span>
          </p>
          <FingeringRow frets={voicing.frets} stringLabels={stringSet.openLabels} />
        </>
      ) : (
        <p className="triad-empty">No close voicing on this string set within frets 0–24.</p>
      )}
    </article>
  )
}

function FingeringRow({
  frets,
  stringLabels,
}: {
  frets: readonly [number, number, number]
  stringLabels: readonly [string, string, string]
}) {
  const fingers = fingeringForVoicing(frets)
  const words = fingers.map((finger) => FINGER_NAMES[finger])

  return (
    <div className="triad-fingering" aria-label={`Fingering ${words.join(', ')}`}>
      <span className="triad-sounding-label">Fingering</span>
      <div className="triad-fingering-grid">
        {stringLabels.map((label, index) => (
          <div key={label} className="triad-fingering-cell">
            <span className="triad-fingering-string">{label}</span>
            <span className="triad-fingering-num">{fingers[index]}</span>
            <span className="triad-fingering-name">{FINGER_NAMES[fingers[index]]}</span>
          </div>
        ))}
      </div>
      <p className="triad-fingering-key">0 open · 1 index · 2 middle · 3 ring · 4 pinky</p>
    </div>
  )
}
