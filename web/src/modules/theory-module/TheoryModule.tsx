import { useState } from 'react'
import pitchLesson from './lessons/01-pitch-octave-pitch-class.md?raw'
import { FretboardMemorization } from './FretboardMemorization.tsx'
import { Lesson } from './Lesson.tsx'
import { THEORY_TOPICS, getTopic } from './topics.ts'
import './theory.css'

const LESSONS: Record<string, string> = {
  'pitch-octave-pitch-class': pitchLesson,
}

const PRACTICES = new Set(['fretboard-memorization'])

export function TheoryModule() {
  const [topicId, setTopicId] = useState<string | null>(null)
  const active = topicId ? getTopic(topicId) : null
  const lessonSource = topicId ? LESSONS[topicId] : undefined
  const isPractice = topicId ? PRACTICES.has(topicId) : false

  if (active && (lessonSource || isPractice)) {
    return (
      <section className="theory-module" id="panel-theory" role="tabpanel" aria-labelledby="tab-theory">
        <button className="theory-back" type="button" onClick={() => setTopicId(null)}>
          Curriculum
        </button>
        {topicId === 'fretboard-memorization' ? (
          <FretboardMemorization />
        ) : lessonSource ? (
          <Lesson source={lessonSource} />
        ) : null}
      </section>
    )
  }

  let lastUnit = ''

  return (
    <section className="theory-module" id="panel-theory" role="tabpanel" aria-labelledby="tab-theory">
      <p className="theory-curriculum-lede">
        Ordered path from pitch language to fretboard harmony. Open a topic only when its
        prerequisites are done. Full plan: <code>curriculum.md</code>.
      </p>
      <ol className="theory-map">
        {THEORY_TOPICS.map((topic, index) => {
          const showUnit = topic.unit !== lastUnit
          lastUnit = topic.unit
          const openable = Boolean(LESSONS[topic.id]) || PRACTICES.has(topic.id)

          return (
            <li className="theory-topic" key={topic.id}>
              {showUnit ? <div className="theory-unit">{topic.unit}</div> : null}
              <span className="theory-index">{index + 1}</span>
              <div>
                <h2>
                  {openable ? (
                    <button
                      className="theory-topic-link"
                      type="button"
                      onClick={() => setTopicId(topic.id)}
                    >
                      {topic.title}
                    </button>
                  ) : (
                    topic.title
                  )}
                </h2>
                <p>
                  <span className="theory-meta-label">Scope.</span> {topic.scope}
                </p>
                <p>
                  <span className="theory-meta-label">Prerequisites.</span> {topic.prerequisites}
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
    </section>
  )
}
