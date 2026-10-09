import { useCallback, useState } from 'react'
import { TrainerConfigPanel } from './TrainerConfig.tsx'
import { TrainerQuestionView } from './TrainerQuestion.tsx'
import { TrainerSummary } from './TrainerSummary.tsx'
import {
  advanceSession,
  createIdleSession,
  endSession,
  gradeAnswer,
  startSession,
} from './session.ts'
import {
  DEFAULT_CONFIG,
  type AnswerPayload,
  type AnswerResult,
  type TrainerConfig,
  type TrainerSession,
} from './types.ts'
import './trainer.css'

export function FretboardTrainer() {
  const [config, setConfig] = useState<TrainerConfig>(DEFAULT_CONFIG)
  const [session, setSession] = useState<TrainerSession>(() => createIdleSession(DEFAULT_CONFIG))
  const [feedback, setFeedback] = useState<AnswerResult | null>(null)

  function begin() {
    setFeedback(null)
    setSession(startSession(config))
  }

  const handleTimeout = useCallback(() => {
    setSession((current) => {
      if (current.status !== 'active' || !current.current) return current
      const graded = gradeAnswer(current, { kind: 'position-to-note', text: '' }, { timedOut: true })
      setFeedback(graded.result)
      return graded.session
    })
  }, [])

  function handleSubmit(payload: AnswerPayload) {
    setSession((current) => {
      const graded = gradeAnswer(current, payload)
      setFeedback(graded.result)
      return graded.session
    })
  }

  function handleContinue() {
    setFeedback(null)
    setSession((current) => advanceSession(current))
  }

  function handleEnd() {
    setFeedback(null)
    setSession((current) => endSession(current))
  }

  if (session.status === 'summary') {
    return (
      <div className="fretboard-trainer">
        <TrainerSummary
          session={session}
          onAgain={begin}
          onConfigure={() => setSession(createIdleSession(config))}
        />
      </div>
    )
  }

  if (session.status === 'active' && session.current) {
    const remaining = Math.max(session.queue.length - session.currentIndex, 0)
    return (
      <div className="fretboard-trainer">
        <div className="trainer-session-bar">
          <p>
            Question {session.currentIndex + 1} · {session.correctCount} correct ·{' '}
            {session.incorrectCount} incorrect · {remaining} left in queue
          </p>
          <button type="button" className="ui-btn ui-btn-ghost" onClick={handleEnd}>
            End session
          </button>
        </div>
        <TrainerQuestionView
          key={session.current.id}
          question={session.current}
          timed={session.config.timed}
          timeLimitSec={session.config.timeLimitSec}
          onSubmit={handleSubmit}
          onTimeout={handleTimeout}
          feedback={feedback}
          onContinue={handleContinue}
        />
      </div>
    )
  }

  return (
    <div className="fretboard-trainer">
      <TrainerConfigPanel config={config} onChange={setConfig} onStart={begin} />
    </div>
  )
}
