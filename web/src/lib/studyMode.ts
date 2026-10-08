let studyMode = false

export function getStudyMode() {
  return studyMode
}

export function setStudyMode(enabled: boolean) {
  studyMode = enabled
  window.dispatchEvent(new CustomEvent('unfret-study'))
}

export function subscribeStudyMode(listener: () => void) {
  window.addEventListener('unfret-study', listener)
  return () => window.removeEventListener('unfret-study', listener)
}
