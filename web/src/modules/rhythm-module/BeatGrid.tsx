import { beatTicks, beatsPerBar } from './theory/duration.ts'
import { pickingDirections, syllables, type AccentState } from './theory/grid.ts'
import type { TimeSignature } from './theory/duration.ts'

type BeatGridProps = {
  signature: TimeSignature
  parts: number
  states?: AccentState[] | null
  activeSlot: number
  gap?: boolean
  showInner?: boolean
  showPicking?: boolean
  onCycle?: (index: number) => void
}

export function BeatGrid({
  signature,
  parts,
  states,
  activeSlot,
  gap = false,
  showInner = true,
  showPicking = false,
  onCycle,
}: BeatGridProps) {
  const beats = beatsPerBar(signature)
  const labels = syllables(beats, parts, beatTicks(signature))
  const picking = showPicking ? pickingDirections(parts) : null
  return (
    <div className={gap ? 'rh-grid is-gap' : 'rh-grid'} style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(2.1rem, 1fr))` }}>
      {labels.map((label, index) => {
        const onBeat = index % parts === 0
        const state = states?.[index] ?? (onBeat ? 'normal' : 'silent')
        const hidden = !showInner && !onBeat
        const className = [
          'rh-slot',
          onBeat ? 'is-beat' : '',
          state === 'accent' ? 'is-accent' : '',
          state === 'silent' ? 'is-silent' : '',
          index === activeSlot ? 'is-now' : '',
          hidden ? 'is-hidden' : '',
        ].filter(Boolean).join(' ')
        const name = `${label}${state === 'accent' ? ', accented' : ''}${state === 'silent' ? ', silent' : ''}`
        if (!onCycle) {
          return (
            <div key={`${label}-${index}`} className={className} aria-current={index === activeSlot ? 'true' : undefined}>
              <span className="rh-slot-count">{hidden ? '' : label}</span>
              <span className="rh-slot-dot" aria-hidden="true" />
              {picking ? <span className="rh-slot-pick">{hidden ? '' : picking[index % picking.length]}</span> : null}
              <span className="rh-sr">{name}</span>
            </div>
          )
        }
        return (
          <button
            key={`${label}-${index}`}
            type="button"
            className={className}
            aria-label={`${name}. Click to change.`}
            aria-current={index === activeSlot ? 'true' : undefined}
            onClick={() => onCycle(index)}
          >
            <span className="rh-slot-count">{hidden ? '' : label}</span>
            <span className="rh-slot-dot" aria-hidden="true" />
            {picking ? <span className="rh-slot-pick">{hidden ? '' : picking[index % picking.length]}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
