import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getStudyMode, setStudyMode, subscribeStudyMode } from '../../lib/studyMode.ts'
import { Flashcards } from '../flashcards-module/index.ts'
import { FretboardMemorization } from './FretboardMemorization.tsx'
import { CurriculumNav } from './CurriculumNav.tsx'
import { groupTopicsByUnit } from './groupTopics.ts'
import { Lesson } from './Lesson.tsx'
import { PracticePanel } from './PracticePanel.tsx'
import { isTheoryPractice, isTheoryTopicOpenable } from './openTopics.ts'
import { getTopicFlashcardDeck } from './topicFlashcards.ts'
import { THEORY_TOPICS, getTopic } from './topics.ts'
import './theory.css'

const lessonFiles = import.meta.glob('./lessons/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function lessonSourceFor(topicId: string): string | undefined {
  const topic = getTopic(topicId)
  if (!topic?.lesson) return undefined
  return lessonFiles[`./lessons/${topic.lesson}`]
}

function adjacentTopics(topicId: string) {
  const openable = THEORY_TOPICS.filter((topic) => isTheoryTopicOpenable(topic.id))
  const index = openable.findIndex((topic) => topic.id === topicId)
  return {
    prev: index > 0 ? openable[index - 1] : null,
    next: index >= 0 && index < openable.length - 1 ? openable[index + 1] : null,
    index,
    total: openable.length,
  }
}

