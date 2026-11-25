export type ShortcutAction = 'reveal' | 'submit' | 'next' | 'incorrect' | 'correct' | 'exit'

export function shortcutAction(key: string): ShortcutAction | null {
  if (key === ' ' || key === 'Spacebar') return 'reveal'
  if (key === 'Enter') return 'submit'
  if (key === 'ArrowRight') return 'next'
  if (key === '1') return 'incorrect'
  if (key === '2') return 'correct'
  if (key === 'Escape') return 'exit'
  return null
}

/** Shortcuts stay off while a field or control has focus, so they don't fight typing or buttons. */
export function shortcutBlocked(target: { tagName?: string; isContentEditable?: boolean } | null): boolean {
  if (!target) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON' || tag === 'A') {
    return true
  }
  return target.isContentEditable === true
}
