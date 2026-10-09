import { useMemo, useState } from 'react'
import fretboardDeck from '../../data/flashcards/fretboard-memorization.json'
import { Flashcards, filterFlashcardDeck, parseFlashcardDeck } from '../flashcards-module/index.ts'

const STRING_OPTIONS = [
  { number: 1, label: '1st · e' },
  { number: 2, label: '2nd · B' },
  { number: 3, label: '3rd · G' },
  { number: 4, label: '4th · D' },
  { number: 5, label: '5th · A' },
  { number: 6, label: '6th · E' },
] as const

const NOTE_OPTIONS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function FretboardMemorization() {
  const sourceDeck = useMemo(() => parseFlashcardDeck(fretboardDeck), [])
  const [strings, setStrings] = useState<number[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [session, setSession] = useState(0)

  const filteredDeck = useMemo(
    () => filterFlashcardDeck(sourceDeck, { strings, notes }),
    [sourceDeck, strings, notes],
  )

  const hasCards = filteredDeck.cards.length > 0

  return (
    <div className="fretboard-memorization">
      <header className="fretboard-memorization-intro">
        <h2>Fretboard memorization</h2>
        <p>
          Flashcards for pitch classes on the neck — e.g. “1st string (e), fret 3” → G. Filter by
          string and/or note. Leave a group empty to include all of that group.
        </p>
      </header>

      <div className="fretboard-filters">
        <fieldset>
          <legend>Strings</legend>
          <div className="fretboard-filter-options">
            {STRING_OPTIONS.map((option) => {
              const selected = strings.includes(option.number)
              return (
                <button
                  key={option.number}
                  type="button"
                  className={selected ? 'filter-chip is-selected' : 'filter-chip'}
                  aria-pressed={selected}
                  onClick={() => setStrings((current) => toggleValue(current, option.number))}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <div className="fretboard-filter-tools">
            <button
              type="button"
              className="filter-tool"
              onClick={() => setStrings(STRING_OPTIONS.map((item) => item.number))}
            >
              All strings
            </button>
            <button type="button" className="filter-tool" onClick={() => setStrings([])}>
              Clear
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Notes</legend>
          <div className="fretboard-filter-options">
            {NOTE_OPTIONS.map((note) => {
              const selected = notes.includes(note)
              return (
                <button
                  key={note}
                  type="button"
                  className={selected ? 'filter-chip is-selected' : 'filter-chip'}
                  aria-pressed={selected}
                  onClick={() => setNotes((current) => toggleValue(current, note))}
                >
                  {note}
                </button>
              )
            })}
          </div>
          <div className="fretboard-filter-tools">
            <button type="button" className="filter-tool" onClick={() => setNotes([...NOTE_OPTIONS])}>
              All notes
            </button>
            <button type="button" className="filter-tool" onClick={() => setNotes([])}>
              Clear
            </button>
          </div>
        </fieldset>
      </div>

      <p className="fretboard-filter-count" aria-live="polite">
        {hasCards
          ? `${filteredDeck.cards.length} cards in this set`
          : 'No cards match that filter. Pick different strings or notes.'}
      </p>

      <button
        type="button"
        className="fretboard-restart"
        disabled={!hasCards}
        onClick={() => setSession((value) => value + 1)}
      >
        Restart with current filters
      </button>

      {hasCards ? (
        <Flashcards key={`${filteredDeck.id}:${session}`} deck={filteredDeck} hideHeader />
      ) : null}
    </div>
  )
}
