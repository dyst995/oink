import pitchLesson from './lessons/01-pitch-octave-pitch-class.md?raw'
import { FretboardMemorization } from './FretboardMemorization.tsx'
import { groupTopicsByUnit } from './groupTopics.ts'
import { Lesson } from './Lesson.tsx'
import { isTheoryPractice, isTheoryTopicOpenable } from './openTopics.ts'
import { THEORY_TOPICS, getTopic } from './topics.ts'
import './theory.css'

const LESSONS: Record<string, string> = {
  'pitch-octave-pitch-class': pitchLesson,
}

type TheoryModuleProps = {
  topicId: string | null
  onTopicChange: (topicId: string | null) => void
}

export function TheoryModule({ topicId, onTopicChange }: TheoryModuleProps) {
  const active = topicId ? getTopic(topicId) : null
  const lessonSource = topicId ? LESSONS[topicId] : undefined
  const isPractice = topicId ? isTheoryPractice(topicId) : false

  if (active && (lessonSource || isPractice)) {
    return (
      <section className="theory-module" id="panel-theory" aria-label="Theory">
        <button className="theory-back" type="button" onClick={() => onTopicChange(null)}>
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

  const units = groupTopicsByUnit(THEORY_TOPICS)

  return (
    <section className="theory-module" id="panel-theory" aria-label="Theory">
      <p className="theory-curriculum-lede">
        Ordered path from pitch language to fretboard harmony. Open a topic only when its
        prerequisites are done. Full plan: <code>curriculum.md</code>.
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
                          <button
                            className="theory-topic-link"
                            type="button"
                            onClick={() => onTopicChange(topic.id)}
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
