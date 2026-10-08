# Triad voice leading

**Prerequisites:** Diatonic triads; string-set triads  
**Next:** Cadences and harmonic motion

## Concept

**Voice leading** is how each note of one chord moves to a note of the next. On guitar, treat each of the three strings of a triad as a voice. Smooth voice leading means the notes move little: they stay put when the next chord contains them (**common tones**) and otherwise move by a half step or a whole step.

The goal is not a rule to obey but a tool: the chord changes sound connected rather than like a series of unrelated shapes. On three adjacent strings, the movement is easy to count: each voice's motion is the change in fret on its own string, in half steps.

## Underlying logic

**Common tones depend on how the roots relate.** Triads share notes when their roots are a third or a fifth apart:

| Chords in `C` | Common tones | Reason |
| --- | --- | --- |
| `C` and `Am` | `C`, `E` (two) | Roots a third apart |
| `C` and `Em` | `E`, `G` (two) | Roots a third apart |
| `C` and `F` | `C` (one) | Roots a fifth apart |
| `C` and `G` | `G` (one) | Roots a fifth apart |
| `C` and `Dm` | none | Roots a step apart |
| `F` and `G` | none | Roots a step apart |

**Method for connecting two chords.**

1. Spell both triads.
2. Mark the common tones. Keep them on the same strings and frets.
3. For the remaining voices, pick the nearest note of the new chord (usually one or two half steps).
4. The inversion you land on is a consequence of that choice, not the target.

**Measuring smoothness.** Add up the half steps each string moves. This is a rough guide, not a law: sometimes you accept a larger leap for a good bass note or a melody note on top.

Two cautions:

- Smooth does not mean parallel. If all three voices move the same direction by the same amount, the shape just slides. That is useful (guitarists slide shapes constantly) but it is not the same as independent voices holding common tones.
- Tendency tones want to resolve: a leading tone goes up a half step to the tonic, and a chord's seventh goes down (next lessons). Keep such tendencies when you can.

## Musical significance

Smooth connections make a progression sound deliberate and flowing. They also let one hand stay in one region of the neck, which makes fast chord changes and clean rhythm playing easier. Voice leading also decides which note is on top, and the top voice is the one that the ear follows most as a melody.

The extreme opposite is root-position hopping: playing every chord as root position at different places on the neck. That is legitimate for stylistic reasons (power, clarity), but it produces large jumps and a thicker, less connected sound.

## Guitar application

Progression `C – Am – F – G – C` in `C` major, on strings 4–3–2 (`D G B`). Here is a smooth path.

| Chord | Frets (str 4, 3, 2) | Notes low to high | Motion from previous |
| --- | --- | --- | --- |
| `C` | `10 9 8` | `C E G` | start |
| `Am` | `10 9 10` | `C E A` | `G→A` up 2; `C` and `E` stay |
| `F` | `10 10 10` | `C F A` | `E→F` up 1; `C` and `A` stay |
| `G` | `9 7 8` | `B D G` | `C→B` 1, `F→D` 3, `A→G` 2 (down) |
| `C` | `10 9 8` | `C E G` | `B→C` up 1; `D→E` up 2; `G` stays |

Total motion: 2 + 1 + 6 + 3 = 12 half steps across four changes, with the hand staying within frets 7–10.

Compare with root position at every change: `C 10 9 8`, `Am 7 5 5`, `F 3 2 1`, `G 5 4 3`, `C 10 9 8`. The moves are 10, 11, 6, and 15 half steps, for a total of 42. Same harmony, much more hand travel.

In the smooth path, the bass note (string 4) goes `C C C B C`: it holds, then dips to `B`. The top voice goes `G A A G G`: a smooth melodic line.

Compare two ways to go from the same `C` (`10 9 8`, notes `C E G`) straight to `G` on this set:

| Path | Target frets | Notes | Per-string motion | Total |
| --- | --- | --- | --- | --- |
| Nearby first inversion | `9 7 8` | `B D G` | `C→B` 1, `E→D` 2, `G→G` 0 | **3** |
| Higher second inversion | `12 12 12` | `D G B` | `C→D` 2, `E→G` 3, `G→B` 4 | **9** |

The first path is smoother: it keeps `G` as a common tone and moves the other voices by small steps. The second path reaches a valid `G` triad but travels farther.

**Minor-key example,** `Am – Dm – E – Am`, strings 4–3–2:

| Chord | Frets (str 4, 3, 2) | Notes low to high | Motion from previous |
| --- | --- | --- | --- |
| `Am` | `7 5 5` | `A C E` | start |
| `Dm` | `7 7 6` | `A D F` | `A` stays; `C→D` up 2; `E→F` up 1 |
| `E` | `6 4 5` | `G♯ B E` | `A→G♯` 1, `D→B` 3, `F→E` 1 (down) |
| `Am` | `7 5 5` | `A C E` | `G♯→A` up 1; `B→C` up 1; `E` stays |

Total: 3 + 5 + 2 = 10. The leading tone `G♯` in the `E` chord resolves up to `A` in the last change, as it should.

Checking a shape by ear is possible too: hold the common tones lightly and listen to them sustain across the change while only the moving strings change.

## Exercises

1. State the common tones: `C` to `Em`; `G` to `Em`; `F` to `Dm`; `C` to `Dm`. Expected: `E G`; `G B`; `F A`; none.
2. In `G` major, connect `G – Em – C – D – G` on strings 4–3–2, starting with `G` as `B D G` (`9 7 8`). Expected one smooth path: `Em` as `B E G` (`9 9 8`), `C` as `C E G` (`10 9 8`), `D` as `A D F♯` (`7 7 7`), then `G` as `B D G` (`9 7 8`). Motion per change: 2, 1, 6, 3.
3. Voice-lead `C` to `G` two ways: `C E G` (`10 9 8`) to `B D G` (`9 7 8`), and to `D G B` (`12 12 12`). Count the half steps on each string and total them. Expected: **3** (`1 + 2 + 0`) and **9** (`2 + 3 + 4`).
4. Find the smoothest `F` triad after `C E G` (`10 9 8`) on strings 4–3–2. Expected: `C F A` (`10 10 10`), total motion 3.
5. Play the `C – Am – F – G – C` path from the table slowly. Say the common tones before each change.
6. Play the same progression with root position at each chord (`10 9 8`, `7 5 5`, `3 2 1`, `5 4 3`, `10 9 8`). Compare how connected each sounds and how far your hand travels.
7. Play `Am – Dm – E – Am` from the minor table. Hum the top voice (`E F E E`) and the bass (`A A G♯ A`).
8. Find a smooth path for `Dm – G – C` in `C` major on strings 4–3–2, starting from `Dm` as `A D F` (`7 7 6`), with total motion of at most 7. Expected: `G` as `B D G` (`9 7 8`, motion 4), then `C` as `C E G` (`10 9 8`, motion 3). Name the common tone in the first change (`D`) and the resolution of `B` to `C`.

## Mastery criteria

- **Conceptual:** Define voice leading and common tone. Explain why roots a third or a fifth apart share notes.
- **Written:** For any two diatonic triads, identify common tones and choose the nearest notes for the other voices.
- **Fretboard:** Connect a four-chord progression on one string set with the smallest total motion you can find, naming the inversion at each step.
- **Aural:** Hear held common tones across a change and the leading tone resolving upward.
- **Application:** Choose between a smooth path and a root-position path deliberately, and say which sound you want.
