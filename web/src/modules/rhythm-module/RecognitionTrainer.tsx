import { useMemo, useRef, useState } from 'react'
import { getMetronomeEngine } from './audio/engine.ts'
import { BeatGrid } from './BeatGrid.tsx'
import { StaffNotation } from './StaffNotation.tsx'
import { usePracticeControls } from './usePracticeControls.ts'
import { useRhythmKeys } from './useRhythmKeys.ts'
import {
  barTicks,
  beatTicks,
  beatsPerBar,
  slotTicks,
  SUBDIVISION_PARTS,
  subdivisionName,
} from './theory/duration.ts'
import { evaluateTaps, onsetMs, toleranceMs } from './theory/accuracy.ts'
import { DIFFICULTIES, type Difficulty } from './theory/generate.ts'
import { onsets, patternWords } from './theory/pattern.ts'
import {
  generateQuestion,
  type QuestionConfig,
  type QuestionKind,
  type RecognitionQuestion,
} from './theory/questions.ts'
import { syllables } from './theory/grid.ts'
import { buildPatternSpec } from './theory/spec.ts'

type Stage = 'setup' | 'listen' | 'answer' | 'reveal'

const KIND_OPTIONS: { id: QuestionKind; label: string }[] = [
  { id: 'subdivision', label: 'Identify subdivision' },
  { id: 'transition', label: 'Hear a transition' },
  { id: 'mixed', label: 'Mixed rhythm' },
  { id: 'rests', label: 'Spot a rest' },
  { id: 'notation', label: 'Match the notation' },
  { id: 'tap', label: 'Tap it back' },
]

