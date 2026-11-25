import { createNoiseBuffer, scheduleClick, type Mix } from './sounds.ts'
import { beatTicks, beatsPerBar } from '../theory/duration.ts'
import {
  startClock,
  tickAtTime,
  timeAtTick,
  stepClock,
  type Clock,
  type TransportSpec,
} from '../theory/schedule.ts'

export type TransportSnapshot = {
  playing: boolean
  waiting: boolean
  tick: number
  bar: number
  beat: number
  slotInBeat: number
  slotInBar: number
  parts: number
  bpm: number
  countIn: boolean
  audioTime: number
}

export const IDLE_SNAPSHOT: TransportSnapshot = {
  playing: false,
  waiting: false,
  tick: 0,
  bar: 0,
  beat: 0,
  slotInBeat: 0,
  slotInBar: 0,
  parts: 1,
  bpm: 80,
  countIn: false,
  audioTime: 0,
}

type Listener = (snapshot: TransportSnapshot) => void
type NodeRef = { source: AudioScheduledSourceNode; gain: GainNode; end: number }

export class MetronomeEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private timer = 0
  private frame = 0
  private generation = 0
  private clock: Clock | null = null
  private spec: TransportSpec | null = null
  private playing = false
  private nodes: NodeRef[] = []
  private frameListeners = new Set<Listener>()
  private stateListeners = new Set<Listener>()
  private mix: Mix = { master: 0.8, accent: 1, beat: 0.7, subdivision: 0.4, click: 'digital' }
  private endTimer = 0
  private onEnded: (() => void) | null = null

  start(spec: TransportSpec, bpm: number, onEnded?: () => void) {
    this.halt(false)
    const ctx = this.ensure()
    if (!ctx) return false
    void ctx.resume()
    this.spec = spec
    this.onEnded = onEnded ?? null
    this.clock = startClock(bpm, ctx.currentTime + 0.05)
    this.playing = true
    const generation = ++this.generation
    this.pump(generation)
    this.paint(generation)
    this.emit(true)
    return true
  }

  stop() {
    const ended = this.onEnded
    this.onEnded = null
    ended?.()
    this.halt(true)
  }

  setMix(mix: Mix) {
    this.mix = mix
    if (this.master) this.master.gain.value = 1
  }

  currentTime(): number {
    return this.ctx?.currentTime ?? 0
  }

  timeOfTick(tick: number): number | null {
    if (!this.clock || !this.spec) return null
    return timeAtTick(this.clock.segments, tick, beatTicks(this.spec.signature))
  }

  snapshot(): TransportSnapshot {
    if (!this.playing || !this.clock || !this.spec || !this.ctx) {
      return { ...IDLE_SNAPSHOT, bpm: this.clock?.bpm ?? IDLE_SNAPSHOT.bpm }
    }
    const beat = beatTicks(this.spec.signature)
    const now = this.ctx.currentTime
    const start = this.clock.segments[0]?.time ?? now
    if (now < start) {
      return { ...this.locate(0), waiting: true, playing: true, audioTime: now, bpm: this.clock.bpm }
    }
    const floatTick = tickAtTime(this.clock.segments, now, beat)
    const slot = Math.max(1, this.spec.slotTicksAt(Math.max(0, Math.floor(floatTick))))
    const tick = Math.max(0, Math.floor(floatTick / slot) * slot)
    return { ...this.locate(tick), waiting: false, playing: true, audioTime: now }
  }

  subscribe(listener: Listener, frames = false): () => void {
    const bag = frames ? this.frameListeners : this.stateListeners
    bag.add(listener)
    listener(this.snapshot())
    return () => bag.delete(listener)
  }

  private locate(tick: number): TransportSnapshot {
    const spec = this.spec
    const beat = spec ? beatTicks(spec.signature) : 240
    const beats = spec ? beatsPerBar(spec.signature) : 4
    const barSize = beat * beats
    const slot = spec ? Math.max(1, spec.slotTicksAt(tick)) : beat
    const parts = Math.max(1, Math.round(beat / slot))
    const bar = Math.floor(tick / barSize)
    const inBar = tick % barSize
    const beatIndex = Math.floor(inBar / beat)
    const slotInBeat = Math.floor((inBar % beat) / slot)
    return {
      playing: this.playing,
      waiting: false,
      tick,
      bar,
      beat: beatIndex,
      slotInBeat,
      slotInBar: beatIndex * parts + slotInBeat,
      parts,
      bpm: this.clock?.bpm ?? 80,
      countIn: !!spec && bar < spec.countInBars,
      audioTime: this.ctx?.currentTime ?? 0,
    }
  }

  private pump(generation: number) {
    if (generation !== this.generation || !this.playing || !this.clock || !this.spec || !this.ctx) return
    const ahead = typeof document !== 'undefined' && document.hidden ? 1.1 : 0.14
    const horizon = this.ctx.currentTime + ahead
    let steps = 0
    while (this.clock && this.spec && steps < 240) {
      const upcoming = timeAtTick(this.clock.segments, this.clock.tick, beatTicks(this.spec.signature))
      if (upcoming >= horizon) break
      const stepped = stepClock(this.clock, this.spec)
      if (!stepped) {
        this.finishWhenQueued()
        return
      }
      this.clock = stepped.clock
      if (stepped.event.voices.length) this.play(stepped.event.time, stepped.event.voices)
      steps += 1
    }
    const delay = typeof document !== 'undefined' && document.hidden ? 250 : 25
    this.timer = window.setTimeout(() => this.pump(generation), delay)
  }

  private play(when: number, voices: string[]) {
    const ctx = this.ctx
    const master = this.master
    const noise = this.noise
    if (!ctx || !master || !noise) return
    for (const voice of voices) {
      if (voice !== 'accent' && voice !== 'beat' && voice !== 'subdivision' && voice !== 'rhythm' && voice !== 'rhythm-accent') continue
      this.nodes.push(...scheduleClick(ctx, master, noise, when, voice, this.mix))
    }
    const now = ctx.currentTime
    this.nodes = this.nodes.filter((node) => node.end >= now)
  }

  private paint(generation: number) {
    if (generation !== this.generation || !this.playing) return
    this.emit(false)
    this.frame = window.requestAnimationFrame(() => this.paint(generation))
  }

  private finishWhenQueued() {
    if (typeof window === 'undefined') return
    window.clearTimeout(this.endTimer)
    const generation = this.generation
    const last = this.nodes.reduce((max, node) => Math.max(max, node.end), this.ctx?.currentTime ?? 0)
    const wait = Math.max(0, (last - (this.ctx?.currentTime ?? 0)) * 1000 + 40)
    this.endTimer = window.setTimeout(() => {
      if (generation === this.generation && this.playing) this.stop()
    }, wait)
  }

  private emit(state: boolean) {
    const snapshot = this.snapshot()
    if (state) {
      for (const listener of this.stateListeners) listener(snapshot)
    }
    for (const listener of this.frameListeners) listener(snapshot)
  }

  private halt(notify: boolean) {
    this.generation += 1
    this.playing = false
    if (typeof window !== 'undefined') {
      window.clearTimeout(this.timer)
      window.clearTimeout(this.endTimer)
      window.cancelAnimationFrame(this.frame)
    }
    const now = this.ctx?.currentTime ?? 0
    for (const node of this.nodes) {
      try {
        node.source.stop(now)
      } catch {
        /* already stopped */
      }
      node.gain.disconnect()
    }
    this.nodes = []
    this.clock = null
    this.spec = null
    this.onEnded = null
    if (notify) this.emit(true)
  }

  private ensure(): AudioContext | null {
    if (typeof AudioContext === 'undefined') return null
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.connect(this.ctx.destination)
      this.noise = createNoiseBuffer(this.ctx)
    }
    return this.ctx
  }
}

let singleton: MetronomeEngine | null = null

export function getMetronomeEngine(): MetronomeEngine {
  singleton ??= new MetronomeEngine()
  return singleton
}
