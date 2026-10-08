import type { CSSProperties } from 'react'
import {
  FRET_COUNT,
  GUITAR_STRINGS,
  INLAY_FRETS,
  isChordToneDegree,
  pitchClassAt,
  type FormulaTone,
} from './theory.ts'
import {
  fretColumnLeft,
  fretColumnWidth,
  shapeRegions,
  shapesContainingFret,
  type ScaleShape,
} from './shapes.ts'
import type { FocusMode, LabelMode } from './FretboardControls.tsx'
import type { SelectedNote } from './NoteInspector.tsx'

const STRING_GAUGES = [1, 1.5, 2, 2.4, 2.8, 3.4]

type FretboardProps = {
  tones: readonly FormulaTone[]
  labelMode: LabelMode
  showRoots: boolean
  showLabels: boolean
  showFretNumbers: boolean
  showNonPattern: boolean
  showShapes: boolean
  shapes: readonly ScaleShape[]
  focusMode: FocusMode
  focusDegree: string
  focusInterval: number
  selected: SelectedNote | null
  onSelect: (note: SelectedNote) => void
}

function inlayLeft(fret: number): string {
  return `calc(var(--open-w) + (100% - var(--open-w)) * ${(fret - 0.5) / FRET_COUNT})`
}

function labelFor(tone: FormulaTone, labelMode: LabelMode): string {
  if (labelMode === 'degrees') return tone.degreeLabel
  if (labelMode === 'intervals') return tone.intervalShort
  if (labelMode === 'chord-tones') {
    if (tone.role === 'root') return 'R'
    if (tone.role === 'third') return '3'
    if (tone.role === 'fifth') return '5'
    if (tone.role === 'seventh') return '7'
    return '·'
  }
  return tone.name
}

function isFocused(
  tone: FormulaTone,
  focusMode: FocusMode,
  focusDegree: string,
  focusInterval: number,
): boolean {
  if (focusMode === 'all') return true
  if (focusMode === 'chord-tones') return isChordToneDegree(tone.degreeLabel)
  if (focusMode === 'degree') return tone.degreeLabel === focusDegree
  if (focusMode === 'interval') return tone.semitones === focusInterval
  return true
}

export function Fretboard({
  tones,
  labelMode,
  showRoots,
  showLabels,
  showFretNumbers,
  showNonPattern,
  showShapes,
  shapes,
  focusMode,
  focusDegree,
  focusInterval,
  selected,
  onSelect,
}: FretboardProps) {
  const toneByPitchClass = new Map(tones.map((tone) => [tone.pitchClass, tone]))
  const frets = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret)

  return (
    <div className="board-scroll">
      <div
        className={showShapes ? 'fretboard has-shapes' : 'fretboard'}
        role="group"
        aria-label="Guitar fretboard"
      >
        {showFretNumbers ? (
          <div className="fret-numbers" aria-hidden="true">
            <span className="fret-number" />
            {frets.map((fret) => (
              <span key={fret} className="fret-number">
                {fret}
              </span>
            ))}
          </div>
        ) : null}

        <div className="board-body">
          <div className="headstock">
            {GUITAR_STRINGS.map((string) => (
              <div className="string-label" key={string.id}>
                {string.label}
              </div>
            ))}
          </div>

          <div className="neck">
            <div className="inlays" aria-hidden="true">
              {INLAY_FRETS.single.map((fret) => (
                <span key={fret} className="inlay" style={{ left: inlayLeft(fret) }} />
              ))}
              <span
                className="inlay inlay-high"
                style={{ left: inlayLeft(INLAY_FRETS.double) }}
              />
              <span className="inlay inlay-low" style={{ left: inlayLeft(INLAY_FRETS.double) }} />
            </div>

            {showShapes ? (
              <div className="shape-overlays" aria-hidden="true">
                {shapes.map((shape) =>
                  shapeRegions(shape.frets).map((region, regionIndex) => (
                    <div
                      key={`${shape.id}-${region.from}-${region.to}`}
                      className={`shape-box shape-box-${shape.id}`}
                      style={
                        {
                          '--shape-left': fretColumnLeft(region.from),
                          '--shape-width': fretColumnWidth(region.from, region.to),
                        } as CSSProperties
                      }
                      data-shape={shape.id}
                    >
                      {regionIndex === 0 ? (
                        <span className="shape-box-label">
                          <span className="shape-box-label-num">{shape.id}</span>
                          <span className="shape-box-label-text">{shape.caged}</span>
                        </span>
                      ) : (
                        <span className="shape-box-label is-continued">
                          <span className="shape-box-label-num">{shape.id}</span>
                        </span>
                      )}
                    </div>
                  )),
                )}
              </div>
            ) : null}

            {GUITAR_STRINGS.map((string, index) => (
              <div className="string-row" key={string.id}>
                <div className="string-line" style={{ height: STRING_GAUGES[index] }} />
                {frets.map((fret) => {
                  const pitchClass = pitchClassAt(string.openPitchClass, fret)
                  const tone = toneByPitchClass.get(pitchClass) ?? null
                  const focused = tone
                    ? isFocused(tone, focusMode, focusDegree, focusInterval)
                    : false
                  const isSelected =
                    selected?.string.id === string.id && selected.fret === fret
                  const showPatternNote = Boolean(tone && focused)
                  const showGhost = showNonPattern && !tone
                  const containing = showShapes ? shapesContainingFret(fret, shapes) : []

                  return (
                    <div key={fret} className={fret === 0 ? 'fret fret-open' : 'fret'}>
                      {showPatternNote && tone ? (
                        <button
                          type="button"
                          className={[
                            'note',
                            `note-${tone.role}`,
                            showRoots && tone.isRoot ? 'note-root' : '',
                            isSelected ? 'is-selected' : '',
                            !showLabels ? 'is-unlabeled' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          data-string={string.label}
                          data-fret={fret}
                          data-note={tone.name}
                          data-degree={tone.degreeLabel}
                          aria-pressed={isSelected}
                          aria-label={`${string.label} string, fret ${fret}, ${tone.degreeLabel}, ${tone.name}, ${tone.intervalName}${containing.length ? `, shapes ${containing.map((s) => s.id).join(', ')}` : ''}`}
                          onClick={() =>
                            onSelect({
                              string,
                              fret,
                              tone,
                              pitchClass,
                              shapes: containing,
                            })
                          }
                        >
                          {showLabels ? labelFor(tone, labelMode) : null}
                        </button>
                      ) : showGhost || (tone && !focused) ? (
                        <button
                          type="button"
                          className={[
                            'note note-ghost',
                            isSelected ? 'is-selected' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          aria-pressed={isSelected}
                          aria-label={`${string.label} string, fret ${fret}${tone ? `, ${tone.name} (dimmed)` : ', outside pattern'}`}
                          onClick={() =>
                            onSelect({
                              string,
                              fret,
                              tone,
                              pitchClass,
                              shapes: containing,
                            })
                          }
                        />
                      ) : (
                        <button
                          type="button"
                          className={['note-hit', isSelected ? 'is-selected' : '']
                            .filter(Boolean)
                            .join(' ')}
                          aria-label={`${string.label} string, fret ${fret}, empty`}
                          onClick={() =>
                            onSelect({
                              string,
                              fret,
                              tone: null,
                              pitchClass,
                              shapes: containing,
                            })
                          }
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
