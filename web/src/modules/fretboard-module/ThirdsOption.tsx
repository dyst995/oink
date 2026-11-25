import type { ThirdPair, ThirdsPairs } from './theory.ts'

type ThirdsOptionProps = {
  enabled: boolean
  available: boolean
  pairs: ThirdsPairs
  selectedId: string | null
  onEnabledChange: (value: boolean) => void
  onSelectPair: (id: string | null) => void
}

const DIRECTIONS: { id: keyof ThirdsPairs; label: string }[] = [
  { id: 'ascending', label: 'Ascending' },
  { id: 'descending', label: 'Descending' },
]

function pairLabel(pair: ThirdPair): string {
  return `${pair.from.name}–${pair.to.name}`
}

export function ThirdsOption({
  enabled,
  available,
  pairs,
  selectedId,
  onEnabledChange,
  onSelectPair,
}: ThirdsOptionProps) {
  const showPairs = enabled && available && pairs.ascending.length > 0

  return (
    <fieldset className="fx-fieldset">
      <legend>Thirds</legend>
      <div className="fx-chip-row">
        <button
          type="button"
          className={showPairs ? 'fx-chip is-active' : 'fx-chip'}
          aria-pressed={showPairs}
          disabled={!available}
          onClick={() => onEnabledChange(!enabled)}
        >
          Show thirds
        </button>
      </div>
      {available ? (
        <p className="fx-hint">
          Each pair skips one scale note. Choose a pair to highlight those two notes. The rest of
          the scale stays on the neck.
        </p>
      ) : (
        <p className="fx-hint">Choose a scale with at least three notes to see thirds.</p>
      )}

      {showPairs ? (
        <div className="fx-thirds">
          {DIRECTIONS.map((item) => (
            <div key={item.id} className="fx-thirds-run">
              <span className="fx-thirds-label">{item.label}</span>
              <div className="fx-chip-row" role="group" aria-label={`${item.label} thirds pairs`}>
                {pairs[item.id].map((pair) => {
                  const active = selectedId === pair.id
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      className={active ? 'fx-chip is-active' : 'fx-chip'}
                      aria-pressed={active}
                      onClick={() => onSelectPair(active ? null : pair.id)}
                    >
                      {pairLabel(pair)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </fieldset>
  )
}
