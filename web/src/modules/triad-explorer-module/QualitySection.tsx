import { useEffect, useMemo, useState } from 'react'
import { InversionCard } from './InversionCard.tsx'
import {
  INVERSION_META,
  buildTriad,
  chordSymbol,
  findCloseVoicings,
  type InversionId,
  type StringSet,
  type TriadQuality,
} from './theory.ts'

type QualitySectionProps = {
  root: string
  quality: TriadQuality
  stringSet: StringSet
}

const INVERSIONS = Object.keys(INVERSION_META) as InversionId[]

export function QualitySection({ root, quality, stringSet }: QualitySectionProps) {
  const tones = useMemo(() => buildTriad(root, quality), [root, quality])
  const voicings = useMemo(() => findCloseVoicings(tones, stringSet), [tones, stringSet])
  const [occurrence, setOccurrence] = useState<Record<InversionId, number>>({
    root: 0,
    first: 0,
    second: 0,
  })

  useEffect(() => {
    setOccurrence({ root: 0, first: 0, second: 0 })
  }, [root, quality.id, stringSet.id])

  const symbol = chordSymbol(root, quality)
  const noteList = tones.map((tone) => tone.name).join(' – ')

  return (
    <section className="triad-quality" aria-labelledby={`triad-quality-${quality.id}`}>
      <header className="triad-quality-header">
        <div>
          <h3 id={`triad-quality-${quality.id}`}>{symbol}</h3>
          <p className="triad-quality-subtitle">{quality.label} triad</p>
        </div>
        <div className="triad-quality-meta">
          <p>
            <span className="triad-meta-label">Notes</span>
            <span className="triad-meta-value">{noteList}</span>
          </p>
          <p>
            <span className="triad-meta-label">Formula</span>
            <span className="triad-meta-value">{quality.formula}</span>
          </p>
          <p>
            <span className="triad-meta-label">String set</span>
            <span className="triad-meta-value">{stringSet.label}</span>
          </p>
        </div>
      </header>

      <div className="triad-inversion-grid">
        {INVERSIONS.map((inversion) => (
          <InversionCard
            key={inversion}
            inversion={inversion}
            voicings={voicings[inversion]}
            occurrenceIndex={occurrence[inversion]}
            onOccurrenceChange={(index) =>
              setOccurrence((current) => ({ ...current, [inversion]: index }))
            }
            stringSet={stringSet}
          />
        ))}
      </div>
    </section>
  )
}
