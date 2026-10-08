# Interval spelling and inversion

**Prerequisites:** Interval names and quality  
**Next:** Intervals in music

**Prerequisites:** Interval names and quality; the twelve pitch classes

**Next:** Intervals in music

## Concept

Three skills build on interval names:

1. **Spelling:** given a lower note and an interval, write the correct upper note, including its letter.
2. **Compound intervals:** intervals larger than an octave (9ths, 10ths, and so on) and how they relate to simple intervals.
3. **Inversion:** turning an interval upside down by moving the lower note above the upper, or the upper note below the lower.

**Spelling method (two steps):**

1. Find the **letter** by counting. For an interval number `n`, the upper letter is `n - 1` letters above the lower letter. A 3rd above `F♯` uses the letter two above `F`, which is `A`.
2. Choose the **accidental** so the half-step distance matches the quality. A major 3rd is 4 half steps; `F♯` to `A` is 3, so you need `A♯`.

**Compound intervals** are an octave or more. Subtract an octave to get the simple version and keep its quality:

| Compound | Simple + octave | Half steps |
| --- | --- | --- |
| M9 | M2 + octave | 14 |
| m10 | m3 + octave | 15 |
| M10 | M3 + octave | 16 |
| P11 | P4 + octave | 17 |
| P12 | P5 + octave | 19 |
| M13 | M6 + octave | 21 |

To simplify a compound number, subtract 7 (a 9th is a 2nd, a 13th is a 6th). Half steps: subtract 12.

**Inversion rules** for simple intervals:

- Numbers add to **9**: 2nd to 7th, 3rd to 6th, 4th to 5th, unison to octave.
- Qualities flip: major to minor, minor to major, augmented to diminished, diminished to augmented, perfect stays perfect.
- Half steps add to **12**.

| Interval | Inverts to |
| --- | --- |
| P5 (7) | P4 (5) |
| M3 (4) | m6 (8) |
| m3 (3) | M6 (9) |
| M2 (2) | m7 (10) |
| m2 (1) | M7 (11) |
| A4 (6) | d5 (6) |
| d7 (9) | A2 (3) |

## Underlying logic

**Why letters first.** The letter count fixes the interval's number, and the number matters for how music is written and read. A major 3rd above `F♯` is `A♯`, not `B♭`. They are the same pitch class (the same guitar fret), but `F♯` to `B♭` spans the letters `F G A B`, a 4th, and at that width it is a **diminished 4th**, not a 3rd. Wrong spelling gives the wrong interval name and the wrong function.

Sometimes the letter-first rule forces an unusual note. A major 3rd above `G♯` is `B♯` (letters `G A B`; `G♯` to `B♯` is 4 half steps). `B♯` is `C` on the guitar, but the spelling is correct in a key such as `C♯` major or `G♯` minor. Do not "fix" it to `C` without checking the context.

**Why inversion works.** Together, an interval and its inversion span exactly one octave. If the interval from lower note `X` up to upper note `Y` is `n` letters, then moving `X` up an octave leaves a distance from `Y` up to `X` that takes the remaining `9 - n` letters. Half steps likewise add to 12. Quality flips because a wider interval's complement is narrower. The perfect intervals (P4, P5, P8, P1) have no major or minor form, so they stay perfect.

Inversion works only on simple intervals. To invert a compound interval, reduce it first.

## Musical significance

Spelling is how music communicates function. The `F♯` major scale is `F♯ G♯ A♯ B C♯ D♯ E♯`: its 7th note is `E♯`, not `F`, so that each letter is used once. Seven-note scales, key signatures, and chord spellings all rely on this letter logic.

Inversion explains why chords keep their identity when you rearrange notes. A `C` major triad (`C E G`) contains `C` up to `G` (a P5). If `G` is the lowest note instead, the `G` up to the next `C` is a P4, the inversion of that P5. The **pitch classes** and the chord's identity do not change; only the interval above the lowest note does. Interval inversion is the basis for chord inversion later on.

Compound intervals matter for chord names. The 9th, 11th, and 13th in extended chords are simple intervals placed above the octave: a `9` is a 2nd plus an octave, with the same quality.

## Guitar application

On one string, frets give half steps. The spelling must still be worked out in letters.

- String 6 fret 2 is `F♯`. Four frets higher is string 6 fret 6, which you spell `A♯` as the major 3rd above `F♯` (a good check: `F♯` to `A♯`, letters `F G A`).
- Inversion on strings: `C` on string 5 fret 3 up to `G` on string 4 fret 5 is a P5. `G` on string 4 fret 5 up to `C` on string 3 fret 5 is a P4. Same two pitch classes, inverted.
- Compound: string 5 fret 3 (`C3`) up to string 2 fret 3 (`D4`)? `C3` to `D4` spans 14 half steps, a major 9th. Check: string 2 fret 3 is `D4`.

Ear: play `C` up to `G` (P5), then `G` up to `C` (P4). Notice the two sounds are clearly related: the same two pitch classes, different direction. Then play `C` up to `E` (M3) followed by `E` up to `C` (m6). Do this every time you learn a new interval, and you will hear that every interval has an upside-down relative.

## Exercises

1. Spell a major 3rd above each: `A`, `E♭`, `F♯`, `B♭`, `D♭`. **Check:** `C♯`, `G`, `A♯`, `D`, `F`.
2. Spell a perfect 5th above each: `B`, `F♯`, `E♭`, `D♭`, `F`. **Check:** `F♯`, `C♯`, `B♭`, `A♭`, `C`.
3. Spell a minor 3rd above each: `C♯`, `B♭`, `E`, `F`. **Check:** `E`, `D♭`, `G`, `A♭`.
4. Spell a minor 7th above `G` and a major 7th above `F`. **Check:** `F` and `E`.
5. Invert each: M3, P4, m7, A4, d7. **Check:** m6, P5, M2, d5, A2.
6. Simplify each compound interval and give its half steps: M9, m10, P12, M13. **Check:** M2 + octave (14), m3 + octave (15), P5 + octave (19), M6 + octave (21).
7. Find a major 3rd above open string 3 (`G3`) in two places. **Check:** string 3 fret 4, and string 2 fret 0 (open `B3`). They are the same pitch, because between strings 3 and 2 the same fret is already a major 3rd.

## Mastery criteria

- **Conceptual:** You can state why letters come before accidentals and why inversions of numbers sum to 9.
- **Written:** You can spell any simple interval above any natural or accidental starting note, including cases that need `E♯`, `B♯`, or `C♭`.
- **Written:** You can invert any simple interval and simplify any compound interval to its simple form.
- **Fretboard:** You can find an interval on the guitar, name the upper note with the correct letter, and locate its inversion.
- **Aural:** You can hear that an interval and its inversion share the same pair of pitch classes.
- **Application:** You can use interval spelling to explain why a given chord tone in a key is written with a specific letter and accidental.
