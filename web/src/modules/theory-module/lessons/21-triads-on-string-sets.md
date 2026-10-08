# Triads on string sets

**Prerequisites:** Triad inversions; the major scale across the neck  
**Next:** Diatonic triads

## Concept

A **string set** is the group of strings a voicing uses. For three-note triads, the practical sets are four groups of adjacent strings:

| Set | Strings | Open notes | Gaps between open strings |
| --- | --- | --- | --- |
| Low | 6–5–4 | `E A D` | P4, P4 |
| Lower-middle | 5–4–3 | `A D G` | P4, P4 |
| Upper-middle | 4–3–2 | `D G B` | P4, M3 |
| High | 3–2–1 | `G B E` | M3, P4 |

On each set there are three inversions of each triad, so each triad has three adjacent-string shapes per set, twelve in total. They are not twelve things to memorize. They are the same three pitch classes found by the same method on strings with a few different spacings.

## Underlying logic

**One method, every set.** To place a triad on a set:

1. Spell the triad (root, third, fifth).
2. On each of the three strings, find where each of the three notes falls.
3. Choose one note per string, so that the three strings play three different chord tones, within a span of about four frets.

The three notes you choose define the inversion: the lowest-sounding note is the bass.

**Why shapes repeat or change.** Fret distances between strings come from the tuning gaps. A gap of 5 half steps (P4) means the same fret on the next string is 5 half steps higher. The `G→B` gap is only 4 (M3), so the pattern shifts by one fret when it crosses strings 3–2. Therefore:

- Sets 6–5–4 and 5–4–3 have identical spacing (P4, P4), so they use identical shapes.
- Sets 4–3–2 and 3–2–1 have a major-third gap in different places, so each has its own shapes.

**Fret patterns (major triad, three inversions).** Let `r` be the fret of the root, and `x` a reference fret.

| Set | Root position | First inversion | Second inversion |
| --- | --- | --- | --- |
| 6–5–4 and 5–4–3 | `r, r−1, r−3` (root on lowest string) | `x, x−2, x−2` (root on top string) | `x, x, x−1` (root on middle string) |
| 4–3–2 | `r, r−1, r−2` (root lowest) | `x, x−2, x−1` (root top) | `x, x, x` (root middle) |
| 3–2–1 | `r, r, r−2` (root lowest) | `x, x−1, x−1` (root top) | `x, x+1, x` (root middle) |

With the root-location notes in parentheses, the table lets you check any shape. Lower the third by one fret (on its own string) to make any of these minor.

The patterns are derived, not memorized: the third must be 4 half steps above the root and the fifth 7 half steps above, and the string gaps tell you which fret satisfies that.

## Musical significance

Different sets sound different. The low sets (6–5–4, 5–4–3) are thick and are suited to heavier or accompanying parts, but close intervals in the low register get muddy. The high sets (4–3–2, 3–2–1) sound clearer and are used in funk, soul, pop, and ballad guitar for comping and fills.

Because there are several places for each triad, you can choose the region of the neck that suits the melody, stay near a previous chord (next lessons), or avoid a note that clashes with the bass.

## Guitar application

**`C` major (`C E G`) on every set, all three inversions.**

| Set | Root position | First inversion | Second inversion |
| --- | --- | --- | --- |
| 6–5–4 | `8 7 5` (`C E G`) | `12 10 10` (`E G C`) | `3 3 2` (`G C E`) |
| 5–4–3 | `3 2 0` (`C E G`) | `7 5 5` (`E G C`) | `10 10 9` (`G C E`) |
| 4–3–2 | `10 9 8` (`C E G`) | `14 12 13` (`E G C`) | `5 5 5` (`G C E`) |
| 3–2–1 | `5 5 3` (`C E G`) | `9 8 8` (`E G C`) | `12 13 12` (`G C E`) |

