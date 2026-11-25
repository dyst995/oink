import { useEffect, useMemo, useRef, useState } from 'react'
import { Fretboard, type FretMarker } from '../Fretboard.tsx'
import type { SelectedNote } from '../NoteInspector.tsx'
import { FRET_COUNT, GUITAR_STRINGS, pitchClassAt } from '../theory.ts'
import { formatPosition, resolvePractice, timingEnabled } from './engine.ts'
import { answerFromSelection, currentCard, type PlaySession } from './session.ts'
import type { Selection } from './types.ts'
import { MODE_LABELS } from './types.ts'
import { SessionStats } from './TrainerSummary.tsx'

type TrainerPlayProps = {
  session: PlaySession
  onSelection: (selection: Selection | null) => void
  onSubmit: () => void
  onReveal: () => void
  onSelfGrade: (correct: boolean) => void
  onNext: () => void
  onEnd: () => void
}

export function TrainerPlay({
  session,
  onSelection,
  onSubmit,
  onReveal,
  onSelfGrade,
  onNext,
  onEnd,
}: TrainerPlayProps) {
  const card = currentCard(session)
  const cardRef = useRef<HTMLDivElement>(null)
  const [clock, setClock] = useState(() => performance.now())

  useEffect(() => {
    cardRef.current?.focus()
  }, [card?.id, session.status])

  useEffect(() => {
    if (session.status !== 'asking' || !session.settings.timeLimitSec) return
    const id = window.setInterval(() => setClock(performance.now()), 200)
    return () => window.clearInterval(id)
  }, [session.status, session.index, session.startedAt, session.settings.timeLimitSec])

  const practice = useMemo(() => resolvePractice(session.settings), [session.settings])

  if (!card || !practice.ok) {
    return (
      <p className="fx-error" role="alert">
        {practice.ok ? 'This card is missing.' : practice.error}
      </p>
    )
  }

  const { settings, status, selection } = session
  const revealed = status !== 'asking'
  const showBoard = revealed || !settings.hideBoardUntilReveal
  const interactive = status === 'asking' && card.mode === 'note-to-fret' && showBoard
  const limit = settings.trackTime ? settings.timeLimitSec : null
  const remaining =
    limit != null && status === 'asking'
      ? Math.min(limit, Math.max(0, Math.ceil(limit - (clock - session.startedAt) / 1000)))
      : null
  const total = session.mode === 'review' ? session.cards.length : settings.questionCount
  const done = status === 'graded' ? session.index + 1 : session.index
  const ready = answerFromSelection(card, selection) != null

  const inactiveFrets = new Set<number>()
  const fretMin = settings.range === 'entire' ? 0 : settings.fretMin
  const fretMax = settings.range === 'entire' ? FRET_COUNT : settings.fretMax
  const shape = settings.range === 'custom' ? practice.practice.shape : null
  for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
    if (fret < fretMin || fret > fretMax || (shape && !shape.frets.includes(fret))) inactiveFrets.add(fret)
  }

  const inactiveStringIds = new Set<string>()
  if (settings.range === 'custom' && settings.stringNumbers) {
    for (const guitarString of GUITAR_STRINGS) {
      if (!settings.stringNumbers.includes(guitarString.number)) inactiveStringIds.add(guitarString.id)
    }
  }
  if (status === 'asking' && card.stringId) {
    for (const guitarString of GUITAR_STRINGS) {
      if (guitarString.id !== card.stringId) inactiveStringIds.add(guitarString.id)
    }
  }

  const markers: FretMarker[] = []
  if (!revealed && card.asked) {
    markers.push({ stringId: card.asked.stringId, fret: card.asked.fret, kind: 'ask' })
  }
  if (revealed) {
    for (const position of card.positions) {
      markers.push({ stringId: position.stringId, fret: position.fret, kind: 'correct' })
    }
    if (status === 'graded' && selection?.kind === 'position') {
      const hit = card.positions.some(
        (position) => position.stringId === selection.stringId && position.fret === selection.fret,
      )
      if (!hit) markers.push({ stringId: selection.stringId, fret: selection.fret, kind: 'wrong' })
    }
  }

  const selected = selectionNote(selection, status)

  function toggleSelection(next: Selection) {
    if (
      selection &&
      selection.kind === next.kind &&
      ((selection.kind === 'note' && next.kind === 'note' && selection.name === next.name) ||
        (selection.kind === 'degree' && next.kind === 'degree' && selection.label === next.label) ||
        (selection.kind === 'position' &&
          next.kind === 'position' &&
          selection.stringId === next.stringId &&
          selection.fret === next.fret))
    ) {
      onSelection(null)
      return
    }
    onSelection(next)
  }

  const scopeStrings = GUITAR_STRINGS.filter(
    (guitarString) =>
      !(settings.range === 'custom' && settings.stringNumbers && !settings.stringNumbers.includes(guitarString.number)),
  )

  return (
    <div className="fx-trainer-play">
      <div className="fx-session-bar">
        <div>
          <p className="fx-stat-line">
            <span>
              {session.mode === 'review' ? 'Review' : 'Card'} {session.index + 1}
              {total != null ? ` of ${total}` : ''}
            </span>
            <span>
              {session.attempts.filter((attempt) => attempt.correct).length} correct
            </span>
            <span>
              {session.attempts.filter((attempt) => !attempt.correct).length} incorrect
            </span>
            {remaining != null ? (
              <span className={remaining <= 3 ? 'is-urgent' : undefined}>{remaining}s</span>
            ) : null}
          </p>
          {total != null ? (
            <div className="fx-progress" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (done / total) * 100)}%` }} />
            </div>
          ) : null}
        </div>
        <button type="button" className="fx-btn" onClick={onEnd}>
          End session
        </button>
      </div>

      <div ref={cardRef} className="fx-card" tabIndex={-1} aria-live="polite">
        <p className="fx-card-kicker">
          {MODE_LABELS[card.mode]}
          <span>{card.context}</span>
        </p>
        <h2 className="fx-card-prompt">{card.prompt}</h2>
        {card.hint ? <p className="fx-hint">{card.hint}</p> : null}

        {status === 'asking' ? (
          <form
            className="fx-answer"
            onSubmit={(event) => {
              event.preventDefault()
              if (ready) onSubmit()
            }}
          >
            {card.mode === 'note-to-fret' && !showBoard ? (
              <PositionFields
                key={card.id}
                stringId={card.stringId}
                strings={card.stringId ? GUITAR_STRINGS.filter((item) => item.id === card.stringId) : scopeStrings}
                onSelection={onSelection}
              />
            ) : null}

            {card.mode === 'note-to-fret' && showBoard ? (
              <p className="fx-hint">
                {selectionLabel(selection) ? `Selected: ${selectionLabel(selection)}` : 'Select a position on the fretboard.'}
              </p>
            ) : null}

            {card.mode === 'note-to-degree' ? (
              <>
                <div className="fx-chip-row" role="group" aria-label="Scale degrees">
                  {practice.practice.tones.map((tone) => {
                    const pressed = selection?.kind === 'degree' && selection.label === tone.degreeLabel
                    return (
                      <button
                        key={tone.degreeLabel}
                        type="button"
                        className={pressed ? 'fx-chip is-active' : 'fx-chip'}
                        aria-pressed={pressed}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelection({ kind: 'degree', label: tone.degreeLabel })}
                      >
                        {tone.degreeLabel}
                      </button>
                    )
                  })}
                </div>
                <label className="fx-field">
                  <span>Or type the degree</span>
                  <input
                    value={selection?.kind === 'degree' ? selection.label : ''}
                    onChange={(event) =>
                      onSelection(event.target.value.trim() ? { kind: 'degree', label: event.target.value } : null)
                    }
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </label>
              </>
            ) : null}

            {card.mode === 'fret-to-note' || card.mode === 'degree-to-note' ? (
              <>
                <div className="fx-chip-row" role="group" aria-label="Notes">
                  {practice.practice.tones.map((tone) => {
                    const pressed = selection?.kind === 'note' && selection.name === tone.name
                    return (
                      <button
                        key={tone.name}
                        type="button"
                        className={pressed ? 'fx-chip is-active' : 'fx-chip'}
                        aria-pressed={pressed}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelection({ kind: 'note', name: tone.name })}
                      >
                        {tone.name}
                      </button>
                    )
                  })}
                </div>
                <label className="fx-field">
                  <span>Or type a note</span>
                  <input
                    value={selection?.kind === 'note' ? selection.name : ''}
                    onChange={(event) =>
                      onSelection(event.target.value.trim() ? { kind: 'note', name: event.target.value } : null)
                    }
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </label>
              </>
            ) : null}

            <div className="fx-card-actions">
              <button type="submit" className="fx-btn fx-btn-primary" disabled={!ready}>
                Submit
              </button>
              <button type="button" className="fx-btn" onClick={onReveal}>
                Reveal
              </button>
            </div>
          </form>
        ) : null}

        {status === 'revealed' ? (
          <div className="fx-answer">
            <p className="fx-feedback">
              <strong>Answer. </strong>
              {card.reveal}
            </p>
            <div className="fx-card-actions">
              <button type="button" className="fx-btn fx-btn-danger" onClick={() => onSelfGrade(false)}>
                I missed it
              </button>
              <button type="button" className="fx-btn fx-btn-ok" onClick={() => onSelfGrade(true)}>
                I had it
              </button>
            </div>
          </div>
        ) : null}

        {status === 'graded' ? (
          <div className="fx-answer">
            <p className={session.correct ? 'fx-feedback is-correct' : 'fx-feedback is-wrong'}>
              <strong>{session.correct ? 'Correct. ' : 'Incorrect. '}</strong>
              {card.reveal}
            </p>
            {settings.autoAdvance ? (
              <p className="fx-hint">Next card…</p>
            ) : (
              <div className="fx-card-actions">
                <button type="button" className="fx-btn fx-btn-primary" onClick={onNext}>
                  Next
                </button>
              </div>
            )}
          </div>
        ) : null}

        <p className="fx-shortcuts">Space reveal · Enter submit · → next · 1 miss · 2 correct · Esc exit</p>
      </div>

      {showBoard ? (
        <Fretboard
          tones={revealed ? practice.practice.tones : []}
          labelMode="notes"
          showRoots={revealed}
          showLabels={revealed}
          showFretNumbers
          showNonPattern={false}
          showShapes={Boolean(shape)}
          shapes={shape ? [shape] : []}
          focusMode="all"
          focusDegree={practice.practice.tones[0]?.degreeLabel ?? '1'}
          focusInterval={practice.practice.tones[0]?.semitones ?? 0}
          pairNotes={null}
          selected={selected}
          markers={markers}
          inactiveFrets={inactiveFrets}
          inactiveStringIds={inactiveStringIds}
          interactive={interactive}
          onSelect={(note) => {
            if (!interactive) return
            toggleSelection({ kind: 'position', stringId: note.string.id, fret: note.fret })
            cardRef.current?.focus()
          }}
        />
      ) : (
        <p className="fx-hint">The fretboard stays hidden until you reveal the answer.</p>
      )}

      <details className="fx-stat-more">
        <summary>Statistics</summary>
        <SessionStats attempts={session.attempts} trackTime={timingEnabled(settings)} />
      </details>
    </div>
  )
}

function selectionNote(selection: Selection | null, status: PlaySession['status']): SelectedNote | null {
  if (status !== 'asking' || selection?.kind !== 'position') return null
  const guitarString = GUITAR_STRINGS.find((item) => item.id === selection.stringId)
  if (!guitarString) return null
  return {
    string: guitarString,
    fret: selection.fret,
    tone: null,
    pitchClass: pitchClassAt(guitarString.openPitchClass, selection.fret),
    shapes: [],
  }
}

function selectionLabel(selection: Selection | null): string | null {
  if (selection?.kind !== 'position') return null
  const guitarString = GUITAR_STRINGS.find((item) => item.id === selection.stringId)
  if (!guitarString) return null
  return formatPosition({
    stringId: guitarString.id,
    stringNumber: guitarString.number,
    stringLabel: guitarString.label,
    fret: selection.fret,
    pitchClass: 0,
  })
}

function PositionFields({
  stringId,
  strings,
  onSelection,
}: {
  stringId: string | null
  strings: readonly { id: string; label: string; number: number }[]
  onSelection: (selection: Selection | null) => void
}) {
  const [chosenString, setChosenString] = useState(stringId ?? '')
  const [fretText, setFretText] = useState('')

  function publish(nextString: string, nextFret: string) {
    const fret = Number(nextFret)
    if (!nextString || nextFret.trim() === '' || !Number.isInteger(fret) || fret < 0 || fret > FRET_COUNT) {
      onSelection(null)
      return
    }
    onSelection({ kind: 'position', stringId: nextString, fret })
  }

  return (
    <div className="fx-setup-frets">
      {stringId == null ? (
        <label className="fx-field">
          <span>String</span>
          <select
            value={chosenString}
            onChange={(event) => {
              setChosenString(event.target.value)
              publish(event.target.value, fretText)
            }}
          >
            <option value="">Choose</option>
            {strings.map((guitarString) => (
              <option key={guitarString.id} value={guitarString.id}>
                {guitarString.number === 6 && guitarString.label === 'E'
                  ? 'Low E'
                  : guitarString.number === 1 && guitarString.label === 'e'
                    ? 'High e'
                    : guitarString.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="fx-field">
        <span>Fret</span>
        <input
          type="number"
          min={0}
          max={FRET_COUNT}
          inputMode="numeric"
          value={fretText}
          onChange={(event) => {
            setFretText(event.target.value)
            publish(stringId ?? chosenString, event.target.value)
          }}
        />
      </label>
    </div>
  )
}
