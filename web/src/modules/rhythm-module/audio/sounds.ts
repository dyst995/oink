import type { ClickKind } from '../theory/spec.ts'
import type { Voice } from '../theory/schedule.ts'

export type Mix = {
  master: number
  accent: number
  beat: number
  subdivision: number
  click: ClickKind
}

export function scheduleClick(
  ctx: AudioContext,
  destination: AudioNode,
  noise: AudioBuffer,
  when: number,
  voice: Voice,
  mix: Mix,
): { source: AudioScheduledSourceNode; gain: GainNode; end: number }[] {
  const amount = voiceGain(voice, mix)
  if (amount <= 0.001 || when < ctx.currentTime - 0.03) return []
  if (voice === 'rhythm' || voice === 'rhythm-accent') return pluck(ctx, destination, when, amount, voice === 'rhythm-accent')
  if (mix.click === 'mechanical') return noiseClick(ctx, destination, noise, when, amount, 0.03, 1800)
  if (mix.click === 'woodblock') return woodblock(ctx, destination, noise, when, amount)
  if (mix.click === 'cowbell') return cowbell(ctx, destination, when, amount, voice === 'accent')
  if (mix.click === 'beep') return tone(ctx, destination, when, amount, voice === 'accent' ? 1320 : voice === 'subdivision' ? 880 : 988, 'square', 0.07)
  const frequency = voice === 'accent' ? 2100 : voice === 'subdivision' ? 1350 : 1680
  return tone(ctx, destination, when, amount, frequency, 'sine', voice === 'subdivision' ? 0.03 : 0.045)
}

function voiceGain(voice: Voice, mix: Mix): number {
  const master = clampUnit(mix.master)
  if (voice === 'accent') return master * clampUnit(mix.accent)
  if (voice === 'beat') return master * clampUnit(mix.beat)
  if (voice === 'subdivision') return master * clampUnit(mix.subdivision)
  if (voice === 'rhythm-accent') return master * Math.min(1, clampUnit(mix.beat) + 0.2)
  return master * 0.75
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function tone(
  ctx: AudioContext,
  destination: AudioNode,
  when: number,
  amount: number,
  frequency: number,
  type: OscillatorType,
  decay: number,
): { source: AudioScheduledSourceNode; gain: GainNode; end: number }[] {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, when)
  gain.gain.setValueAtTime(amount, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + decay)
  osc.connect(gain)
  gain.connect(destination)
  osc.start(when)
  osc.stop(when + decay + 0.02)
  return [{ source: osc, gain, end: when + decay + 0.02 }]
}

function cowbell(
  ctx: AudioContext,
  destination: AudioNode,
  when: number,
  amount: number,
  accent: boolean,
): { source: AudioScheduledSourceNode; gain: GainNode; end: number }[] {
  const high = tone(ctx, destination, when, amount * 0.65, accent ? 900 : 800, 'square', 0.09)
  const low = tone(ctx, destination, when, amount * 0.45, accent ? 560 : 540, 'square', 0.09)
  return [...high, ...low]
}

function woodblock(
  ctx: AudioContext,
  destination: AudioNode,
  noise: AudioBuffer,
  when: number,
  amount: number,
): { source: AudioScheduledSourceNode; gain: GainNode; end: number }[] {
  return [...tone(ctx, destination, when, amount, 760, 'sine', 0.04), ...noiseClick(ctx, destination, noise, when, amount * 0.35, 0.015, 1200)]
}

function noiseClick(
  ctx: AudioContext,
  destination: AudioNode,
  noise: AudioBuffer,
  when: number,
  amount: number,
  decay: number,
  frequency: number,
): { source: AudioScheduledSourceNode; gain: GainNode; end: number }[] {
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  source.buffer = noise
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(frequency, when)
  gain.gain.setValueAtTime(amount, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + decay)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(destination)
  source.start(when)
  source.stop(when + decay + 0.02)
  return [{ source, gain, end: when + decay + 0.02 }]
}

function pluck(
  ctx: AudioContext,
  destination: AudioNode,
  when: number,
  amount: number,
  accent: boolean,
): { source: AudioScheduledSourceNode; gain: GainNode; end: number }[] {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(accent ? 392 : 262, when)
  osc.frequency.exponentialRampToValueAtTime(accent ? 196 : 160, when + 0.12)
  gain.gain.setValueAtTime(amount, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.14)
  osc.connect(gain)
  gain.connect(destination)
  osc.start(when)
  osc.stop(when + 0.16)
  return [{ source: osc, gain, end: when + 0.16 }]
}

export function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1
  return buffer
}
