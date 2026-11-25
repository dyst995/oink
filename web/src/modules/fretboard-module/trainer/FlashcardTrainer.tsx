import { useCallback, useEffect, useRef, useState } from 'react'
import { missedCards } from './engine.ts'
import {
  advanceSession,
  answerFromSelection,
  chooseAnswer,
  currentCard,
  gradeSession,
  restartSession,
  revealCard,
  startPractice,
  startReview,
  type PlaySession,
} from './session.ts'
import { shortcutAction, shortcutBlocked } from './shortcuts.ts'
import { loadTrainerState, saveTrainerState } from './storage.ts'
import { TrainerPlay } from './TrainerPlay.tsx'
import { TrainerSetup } from './TrainerSetup.tsx'
import { TrainerSummary } from './TrainerSummary.tsx'
import type { MissMemory, Selection, TrainerSettings } from './types.ts'

type Phase = 'setup' | 'play' | 'summary'

export function FlashcardTrainer() {
  const [settings, setSettings] = useState<TrainerSettings>(() => loadTrainerState().settings)
  const [memory, setMemory] = useState<MissMemory>(() => loadTrainerState().memory)
  const [phase, setPhase] = useState<Phase>('setup')
  const [session, setSession] = useState<PlaySession | null>(null)
  const sessionRef = useRef<PlaySession | null>(null)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const commit = useCallback((next: PlaySession) => {
    setSession(next)
    setMemory(next.memory)
    saveTrainerState(next.settings, next.memory)
  }, [])

  const goNext = useCallback(
    (current: PlaySession) => {
      const result = advanceSession(current, performance.now())
      if (result.type === 'summary') {
        setSession(result.session)
        setPhase('summary')
        return
      }
      commit(result.session)
    },
    [commit],
  )

  function begin(nextSettings: TrainerSettings, nextMemory: MissMemory) {
    const started = startPractice(nextSettings, nextMemory, performance.now())
    if (!started.ok) return
    setSession(started.session)
    setMemory(started.session.memory)
    setPhase('play')
  }

  function endSession() {
    const current = sessionRef.current
    if (!current || current.attempts.length === 0) {
      setPhase('setup')
      return
    }
    setPhase('summary')
  }

  useEffect(() => {
    if (phase !== 'play') return
    function onKey(event: KeyboardEvent) {
      const target = event.target
      const blocked =
        target instanceof HTMLElement
          ? shortcutBlocked({ tagName: target.tagName, isContentEditable: target.isContentEditable })
          : false
      if (blocked) return
      const action = shortcutAction(event.key)
      const current = sessionRef.current
      if (!action || !current) return
      event.preventDefault()
      if (action === 'exit') {
        if (current.attempts.length === 0) setPhase('setup')
        else setPhase('summary')
        return
      }
      if (action === 'reveal') {
        commit(revealCard(current))
        return
      }
      if (action === 'incorrect') {
        commit(gradeSession(current, { kind: 'self', correct: false }, performance.now()))
        return
      }
      if (action === 'correct') {
        commit(gradeSession(current, { kind: 'self', correct: true }, performance.now()))
        return
      }
      if (action === 'next') {
        if (current.status === 'graded') goNext(current)
        return
      }
      if (current.status === 'graded') {
        goNext(current)
        return
      }
      const card = currentCard(current)
      if (!card || current.status !== 'asking') return
      const answer = answerFromSelection(card, current.selection)
      if (!answer) return
      commit(gradeSession(current, answer, performance.now()))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, commit, goNext])

  const asking = phase === 'play' && session?.status === 'asking'
  const graded = phase === 'play' && session?.status === 'graded'
  const cardIndex = session?.index
  const startedAt = session?.startedAt
  const timeLimit = session?.settings.timeLimitSec
  const trackTime = session?.settings.trackTime === true
  const autoAdvance = session?.settings.autoAdvance === true

  useEffect(() => {
    if (!asking || !trackTime || timeLimit == null || startedAt == null || cardIndex == null) return
    const wait = timeLimit * 1000 - (performance.now() - startedAt)
    const id = window.setTimeout(() => {
      const current = sessionRef.current
      if (!current || current.status !== 'asking' || current.index !== cardIndex) return
      commit(gradeSession(current, { kind: 'timeout' }, performance.now()))
    }, Math.max(0, wait))
    return () => window.clearTimeout(id)
  }, [asking, trackTime, timeLimit, startedAt, cardIndex, commit])

  useEffect(() => {
    if (!graded || !autoAdvance || cardIndex == null) return
    const id = window.setTimeout(() => {
      const current = sessionRef.current
      if (!current || current.status !== 'graded' || current.index !== cardIndex) return
      goNext(current)
    }, 1100)
    return () => window.clearTimeout(id)
  }, [graded, autoAdvance, cardIndex, goNext])

  function updateSettings(next: TrainerSettings) {
    setSettings(next)
    saveTrainerState(next, memory)
  }

  function choose(selection: Selection | null) {
    setSession((current) => (current ? chooseAnswer(current, selection) : current))
  }

  if (phase === 'play' && session) {
    return (
      <TrainerPlay
        session={session}
        onSelection={choose}
        onSubmit={() => {
          const card = currentCard(session)
          if (!card) return
          const answer = answerFromSelection(card, session.selection)
          if (!answer) return
          commit(gradeSession(session, answer, performance.now()))
        }}
        onReveal={() => commit(revealCard(session))}
        onSelfGrade={(correct) => commit(gradeSession(session, { kind: 'self', correct }, performance.now()))}
        onNext={() => goNext(session)}
        onEnd={endSession}
      />
    )
  }

  if (phase === 'summary' && session) {
    return (
      <TrainerSummary
        attempts={session.attempts}
        trackTime={session.settings.trackTime}
        onRestart={() => {
          const next = restartSession(session, performance.now())
          setSession(next)
          setPhase('play')
        }}
        onNewSession={() => begin(session.settings, session.memory)}
        onReview={() => {
          const cards = missedCards(session.attempts)
          if (cards.length === 0) return
          setSession(startReview(cards, session.settings, session.memory, performance.now()))
          setPhase('play')
        }}
        onWeak={() => begin({ ...session.settings, prioritizeMisses: true }, session.memory)}
        onConfigure={() => setPhase('setup')}
      />
    )
  }

  return (
    <TrainerSetup settings={settings} memory={memory} onChange={updateSettings} onStart={() => begin(settings, memory)} />
  )
}
