import { Markdown } from './Markdown.tsx'

type LessonProps = {
  source: string
  omitTitle?: boolean
}

export function Lesson({ source, omitTitle = false }: LessonProps) {
  return <Markdown source={source} omitTitle={omitTitle} />
}
