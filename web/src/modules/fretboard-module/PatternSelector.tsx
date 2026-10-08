import { useMemo, useState } from 'react'
import {
  FORMULA_PRESETS,
  PATTERN_CATEGORIES,
  findPresetByFormula,
  normalizeFormula,
  type FormulaPreset,
  type PatternCategory,
} from './theory.ts'

type PatternSelectorProps = {
  formula: string
  onSelect: (preset: FormulaPreset) => void
}

export function PatternSelector({ formula, onSelect }: PatternSelectorProps) {
  const [category, setCategory] = useState<PatternCategory>(() => {
    return findPresetByFormula(formula)?.category ?? 'scales'
  })
  const [query, setQuery] = useState('')
  const active = findPresetByFormula(formula)
  const normalized = normalizeFormula(formula)

  const presets = useMemo(() => {
    const filtered = FORMULA_PRESETS.filter((preset) => {
      if (preset.category !== category) return false
      if (!query.trim()) return true
      const haystack = `${preset.label} ${preset.formula}`.toLowerCase()
      return haystack.includes(query.trim().toLowerCase())
    })
    return filtered
  }, [category, query])

  return (
    <div className="fx-pattern">
      <div className="fx-pattern-current">
        <span className="fx-label">Pattern</span>
        <strong>{active?.label ?? 'Custom formula'}</strong>
        <code>{formula.trim() || '—'}</code>
      </div>

      <div className="fx-pattern-tabs" role="tablist" aria-label="Pattern categories">
        {PATTERN_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={category === item.id}
            className={category === item.id ? 'fx-chip is-active' : 'fx-chip'}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="fx-field fx-search">
        <span className="sr-only">Search patterns</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search patterns…"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <div className="fx-pattern-list" role="listbox" aria-label={`${category} patterns`}>
        {presets.length === 0 ? (
          <p className="fx-muted">No patterns in this category match your search.</p>
        ) : (
          presets.map((preset) => {
            const selected = normalizeFormula(preset.formula) === normalized
            return (
              <button
                key={preset.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={selected ? 'fx-pattern-option is-selected' : 'fx-pattern-option'}
                onClick={() => {
                  setCategory(preset.category)
                  onSelect(preset)
                }}
              >
                <span>{preset.label}</span>
                <code>{preset.formula}</code>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
