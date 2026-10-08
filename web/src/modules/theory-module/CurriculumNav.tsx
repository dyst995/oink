import { NavLink } from 'react-router-dom'
import { groupTopicsByUnit } from './groupTopics.ts'
import { isTheoryTopicOpenable } from './openTopics.ts'
import { THEORY_TOPICS, type TheoryTopic } from './topics.ts'

type CurriculumNavProps = {
  activeId?: string
  collapsedStages?: Set<string>
  onToggleStage?: (unit: string) => void
  onNavigate?: () => void
}

export function CurriculumNav({
  activeId,
  collapsedStages,
  onToggleStage,
  onNavigate,
}: CurriculumNavProps) {
  const units = groupTopicsByUnit(THEORY_TOPICS)

  return (
    <nav className="curriculum-nav" aria-label="Curriculum">
      <div className="curriculum-nav-head">
        <p className="curriculum-nav-title">Curriculum</p>
        <p className="curriculum-nav-sub">Twelve stages · theory and neck</p>
      </div>

      <ol className="curriculum-nav-stages">
        {units.map((group) => {
          const total = group.topics.length
          const collapsed = collapsedStages?.has(group.unit) ?? false

          return (
            <li key={group.unit} className="curriculum-stage">
              <button
                type="button"
                className="curriculum-stage-toggle"
                aria-expanded={!collapsed}
                onClick={() => onToggleStage?.(group.unit)}
              >
                <span>{group.unit}</span>
                <span className="curriculum-stage-count">{total}</span>
              </button>

              {collapsed ? null : (
                <ol className="curriculum-stage-lessons">
                  {group.topics.map((topic: TheoryTopic) => {
                    const openable = isTheoryTopicOpenable(topic.id)
                    const active = topic.id === activeId

                    if (!openable) {
                      return (
                        <li key={topic.id}>
                          <span className="curriculum-lesson is-disabled">{topic.title}</span>
                        </li>
                      )
                    }

                    return (
                      <li key={topic.id}>
                        <NavLink
                          to={`/theory/${topic.id}`}
                          onClick={() => onNavigate?.()}
                          className={() =>
                            ['curriculum-lesson', active ? 'is-active' : '']
                              .filter(Boolean)
                              .join(' ')
                          }
                        >
                          <span className="curriculum-lesson-title">{topic.title}</span>
                        </NavLink>
                      </li>
                    )
                  })}
                </ol>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