export function RecognitionTrainer() {
  const { settings, read, update, addStat, playing, start, stop, tapTempo, changeBpm } = usePracticeControls()
  const [difficulty, setDifficulty] = useState<Difficulty>(2)
  const [bars, setBars] = useState(1)
  const [kinds, setKinds] = useState<QuestionKind[]>(['subdivision', 'notation'])
  const [subs, setSubs] = useState<number[]>([1, 2, 4])
  const [questions, setQuestions] = useState(8)
  const [replays, setReplays] = useState(2)
  const [metro, setMetro] = useState(true)
  const [stage, setStage] = useState<Stage>('setup')
  const [queue, setQueue] = useState<RecognitionQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)
  const [left, setLeft] = useState(2)
  const [score, setScore] = useState({ correct: 0, answered: 0 })
  const [tapReport, setTapReport] = useState<string | null>(null)
  const taps = useRef<number[]>([])
  const originRef = useRef(0)

  const question = queue[index] ?? null

  function config(): QuestionConfig {
    return {
      signature: settings.signature,
      bpm: settings.bpm,
      bars,
      difficulty,
      subdivisions: subs.filter((parts) => slotTicks(settings.signature, parts)),
      kinds: kinds.length ? kinds : ['subdivision'],
      metronomeAudible: metro,
      replays,
    }
  }

  function begin() {
    const built = Array.from({ length: questions }, () => generateQuestion(config()))
    setQueue(built)
    setIndex(0)
    setScore({ correct: 0, answered: 0 })
    setChoice(null)
    setTapReport(null)
    setLeft(replays)
    setStage('listen')
  }

  function playQuestion(item: RecognitionQuestion) {
    const mode = metro ? 'both' : 'rhythm'
    start(buildPatternSpec(read, item.pattern, mode, false), () => {
      if (item.kind === 'tap') gradeTap(item)
      else setStage('answer')
    })
    if (item.kind === 'tap') {
      taps.current = []
      const originTick = settings.countInBars * barTicks(item.pattern.signature)
      originRef.current = getMetronomeEngine().timeOfTick(originTick) ?? getMetronomeEngine().currentTime()
      setStage('listen')
    }
  }

  function gradeTap(item: RecognitionQuestion) {
    const expected = onsetMs(onsets(item.pattern), settings.bpm, beatTicks(item.pattern.signature))
    const tapsMs = taps.current.map((time) => (time - originRef.current) * 1000 - settings.latencyMs)
    const beat = beatTicks(item.pattern.signature)
    const subdiv = Math.min(...item.pattern.notes.map((note) => note.ticks), beat)
    const report = evaluateTaps(expected, tapsMs, toleranceMs(settings.bpm, subdiv, beat, difficulty))
    const ok = report.accuracy >= 0.7 && report.extras <= 1
    setTapReport(
      `${(report.accuracy * 100).toFixed(0)}% · mean error ${report.meanAbsMs.toFixed(0)} ms · ${report.missed} missed`,
    )
    finish(ok)
  }

  function finish(correct: boolean) {
    setScore((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      answered: current.answered + 1,
    }))
    addStat({
      at: new Date().toISOString(),
      kind: 'recognition',
      accuracy: correct ? 1 : 0,
      deviationMs: 0,
    })
    setStage('reveal')
  }

  function submit() {
    if (!question || choice === null) return
    finish(choice === question.answerId)
  }

  function next() {
    stop()
    if (index + 1 >= queue.length) {
      setStage('setup')
      return
    }
    setIndex((value) => value + 1)
    setChoice(null)
    setTapReport(null)
    setLeft(replays)
    setStage('listen')
  }

  useRhythmKeys({
    toggle: () => {
      if (!question) return
      if (playing) stop()
      else if (stage === 'listen' || stage === 'answer') {
        if (left <= 0 && stage !== 'listen') return
        if (stage !== 'listen') setLeft((value) => Math.max(0, value - 1))
        playQuestion(question)
      }
    },
    faster: () => changeBpm(1),
    slower: () => changeBpm(-1),
    tapTempo,
    restart: () => question && playQuestion(question),
    next,
    previous: () => setIndex((value) => Math.max(0, value - 1)),
    stop,
    tap: (audioTime) => {
      if (question?.kind === 'tap' && stage === 'listen') taps.current.push(audioTime)
    },
  }, question?.kind === 'tap' && stage === 'listen')

  const counts = useMemo(() => {
    if (!question) return []
    const parts = 4
    return syllables(beatsPerBar(question.pattern.signature), parts, beatTicks(question.pattern.signature))
  }, [question])

  if (stage === 'setup') {
    return (
      <div className="rh-panel">
        <p className="rh-help">Hear a rhythm, then identify or reproduce it. The answer stays hidden until you submit.</p>
        <div className="rh-split">
          <label className="rh-field">
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value) as Difficulty)}>
              {DIFFICULTIES.map((item) => (
                <option key={item.level} value={item.level}>
                  Level {item.level}: {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="rh-field">
            <span>Bars</span>
            <input type="number" min={1} max={4} value={bars} onChange={(event) => setBars(Number(event.target.value) || 1)} />
          </label>
          <label className="rh-field">
            <span>Questions</span>
            <input type="number" min={3} max={20} value={questions} onChange={(event) => setQuestions(Number(event.target.value) || 3)} />
          </label>
          <label className="rh-field">
            <span>Replays</span>
            <input type="number" min={0} max={5} value={replays} onChange={(event) => setReplays(Number(event.target.value))} />
          </label>
          <label className="rh-field">
            <span>BPM</span>
            <input type="number" min={20} max={300} value={settings.bpm} onChange={(event) => update({ bpm: Number(event.target.value) })} />
          </label>
        </div>
        <label className="rh-check">
          <input type="checkbox" checked={metro} onChange={(event) => setMetro(event.target.checked)} />
          Keep metronome clicks audible
        </label>
        <fieldset className="rh-fieldset">
          <legend>Exercise types</legend>
          <div className="rh-chip-row">
            {KIND_OPTIONS.map((item) => {
              const active = kinds.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={active ? 'rh-chip is-active' : 'rh-chip'}
                  onClick={() =>
                    setKinds((current) =>
                      current.includes(item.id) ? current.filter((kind) => kind !== item.id) : [...current, item.id],
                    )
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </fieldset>
        <fieldset className="rh-fieldset">
          <legend>Subdivisions</legend>
          <div className="rh-chip-row">
            {SUBDIVISION_PARTS.filter((parts) => slotTicks(settings.signature, parts)).map((parts) => {
              const active = subs.includes(parts)
              return (
                <button
                  key={parts}
                  type="button"
                  className={active ? 'rh-chip is-active' : 'rh-chip'}
                  onClick={() =>
                    setSubs((current) =>
                      current.includes(parts) ? current.filter((item) => item !== parts) : [...current, parts],
                    )
                  }
                >
                  {subdivisionName(parts, beatTicks(settings.signature))}
                </button>
              )
            })}
          </div>
        </fieldset>
        {score.answered ? (
          <p className="rh-position">
            Last run: {score.correct}/{score.answered} ({Math.round((score.correct / score.answered) * 100)}%)
          </p>
        ) : null}
        <button type="button" className="rh-btn rh-btn-primary" onClick={begin} disabled={!kinds.length || !subs.length}>
          Start ear training
        </button>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="rh-panel">
      <div className="rh-transport">
        <p className="rh-position">
          Question {index + 1} of {queue.length} · {score.correct} correct
        </p>
        <div className="rh-actions">
          <button
            type="button"
            className="rh-btn rh-btn-primary"
            disabled={playing || (stage !== 'listen' && left <= 0)}
            onClick={() => {
              if (stage !== 'listen') setLeft((value) => Math.max(0, value - 1))
              playQuestion(question)
            }}
          >
            {playing ? 'Playing…' : stage === 'listen' ? 'Play' : `Replay (${left} left)`}
          </button>
          <button type="button" className="rh-btn" onClick={() => { stop(); setStage('setup') }}>
            Exit
          </button>
        </div>
      </div>
      <p className="rh-card-prompt">{question.prompt}</p>

      {stage === 'listen' && question.kind === 'tap' ? (
        <>
          <p className="rh-help">Listen, then tap <kbd>{settings.tapKey.toUpperCase()}</kbd> or the pad with the metronome.</p>
          <button type="button" className="rh-pad" onPointerDown={() => taps.current.push(getMetronomeEngine().currentTime())}>
            Tap
          </button>
        </>
      ) : null}

      {stage === 'answer' ? (
        <div className="rh-chip-row">
          {question.choices.map((item) => (
            <button
              key={item.id}
              type="button"
              className={choice === item.id ? 'rh-chip is-active' : 'rh-chip'}
              onClick={() => setChoice(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {stage === 'answer' && question.kind === 'notation' ? (
        <div className="rh-options">
          {question.choices.map((item) =>
            item.pattern ? (
              <button
                key={item.id}
                type="button"
                className={choice === item.id ? 'rh-option is-active' : 'rh-option'}
                onClick={() => setChoice(item.id)}
              >
                <StaffNotation signature={item.pattern.signature} notes={item.pattern.notes} bars={item.pattern.bars} />
              </button>
            ) : null,
          )}
        </div>
      ) : null}

      {stage === 'answer' ? (
        <button type="button" className="rh-btn rh-btn-primary" disabled={choice === null} onClick={submit}>
          Submit
        </button>
      ) : null}

      {stage === 'reveal' ? (
        <div className="rh-stage">
          <p className={choice === question.answerId || tapReport ? 'rh-feedback is-ok' : 'rh-feedback is-miss'}>
            {tapReport
              ? tapReport
              : choice === question.answerId
                ? 'Correct.'
                : `Incorrect. Answer: ${question.choices.find((item) => item.id === question.answerId)?.label ?? question.answerId}`}
          </p>
          <p className="rh-help">{patternWords(question.pattern)}</p>
          <p className="rh-help">Count: {counts.join(' ')}</p>
          <BeatGrid signature={question.pattern.signature} parts={4} activeSlot={-1} />
          <div className="rh-scroll">
            <StaffNotation signature={question.pattern.signature} notes={question.pattern.notes} bars={question.pattern.bars} />
          </div>
          <div className="rh-actions">
            <button type="button" className="rh-btn" onClick={() => playQuestion(question)}>
              Hear again
            </button>
            <button type="button" className="rh-btn rh-btn-primary" onClick={next}>
              {index + 1 >= queue.length ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
