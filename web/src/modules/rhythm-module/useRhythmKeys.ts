import { useEffect, useRef } from 'react'
import { getMetronomeEngine } from './audio/engine.ts'
import { rhythmAction, shortcutBlocked, typingTarget } from './shortcuts.ts'
import { useRhythm } from './MetronomeContext.tsx'

type KeyHandlers = {
  toggle: () => void
  faster: () => void
  slower: () => void
  tapTempo: () => void
  restart: () => void
  next: () => void
  previous: () => void
  stop: () => void
  tap?: (audioTime: number) => void
}

export function useRhythmKeys(handlers: KeyHandlers, listening = false) {
  const { settings } = useRhythm()
  const handlersRef = useRef(handlers)
  const listeningRef = useRef(listening)
  const tapKeyRef = useRef(settings.tapKey)

  useEffect(() => {
    handlersRef.current = handlers
    listeningRef.current = listening
    tapKeyRef.current = settings.tapKey
  }, [handlers, listening, settings.tapKey])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as { tagName?: string; isContentEditable?: boolean } | null
      const tapKey = tapKeyRef.current.toLowerCase()
      if (listeningRef.current && event.key.toLowerCase() === tapKey && !typingTarget(target)) {
        event.preventDefault()
        handlersRef.current.tap?.(getMetronomeEngine().currentTime())
        return
      }
      if (shortcutBlocked(target)) return
      const action = rhythmAction(event.key)
      if (!action) return
      event.preventDefault()
      const current = handlersRef.current
      if (action === 'toggle') current.toggle()
      if (action === 'faster') current.faster()
      if (action === 'slower') current.slower()
      if (action === 'tap-tempo') current.tapTempo()
      if (action === 'restart') current.restart()
      if (action === 'next') current.next()
      if (action === 'previous') current.previous()
      if (action === 'stop') current.stop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
