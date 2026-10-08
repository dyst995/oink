# Pentatonic and blues scales

**Prerequisites:** Harmonic and melodic minor; the major scale across the neck  
**Next:** Modes in context

## Concept

A **pentatonic scale** has five notes per octave. The two common ones are subsets of seven-note scales you already know:

| Scale | Formula | Source and omitted degrees |
| --- | --- | --- |
| Major pentatonic | `1 2 3 5 6` | Major scale without `4` and `7` |
| Minor pentatonic | `1 ♭3 4 5 ♭7` | Natural minor without `2` and `♭6` |

The **blues scale** adds one note to minor pentatonic:

`1 ♭3 4 ♭5 5 ♭7`

The `♭5` is a chromatic passing note between `4` and `5`. It is color, not a core scale tone.

## Underlying logic

The omitted degrees are exactly the ones that form half steps with their neighbours. In major, `4` sits a half step above `3`, and `7` sits a half step below `1`. Remove them and no two adjacent scale notes are a half step apart; the gaps are whole steps or minor thirds. That is why pentatonic scales are stable: nothing in the scale itself grinds.

In natural minor the half steps are `2–♭3` and `5–♭6`. Remove `2` and `♭6` and the same cleanliness results.

Relative pairs share notes, just as major and minor do:

- `A` minor pentatonic: `A C D E G`.
- `C` major pentatonic: `C D E G A`. Same five notes, different tonic.
- `A` major pentatonic: `A B C♯ E F♯`. `F♯` minor pentatonic is the same set.

The minor pentatonic's root is a minor third below its relative major pentatonic's root.

## Musical significance

A pentatonic scale avoids the notes most likely to clash with chords. It works over many chords, but "works over many" does not mean "works over every chord". Each note has a relationship to the chord under it, and that relationship is what you hear.

Check `A` minor pentatonic over several chords:

| Chord | `A` | `C` | `D` | `E` | `G` | Comment |
| --- | --- | --- | --- | --- | --- | --- |
| `Am` | root | `♭3` | `4` | `5` | `♭7` | all fit |
| `F` | `3` | `5` | `6` | `7` | `9` | fits; major-seventh and add-9 colors |
| `C` | `6` | root | `9` | `3` | `5` | fits |
| `G` | `9` | `4` | `5` | `6` | root | `C` is a half step above the chord's `B`; do not hold it |
| `E7` | `4` | `♭6` | `♭7` | root | `♭3` | `G` sits a half step below the chord's `G♯` |

The last row matters: `G` over `E7` clashes with the chord's third (`G♯`). In blues this is an intended tension, the "blue" note. Elsewhere treat it as a passing note, or bend or slide it up to `G♯`. The `A` (degree `4`) also leans on that third, half a step above `G♯`.

The standard 12-bar blues uses dominant 7 chords (`A7 D7 E7`), and players commonly use minor pentatonic or the blues scale over all of them. The `♭3` against the chord's major third is the characteristic sound, and it works because the idiom sets it up as deliberate, often by bending the `♭3` up toward the major 3.

Rule of thumb outside the blues idiom: over a **major chord**, use the major pentatonic of the chord's root. Over a **minor chord**, use the minor pentatonic of its root. Hold only notes that are safe against the chord; a short passing note can touch almost anything.

## Guitar application

`A` minor pentatonic across the strings, frets 0–12 (`A C D E G`):

| String | Notes as note:fret |
| --- | --- |
| 6 | `E:0 G:3 A:5 C:8 D:10 E:12` |
| 5 | `A:0 C:3 D:5 E:7 G:10 A:12` |
| 4 | `D:0 E:2 G:5 A:7 C:10 D:12` |
| 3 | `G:0 A:2 C:5 D:7 E:9 G:12` |
| 2 | `C:1 D:3 E:5 G:8 A:10` |
| 1 | `E:0 G:3 A:5 C:8 D:10 E:12` |

The familiar frets 5–8 region falls out of the table. It holds two notes per string: string 6 `A:5 C:8`, string 5 `D:5 E:7`, string 4 `G:5 A:7`, string 3 `C:5 D:7`, string 2 `E:5 G:8`, string 1 `A:5 C:8`.

The blues note is `E♭` (`♭5` of `A`). In that region it sits between `D` and `E` (degrees `4` and `5`): string 5, fret 6 (between `D:5` and `E:7`), and string 3, fret 8 (between `D:7` and `E:9`). Play it as a passing note: `D → E♭ → E`. Do not park on it.

Major pentatonic of `A` (`A B C♯ E F♯`) on string 6 is `E:0 F♯:2 A:5 B:7 C♯:9 E:12`. It has the same notes as `F♯` minor pentatonic. Its root `A` is at string 6, fret 5, the same place as `A` minor pentatonic's root, but the surrounding notes differ.

Practical use over `Am – F – C – G` with `A` minor pentatonic: it fits `Am` and `C` fully. Over `F`, aim for `A` or `C` (chord tones). Over `G`, aim for `D` or `G`, and do not sustain `C`.

## Exercises

1. Derive minor pentatonic for `E`, `D`, and `G` from natural minor by removing `2` and `♭6`. Expected: `E G A B D`; `D F G A C`; `G B♭ C D F`.
2. Derive major pentatonic for `G`, `D`, and `F` from the major scale by removing `4` and `7`. Expected: `G A B D E`; `D E F♯ A B`; `F G A C D`.
3. Find the relative minor pentatonic of `G` major pentatonic and confirm the notes match. Expected: `E` minor pentatonic, `E G A B D`.
4. Add the blues note to `E` minor pentatonic and name it. Expected: `E G A B♭ B D`; the `♭5` is `B♭`.
5. On string 6, play `E` minor pentatonic: frets `0 3 5 7 10 12` give `E G A B D E`. On string 5, play the same pitch classes starting at fret 2: frets `2 5 7 10 12` give `B D E G A`.
6. Play `A` minor pentatonic in frets 5–8 over an `Am` chord, then over an `F` chord. Number `A C D E G` relative to `F` and say which notes you would stress. Expected: `3 5 6 7 9`; stress `A` and `C`.
7. Over `E7` (`020100`), play the open string 3 (`G`) and then bend or slide it to fret 1 (`G♯`). Describe the tension and its release.
8. Hold a `C` over a `G` major chord, then move to `B`. Compare how stable each sounds.

## Mastery criteria

- **Conceptual:** Derive pentatonic scales as subsets with their omitted degrees, and explain why they avoid half steps. Explain why `♭5` is a passing color rather than a main scale tone.
- **Written:** Spell major and minor pentatonic in `C G D A E`, and the blues note for each minor root.
- **Fretboard:** Build `A` minor pentatonic in at least two regions from the notes, and place the `♭5` in each.
- **Aural:** Distinguish `♭3` over a dominant chord from `3`, and describe the bend toward `3`.
- **Application:** For a short progression, choose a pentatonic per chord and say which notes are stable and which need care.
