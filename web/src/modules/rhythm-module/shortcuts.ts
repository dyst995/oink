export type RhythmAction = 'toggle' | 'faster' | 'slower' | 'tap-tempo' | 'restart' | 'next' | 'previous' | 'stop'

export function rhythmAction(key: string): RhythmAction | null {
  if (key === ' ' || key === 'Spacebar') return 'toggle'
  if (key === 'ArrowUp') return 'faster'
  if (key === 'ArrowDown') return 'slower'
  if (key === 't' || key === 'T') return 'tap-tempo'
  if (key === 'r' || key === 'R') return 'restart'
  if (key === 'ArrowRight') return 'next'
  if (key === 'ArrowLeft') return 'previous'
  if (key === 'Escape') return 'stop'
  return null
}

export function shortcutBlocked(target: { tagName?: string; isContentEditable?: boolean } | null): boolean {
  if (!target) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON' || tag === 'A') return true
  return target.isContentEditable === true
}

export function typingTarget(target: { tagName?: string; isContentEditable?: boolean } | null): boolean {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable === true
}
