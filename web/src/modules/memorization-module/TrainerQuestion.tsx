import { useEffect, useId, useRef, useState } from 'react'
import { PracticeBoard, type BoardSelection } from './PracticeBoard.tsx'
import type { AnswerPayload, AnswerResult, TrainerQuestion as Question } from './types.ts'

type TrainerQuestionProps = {
  question: Question
  timed: boolean
  timeLimitSec: number
  onSubmit: (payload: AnswerPayload) => void
  onTimeout: () => void
  feedback: AnswerResult | null
  onContinue: () => void
}

export function TrainerQuestionView({
  question,
  timed,
  timeLimitSec,
  onSubmit,
  onTimeout,
  feedback,
  onContinue,
}: TrainerQuestionProps) {
  const inputId = useId()
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<BoardSelection[]>([])
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSec)
  const timedOutRef = useRef(false)
  const onTimeoutRef = useRef(onTimeout)

  const locked =
    question.kind === 'octave'
      ? [{ stringNumber: question.origin.stringNumber, fret: question.origin.fret }]
      : []

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (!timed || feedback) return
    timedOutRef.current = false
    const endsAt = Date.now() + timeLimitSec * 1000
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left <= 0 && !timedOutRef.current) {
        timedOutRef.current = true
        window.clearInterval(timer)
        onTimeoutRef.current()
      }
    }, 200)
    return () => window.clearInterval(timer)
  }, [question.id, timed, timeLimitSec, feedback])

  function submit() {
    if (feedback) return
    if (question.kind === 'position-to-note') {
      onSubmit({ kind: 'position-to-note', text })
      return
    }
    if (question.kind === 'find-all') {
      onSubmit({ kind: 'find-all', positions: selected })
      return
    }
    if (selected.length === 0) return
    const pick = selected[0]
    if (question.kind === 'note-to-position') {
      onSubmit({
        kind: 'note-to-position',
        stringNumber: pick.stringNumber,
        fret: pick.fret,
      })
      return
    }
    onSubmit({
      kind: 'octave',
      stringNumber: pick.stringNumber,
      fret: pick.fret,
    })
  }

  return (
    <div className="trainer-question">
      <p className="trainer-kicker">{labelFor(question.kind)}</p>
      <h3 className="trainer-prompt">{question.prompt}</h3>
      {timed && !feedback ? (
        <p className="trainer-timer" aria-live="polite">
          {secondsLeft}s remaining
        </p>
      ) : null}

      {question.kind === 'position-to-note' ? (
        <form
          className="trainer-note-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <label htmlFor={inputId}>
            <span>Note name</span>
            <input
              id={inputId}
              value={text}
              autoComplete="off"
              autoFocus
              spellCheck={false}
              disabled={Boolean(feedback)}
              placeholder="e.g. F# or Bb"
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          {!feedback ? (
            <button type="submit" className="ui-btn ui-btn-primary" disabled={!text.trim()}>
              Check
            </button>
          ) : null}
        </form>
      ) : (
        <>
          <PracticeBoard
            multi={question.kind === 'find-all'}
            selected={selected}
            locked={locked}
            disabled={Boolean(feedback)}
            onChange={setSelected}
          />
          {!feedback ? (
            <div className="trainer-actions">
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                disabled={
                  question.kind === 'find-all' ? selected.length === 0 : selected.length !== 1
                }
                onClick={submit}
              >
                {question.kind === 'find-all' ? 'Check selection' : 'Check position'}
              </button>
              {question.kind === 'find-all' ? (
                <button
                  type="button"
                  className="ui-btn ui-btn-ghost"
                  onClick={() => setSelected([])}
                >
                  Clear taps
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      {feedback ? (
        <div
          className={feedback.correct ? 'trainer-feedback is-correct' : 'trainer-feedback is-wrong'}
          role="status"
        >
          <p>{feedback.message}</p>
          {feedback.expected && !feedback.correct ? (
            <p className="trainer-expected">Expected: {feedback.expected}</p>
          ) : null}
          <button type="button" className="ui-btn ui-btn-primary" onClick={onContinue}>
            Continue
          </button>
        </div>
      ) : null}
    </div>
  )
}

function labelFor(kind: Question['kind']): string {
  if (kind === 'position-to-note') return 'Position → note'
  if (kind === 'note-to-position') return 'Note → position'
  if (kind === 'find-all') return 'Find all'
  return 'Octave'
}
