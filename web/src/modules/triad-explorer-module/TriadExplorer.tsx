import { useMemo, useState } from 'react'
import { QualitySection } from './QualitySection.tsx'
import {
  ROOT_OPTIONS,
  STRING_SETS,
  TRIAD_QUALITIES,
  type StringSetId,
  type TriadQualityId,
} from './theory.ts'
import './triad-explorer.css'

type QualityFilter = 'all' | TriadQualityId
type StringSetFilter = 'all' | StringSetId

export function TriadExplorer() {
  const [root, setRoot] = useState<string>('C')
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all')
  const [stringSetFilter, setStringSetFilter] = useState<StringSetFilter>('gbe')

  const qualities = useMemo(
    () =>
      qualityFilter === 'all'
        ? TRIAD_QUALITIES
        : TRIAD_QUALITIES.filter((quality) => quality.id === qualityFilter),
    [qualityFilter],
  )

  const stringSets = useMemo(
    () =>
      stringSetFilter === 'all'
        ? STRING_SETS
        : STRING_SETS.filter((set) => set.id === stringSetFilter),
    [stringSetFilter],
  )

  return (
    <section className="triad-explorer" aria-label="Guitar triad explorer">
      <header className="triad-hero">
        <p className="triad-kicker">Study tool</p>
        <h1>Triad explorer</h1>
        <p>
          Pick a root and see major, minor, diminished, and augmented triads in root position and
          both inversions — derived from standard tuning pitches, not memorized shapes.
        </p>
      </header>

      <div className="triad-controls" role="group" aria-label="Triad controls">
        <label className="triad-field">
          <span>Root</span>
          <select value={root} onChange={(event) => setRoot(event.target.value)}>
            {ROOT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="triad-field">
          <span>Quality</span>
          <select
            value={qualityFilter}
            onChange={(event) => setQualityFilter(event.target.value as QualityFilter)}
          >
            <option value="all">All four qualities</option>
            {TRIAD_QUALITIES.map((quality) => (
              <option key={quality.id} value={quality.id}>
                {quality.label}
              </option>
            ))}
          </select>
        </label>

        <label className="triad-field">
          <span>String set</span>
          <select
            value={stringSetFilter}
            onChange={(event) => setStringSetFilter(event.target.value as StringSetFilter)}
          >
            <option value="all">All string sets</option>
            {STRING_SETS.map((set) => (
              <option key={set.id} value={set.id}>
                {set.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="triad-legend" aria-label="Degree colors">
        <span className="triad-legend-item">
          <span className="triad-legend-swatch triad-dot-root" /> Root
        </span>
        <span className="triad-legend-item">
          <span className="triad-legend-swatch triad-dot-third" /> Third
        </span>
        <span className="triad-legend-item">
          <span className="triad-legend-swatch triad-dot-fifth" /> Fifth
        </span>
        <span className="triad-legend-item triad-legend-bass">Bass note outlined</span>
      </div>

      <div className="triad-results">
        {stringSets.map((stringSet) =>
          qualities.map((quality) => (
            <QualitySection
              key={`${stringSet.id}-${quality.id}`}
              root={root}
              quality={quality}
              stringSet={stringSet}
            />
          )),
        )}
      </div>
    </section>
  )
}
