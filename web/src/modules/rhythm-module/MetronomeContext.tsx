import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getMetronomeEngine, type TransportSnapshot } from './audio/engine.ts'
import { loadStore, saveStore, type PracticeStat, type RhythmStore, type SavedPattern } from './storage.ts'
import type { RhythmSettings } from './theory/spec.ts'

type RhythmContextValue = {
  settings: RhythmSettings
  patterns: SavedPattern[]
  stats: PracticeStat[]
  update: (patch: Partial<RhythmSettings>) => void
  read: () => RhythmSettings
  savePattern: (pattern: SavedPattern) => void
  deletePattern: (id: string) => void
  addStat: (stat: PracticeStat) => void
}

const RhythmContext = createContext<RhythmContextValue | null>(null)

export function MetronomeProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<RhythmStore>(loadStore)
  const live = useRef(store.settings)

  useEffect(() => {
    live.current = store.settings
  }, [store.settings])

  useEffect(() => {
    saveStore(store)
  }, [store])

  useEffect(() => () => getMetronomeEngine().stop(), [])

  const value = useMemo<RhythmContextValue>(() => {
    return {
      settings: store.settings,
      patterns: store.patterns,
      stats: store.stats,
      update(patch) {
        setStore((current) => {
          const next = { ...current.settings, ...patch }
          live.current = next
          return { ...current, settings: next }
        })
      },
      read: () => live.current,
      savePattern(pattern) {
        setStore((current) => ({
          ...current,
          patterns: [pattern, ...current.patterns.filter((item) => item.id !== pattern.id)].slice(0, 40),
        }))
      },
      deletePattern(id) {
        setStore((current) => ({
          ...current,
          patterns: current.patterns.filter((item) => item.id !== id),
        }))
      },
      addStat(stat) {
        setStore((current) => ({
          ...current,
          stats: [...current.stats, stat].slice(-40),
        }))
      },
    }
  }, [store])

  return <RhythmContext.Provider value={value}>{children}</RhythmContext.Provider>
}

export function useRhythm(): RhythmContextValue {
  const value = useContext(RhythmContext)
  if (!value) throw new Error('The metronome is not available on this page.')
  return value
}

export function useTransport(): TransportSnapshot {
  const [snapshot, setSnapshot] = useState<TransportSnapshot>(() => getMetronomeEngine().snapshot())
  useEffect(() => getMetronomeEngine().subscribe(setSnapshot, true), [])
  return snapshot
}

export function usePlaying(): boolean {
  const [playing, setPlaying] = useState(false)
  useEffect(
    () =>
      getMetronomeEngine().subscribe((snapshot) => {
        setPlaying((current) => (current === snapshot.playing ? current : snapshot.playing))
      }),
    [],
  )
  return playing
}
