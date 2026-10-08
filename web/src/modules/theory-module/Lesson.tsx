import { Markdown } from './Markdown.tsx'

type LessonProps = {
  source: string
}

export function Lesson({ source }: LessonProps) {
  return <Markdown source={source} />
}
