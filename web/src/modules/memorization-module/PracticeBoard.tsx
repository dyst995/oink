import type { CSSProperties } from 'react'
import { GUITAR_STRINGS, pitchClassAt } from '../fretboard-module/theory.ts'
import { TRAINER_FRET_MAX, noteNameFromPitchClass, positionKey } from './notes.ts'

const STRING_GAUGES = [1, 1.5, 2, 2.4, 2.8, 3.4]

export type BoardSelection = { stringNumber: number; fret: number }

type PracticeBoardProps = {
  fretMax?: number
  /** Multi-select for find-all; single otherwise. */
  multi?: boolean
  selected: BoardSelection[]
  onChange: (next: BoardSelection[]) => void
  /** Highlight origin for octave questions. */
  locked?: BoardSelection[]
  disabled?: boolean
  showNotePreview?: boolean
}

export function PracticeBoard({
  fretMax = TRAINER_FRET_MAX,
  multi = false,
  selected,
  onChange,
  locked = [],
  disabled = false,
  showNotePreview = false,
}: PracticeBoardProps) {
  const frets = Array.from({ length: fretMax + 1 }, (_, fret) => fret)
  const selectedKeys = new Set(selected.map(positionKey))
  const lockedKeys = new Set(locked.map(positionKey))

  function toggle(stringNumber: number, fret: number) {
    if (disabled) return
    const key = positionKey({ stringNumber, fret })
    if (lockedKeys.has(key)) return

    if (multi) {
      if (selectedKeys.has(key)) {
        onChange(selected.filter((item) => positionKey(item) !== key))
      } else {
        onChange([...selected, { stringNumber, fret }])
      }
      return
    }

    onChange([{ stringNumber, fret }])
  }

  return (
    <div className="trainer-board-scroll">
      <div
        className="trainer-board"
        role="group"
        aria-label="Practice fretboard"
        style={{ '--trainer-frets': fretMax } as CSSProperties}
      >
        <div className="trainer-fret-numbers" aria-hidden="true">
          <span />
          {frets.map((fret) => (
            <span key={fret}>{fret}</span>
          ))}
        </div>
        <div className="trainer-board-body">
          <div className="trainer-headstock">
            {GUITAR_STRINGS.map((string) => (
              <div key={string.id}>{string.label}</div>
            ))}
          </div>
          <div className="trainer-neck">
            {GUITAR_STRINGS.map((string, index) => (
              <div className="trainer-string-row" key={string.id}>
                <div className="trainer-string-line" style={{ height: STRING_GAUGES[index] }} />
                {frets.map((fret) => {
                  const key = positionKey({ stringNumber: string.number, fret })
                  const isSelected = selectedKeys.has(key)
                  const isLocked = lockedKeys.has(key)
                  const note = noteNameFromPitchClass(
                    pitchClassAt(string.openPitchClass, fret),
                  )
                  return (
                    <button
                      key={fret}
                      type="button"
                      className={[
                        'trainer-fret',
                        fret === 0 ? 'is-open' : '',
                        isSelected ? 'is-selected' : '',
                        isLocked ? 'is-locked' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={disabled || isLocked}
                      aria-pressed={isSelected || isLocked}
                      aria-label={`${string.label} string, fret ${fret}${showNotePreview ? `, ${note}` : ''}`}
                      onClick={() => toggle(string.number, fret)}
                    >
                      {isSelected || isLocked || showNotePreview ? (
                        <span className="trainer-dot">{showNotePreview ? note : ''}</span>
                      ) : null}
                    </button>
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