Check one by hand: set 5–4–3, first inversion `7 5 5`. String 5 fret 7 is `E` (`A`+7). String 4 fret 5 is `G` (`D`+5). String 3 fret 5 is `C` (`G`+5). Low to high: `E G C`, the third in the bass, so first inversion.

Also open-position: `3 3 2` on 6–5–4 is `G C E`. `0 1 0` on 3–2–1 (open `G`, `B` string fret 1, open `E`) is `G C E`, the top of an open `C` chord.

**Reading a shape to find R, 3, 5.** Take `5 5 3` on 3–2–1. String 3 fret 5 is `C`, string 2 fret 5 is `E`, string 1 fret 3 is `G`. Lowest is `C`, so root position. Root is the lowest note. Third is the next note up, fifth the top.

**A second example in another key.** `A` major (`A C♯ E`) with the patterns:

- 6–5–4: root `5 4 2`; first `9 7 7`; second `12 12 11`.
- 5–4–3: root `12 11 9`; first `4 2 2`; second `7 7 6`.
- 4–3–2: root `7 6 5`; first `11 9 10`; second `2 2 2`.
- 3–2–1: root `2 2 0`; first `6 5 5`; second `9 10 9`.

Minor: lower the third by one fret. `A` minor (`A C E`) on 3–2–1 in root position is `2 1 0`. On 4–3–2 in root position it is `7 5 5`.

**Non-adjacent sets.** Skipping a string (for example strings 6, 4, 3, or 5, 3, 2) gives a more open sound. It is the same method with a larger gap; learn adjacent sets first, because they make inversions easy to see.

## Exercises

1. Without looking, name the three open-string notes of each set. Expected: `E A D`, `A D G`, `D G B`, `G B E`.
2. Use the method to place `G` major (`G B D`) on set 4–3–2 in all three inversions. Expected: `5 4 3`, `9 7 8`, `0 0 0` (or `12 12 12`).
3. Place `D` major (`D F♯ A`) on set 3–2–1 in all three inversions. Expected: `7 7 5` (`D F♯ A`), `11 10 10` (`F♯ A D`), `2 3 2` (`A D F♯`).
4. Place `A` major on set 5–4–3 in root position and first inversion using the patterns. Expected: `12 11 9` and `4 2 2`.
5. Lower the third by one fret in each `C` major shape on 4–3–2 to make `C` minor. Expected: root position `10 8 8` (`C E♭ G`), first inversion `13 12 13` (`E♭ G C`), second inversion `5 5 4` (`G C E♭`).
6. Read these shapes and name the chord and inversion: set 5–4–3 `3 2 0`; set 4–3–2 `9 7 8`; set 3–2–1 `7 8 7`. Expected: `C` major root position (`C E G`); `G` major first inversion (`B D G`); `G` major second inversion (`D G B`).
7. Play `C` major in all four sets, lowest register to highest: `8 7 5` on 6–5–4, `3 2 0` on 5–4–3, `10 9 8` on 4–3–2, `5 5 3` on 3–2–1. Describe how the sound brightens.
8. A melody note is `G`. Find `C` major shapes that have `G` as the top (highest) note. Hint: `G` is on top only when it is the fifth, which means root position. Expected: `8 7 5` on 6–5–4 (top `G` on string 4, fret 5); `3 2 0` on 5–4–3 (top `G` on string 3, open); `10 9 8` on 4–3–2 (top `G` on string 2, fret 8); `5 5 3` on 3–2–1 (top `G` on string 1, fret 3).

## Mastery criteria

- **Conceptual:** Explain why sets 6–5–4 and 5–4–3 share shapes and why the 3–2 gap changes the pattern.
- **Written:** Spell a triad and list, for each set, which inversion has which chord tone in the bass.
- **Fretboard:** Place any major or minor triad on all four sets in all three inversions, naming root, third, and fifth in each.
- **Aural:** Hear the same triad on different sets as one harmony with a different weight and register.
- **Application:** Choose a set and inversion to fit a given bass note or melody note.
