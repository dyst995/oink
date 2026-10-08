import { NavLink } from 'react-router-dom'
import { groupTopicsByUnit } from '../modules/theory-module/groupTopics.ts'
import { isTheoryTopicOpenable } from '../modules/theory-module/openTopics.ts'
import { THEORY_TOPICS } from '../modules/theory-module/topics.ts'

export function TheorySidebar() {
  const units = groupTopicsByUnit(THEORY_TOPICS)

  return (
    <aside className="theory-sidebar" aria-label="Theory topics">
      <NavLink
        to="/theory"
        end
        className={({ isActive }) =>
          isActive ? 'theory-sidebar-link is-active' : 'theory-sidebar-link'
        }
      >
        Curriculum
      </NavLink>

      {units.map((group) => (
        <div key={group.unit} className="theory-sidebar-unit-block">
          <p className="theory-sidebar-unit">{group.unit}</p>
          {group.topics.map((topic) => {
            const openable = isTheoryTopicOpenable(topic.id)

            if (!openable) {
              return (
                <span key={topic.id} className="theory-sidebar-link is-disabled">
                  {topic.title}
                </span>
              )
            }

            return (
              <NavLink
                key={topic.id}
                to={`/theory/${topic.id}`}
                className={({ isActive }) =>
                  isActive ? 'theory-sidebar-link is-active' : 'theory-sidebar-link'
                }
              >
                {topic.title}
              </NavLink>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