export function TheoryModule() {
  const { topicId } = useParams<{ topicId?: string }>()
  const active = topicId ? getTopic(topicId) : null
  const lessonSource = topicId ? lessonSourceFor(topicId) : undefined
  const isPractice = topicId ? isTheoryPractice(topicId) : false
  const [navOpen, setNavOpen] = useState(false)
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [cardsOpen, setCardsOpen] = useState(false)
  const [studyMode, setStudyModeState] = useState(getStudyMode)
  const [collapsedOverrides, setCollapsedOverrides] = useState<Record<string, boolean>>({})
  const flashcardDeck = topicId ? getTopicFlashcardDeck(topicId) : null

  const neighbors = topicId ? adjacentTopics(topicId) : null
  const units = useMemo(() => groupTopicsByUnit(THEORY_TOPICS), [])
  const collapsed = useMemo(() => {
    const next = new Set<string>()
    for (const group of units) {
      const override = collapsedOverrides[group.unit]
      const defaultCollapsed = Boolean(active && group.unit !== active.unit)
      if (override ?? defaultCollapsed) next.add(group.unit)
    }
    return next
  }, [active, collapsedOverrides, units])

  useEffect(() => subscribeStudyMode(() => setStudyModeState(getStudyMode())), [])

  useEffect(() => {
    setCardsOpen(false)
  }, [topicId])

  if (topicId && !active) {
    return <Navigate to="/theory" replace />
  }

  if (topicId && active && !lessonSource && !isPractice) {
    return <Navigate to="/theory" replace />
  }

  function toggleStage(unit: string) {
    setCollapsedOverrides((current) => ({
      ...current,
      [unit]: !collapsed.has(unit) ? true : false,
    }))
  }

  if (active && (lessonSource || isPractice)) {
    return (
      <div
        className={[
          'theory-workspace',
          studyMode ? 'is-study' : '',
          practiceOpen ? 'has-practice' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <aside className="theory-sidebar" aria-label="Curriculum sidebar">
          <CurriculumNav
            activeId={active.id}
            collapsedStages={collapsed}
            onToggleStage={toggleStage}
          />
        </aside>

        {navOpen ? (
          <>
            <button
              type="button"
              className="theory-drawer-backdrop"
              aria-label="Close curriculum"
              onClick={() => setNavOpen(false)}
            />
            <div className="theory-drawer" role="dialog" aria-modal="true" aria-label="Curriculum">
              <div className="theory-drawer-head">
                <p>Curriculum</p>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setNavOpen(false)}>
                  Close
                </button>
              </div>
              <CurriculumNav
                activeId={active.id}
                collapsedStages={collapsed}
                onToggleStage={toggleStage}
                onNavigate={() => setNavOpen(false)}
              />
            </div>
          </>
        ) : null}

        <div className="theory-center">
          <div className="lesson-topbar">
            <button
              type="button"
              className="ui-btn ui-btn-ghost theory-nav-open"
              onClick={() => setNavOpen(true)}
            >
              Lessons
            </button>
            <div className="lesson-crumbs">
              <Link to="/theory">Theory</Link>
              <span aria-hidden="true">/</span>
              <span>{active.unit}</span>
            </div>
            <div className="lesson-top-actions">
              <button
                type="button"
                className="ui-btn ui-btn-ghost"
                onClick={() => setStudyMode(!studyMode)}
              >
                {studyMode ? 'Exit study' : 'Study'}
              </button>
              {flashcardDeck ? (
                <button
                  type="button"
                  className="ui-btn ui-btn-ghost"
                  aria-pressed={cardsOpen}
                  onClick={() => setCardsOpen((value) => !value)}
                >
                  {cardsOpen ? 'Lesson' : 'Flashcards'}
                </button>
              ) : null}
              <button
                type="button"
                className="ui-btn ui-btn-ghost"
                onClick={() => setPracticeOpen((value) => !value)}
              >
                {practiceOpen ? 'Hide tools' : 'Tools'}
              </button>
            </div>
          </div>

          <article className="lesson-reader" id="panel-theory">
            <header className="lesson-header">
              <p className="lesson-kicker">{active.unit}</p>
              <h1>{active.title}</h1>
              <p className="lesson-objective">{active.objectives}</p>
              {neighbors ? (
                <p className="lesson-progress-label">
                  Lesson {neighbors.index + 1} of {neighbors.total}
                </p>
              ) : null}
              <div className="lesson-progress-track" aria-hidden="true">
                <span
                  style={{
                    width: neighbors
                      ? `${Math.round(((neighbors.index + 1) / neighbors.total) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </header>

            {cardsOpen && flashcardDeck ? (
              <div className="lesson-flashcards">
                <p className="lesson-flashcards-lede">
                  Retention drill for this topic. Flip the card, then mark whether you recalled it.
                </p>
                <Flashcards deck={flashcardDeck} hideHeader />
              </div>
            ) : isPractice ? (
              <FretboardMemorization />
            ) : lessonSource ? (
              <Lesson source={lessonSource} omitTitle />
            ) : null}

            {cardsOpen ? null : (
            <nav className="lesson-pager" aria-label="Lesson pager">
              {neighbors?.prev ? (
                <Link
                  className="lesson-pager-link"
                  to={`/theory/${neighbors.prev.id}`}
                  onClick={() => setNavOpen(false)}
                >
                  <span>Previous</span>
                  <strong>{neighbors.prev.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {neighbors?.next ? (
                <Link
                  className="lesson-pager-link is-next"
                  to={`/theory/${neighbors.next.id}`}
                  onClick={() => setNavOpen(false)}
                >
                  <span>Next</span>
                  <strong>{neighbors.next.title}</strong>
                </Link>
              ) : (
                <Link
                  className="lesson-pager-link is-next"
                  to="/theory"
                  onClick={() => setNavOpen(false)}
                >
                  <span>Done for now</span>
                  <strong>Back to curriculum</strong>
                </Link>
              )}
            </nav>
            )}
          </article>
        </div>

        <div className="theory-practice-dock">
          <PracticePanel open={practiceOpen} onClose={() => setPracticeOpen(false)} />
        </div>

        {practiceOpen ? (
          <div className="theory-practice-mobile">
            <button
              type="button"
              className="theory-drawer-backdrop"
              aria-label="Close practice tools"
              onClick={() => setPracticeOpen(false)}
            />
            <PracticePanel
              open={practiceOpen}
              onClose={() => setPracticeOpen(false)}
              variant="sheet"
            />
          </div>
        ) : null}
      </div>
    )
  }

  const openable = THEORY_TOPICS.filter((topic) => isTheoryTopicOpenable(topic.id))

  return (
    <section className="theory-map-page" id="panel-theory" aria-label="Theory curriculum">
      <header className="theory-map-hero">
        <p className="lesson-kicker">Theory curriculum</p>
        <h1>Learn in twelve stages</h1>
        <p>
          Foundations and rhythm first, then intervals, scales, triads, harmony, and improvisation.
          Open any lesson and move through the curriculum at your own pace.
        </p>
        <div className="theory-map-meta">
          <span>{openable.length} lessons</span>
          {openable[0] ? <Link to={`/theory/${openable[0].id}`}>Start</Link> : null}
        </div>
      </header>

      <ol className="theory-map">
        {units.map((group) => (
          <li key={group.unit} className="theory-unit-group">
            <div className="theory-unit">{group.unit}</div>
            <ol className="theory-unit-topics">
              {group.topics.map((topic) => {
                const topicNumber = THEORY_TOPICS.findIndex((item) => item.id === topic.id) + 1
                const openableTopic = isTheoryTopicOpenable(topic.id)

                return (
                  <li className="theory-topic" key={topic.id}>
                    <span className="theory-index">{topicNumber}</span>
                    <div>
                      <h2>
                        {openableTopic ? (
                          <Link className="theory-topic-link" to={`/theory/${topic.id}`}>
                            {topic.title}
                          </Link>
                        ) : (
                          topic.title
                        )}
                      </h2>
                      <p>
                        <span className="theory-meta-label">Scope.</span> {topic.scope}
                      </p>
                      <p>
                        <span className="theory-meta-label">Prerequisites.</span>{' '}
                        {topic.prerequisites}
                      </p>
                      <p>
                        <span className="theory-meta-label">Objectives.</span> {topic.objectives}
                      </p>
                      {!openableTopic ? (
                        <p className="theory-pending">Lesson not written yet.</p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  )
}
