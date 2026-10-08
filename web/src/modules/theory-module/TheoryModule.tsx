import { Link, Navigate, useParams } from 'react-router-dom'
import { FretboardMemorization } from './FretboardMemorization.tsx'
import { groupTopicsByUnit } from './groupTopics.ts'
import { Lesson } from './Lesson.tsx'
import { isTheoryPractice, isTheoryTopicOpenable } from './openTopics.ts'
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

export function TheoryModule() {
  const { topicId } = useParams<{ topicId?: string }>()
  const active = topicId ? getTopic(topicId) : null
  const lessonSource = topicId ? lessonSourceFor(topicId) : undefined
  const isPractice = topicId ? isTheoryPractice(topicId) : false

  if (topicId && !active) {
    return <Navigate to="/theory" replace />
  }

  if (topicId && active && !lessonSource && !isPractice) {
    return <Navigate to="/theory" replace />
  }

  if (active && (lessonSource || isPractice)) {
    return (
      <section className="theory-module" id="panel-theory" aria-label="Theory">
        <Link className="theory-back" to="/theory">
          Curriculum
        </Link>
        {topicId === 'fretboard-memorization' ? (
          <FretboardMemorization />
        ) : lessonSource ? (
          <Lesson source={lessonSource} />
        ) : null}
      </section>
    )
  }

  const units = groupTopicsByUnit(THEORY_TOPICS)

  return (
    <section className="theory-module" id="panel-theory" aria-label="Theory">
      <p className="theory-curriculum-lede">
        Progressive guitar theory: foundations and the neck develop together. Open a topic when
        its prerequisites are solid. Full plan: <code>curriculum.md</code>.
      </p>
      <ol className="theory-map">
        {units.map((group) => (
          <li key={group.unit} className="theory-unit-group">
            <div className="theory-unit">{group.unit}</div>
            <ol className="theory-unit-topics">
              {group.topics.map((topic) => {
                const topicNumber = THEORY_TOPICS.findIndex((item) => item.id === topic.id) + 1
                const openable = isTheoryTopicOpenable(topic.id)

                return (
                  <li className="theory-topic" key={topic.id}>
                    <span className="theory-index">{topicNumber}</span>
                    <div>
                      <h2>
                        {openable ? (
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
                      {!openable ? <p className="theory-pending">Lesson not written yet.</p> : null}
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
