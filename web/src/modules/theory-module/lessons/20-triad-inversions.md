# Triad inversions

**Prerequisites:** Triad construction  
**Next:** Triads on string sets

## Concept

An **inversion** names which chord tone is the **lowest sounding note**, the bass.

| Inversion | Bass | Chord tones low to high | Slash name for `C` |
| --- | --- | --- | --- |
| Root position | Root | `1 3 5` (`C E G`) | `C` |
| First inversion | Third | `3 5 1` (`E G C`) | `C/E` |
| Second inversion | Fifth | `5 1 3` (`G C E`) | `C/G` |

Three ideas must stay separate:

- **Root:** the note the chord is named and built from. It does not change when you invert.
- **Bass:** the lowest note actually sounding. It changes with inversion.
- **Voicing:** the full arrangement of the chord: which strings, which octaves, which notes are doubled or omitted. Inversion only tells you which chord tone is lowest.

`C/E` is a `C` major chord with `E` in the bass. It is not an `E` chord. The letter after the slash is the bass note, never the new root.

## Underlying logic

A triad has three pitch classes, so there are exactly three possible bass notes and three inversions. Rotating the stack moves the lowest note to the top, an octave higher: `C E G` becomes `E G C`, then `G C E`.

Intervals measured above the bass change with each inversion. For a major triad:

| Inversion | Intervals above the bass | Gaps between neighbours |
| --- | --- | --- |
| Root position | 3rd and 5th | M3 then m3 |
| First inversion | 3rd and 6th | m3 then P4 |
| Second inversion | 4th and 6th | P4 then M3 |

For a minor triad, the gaps are m3 then M3 in root position, M3 then P4 in first inversion, and P4 then m3 in second inversion. Check `C` minor first inversion: `E♭ G C`. `E♭` to `G` is a major third, `G` to `C` a perfect fourth.

Because the pitch classes are the same, the harmony stays `C` major in all three. What changes is the bass, how settled the chord sounds, and which notes are nearby for smooth motion.

Which note is lowest depends on the whole band. If a bassist plays `C` while you play `E G C` on the top strings, the sounding bass is `C` and the harmony is root position, even though your shape is a first inversion. Inversion is about the lowest sounding note of the whole sound.

## Musical significance

- **Bass lines.** `C – C/E – F` gives a bass that walks `C E F`, stepwise, under a stable harmony.
- **Stability.** Root position is the most stable. Second inversion often sounds unsettled; it frequently appears as a passing chord or as the tonic in a cadential approach to V.
- **Color without changing harmony.** Playing the same chord with different tones on top changes the melodic top note without changing the chord.
- **Reading slash chords.** `D/F♯` tells you the bass is `F♯`; `G/B` says bass `B`. The root of the chord is still the letter before the slash.

## Guitar application

All shapes below are on strings 4–3–2 (`D G B`), where the three notes are adjacent.

For `G` major (`G B D`):

| Inversion | String 4 | String 3 | String 2 | Notes low to high |
| --- | --- | --- | --- | --- |
| Root position | 5 | 4 | 3 | `G B D` |
| First inversion | 9 | 7 | 8 | `B D G` |
| Second inversion | 0 | 0 | 0 | `D G B` |

Second inversion is the three open strings `D G B`. The same shape slides up as `x x x` for any fret, giving another major triad each time: `5 5 5` is `G C E` (`C` major, second inversion), `7 7 7` is `A D F♯` (`D` major, second inversion).

For `G` minor (`G B♭ D`):

| Inversion | String 4 | String 3 | String 2 | Notes low to high |
| --- | --- | --- | --- | --- |
| Root position | 5 | 3 | 3 | `G B♭ D` |
| First inversion | 8 | 7 | 8 | `B♭ D G` |
| Second inversion | 12 | 12 | 11 | `D G B♭` |

Finding the root inside a shape:

- Root position: the root is the lowest note (string 4).
- First inversion: the root is the **top** note (string 2). In `9 7 8` for `G`, string 2, fret 8 is `G`.
- Second inversion (major or minor): the root is the **middle** note (string 3). In `0 0 0` and in `12 12 11`, string 3 is `G`.

Check with `C` major on the same set:

| Inversion | String 4 | String 3 | String 2 | Notes low to high |
| --- | --- | --- | --- | --- |
| Root position | 10 | 9 | 8 | `C E G` |
| First inversion | 14 | 12 | 13 | `E G C` |
| Second inversion | 5 | 5 | 5 | `G C E` |

First inversion `14 12 13` has the root `C` on string 2, fret 13. The same shape at frets `2 0 1` is `E G C` in the open position.

## Exercises

1. Write root position, first, and second inversions for `F` major, `A` minor, `D` major, and `B♭` major. Expected for `F`: `F A C`, `A C F`, `C F A`. Expected for `A` minor: `A C E`, `C E A`, `E A C`.
2. Name the chord and inversion: `B D G` (bass `B`); `A D F` (bass `A`); `E♭ G C` (bass `E♭`); `D F♯ A` (bass `D`). Expected: `G` major first inversion; `D` minor first inversion; `C` minor first inversion; `D` major root position.
3. Write the slash name for each, low to high: `E G C`; `G C E`; `D F♯ B`; `A D F♯`. Expected: `C/E`, `C/G`, `Bm/D`, `D/A`.
4. On strings 4–3–2, play `G` major in all three inversions using the table. Say aloud the bass note and the root of each.
5. Slide the second-inversion shape `0 0 0` up to `3 3 3`. Name the notes and the chord. Expected: `F B♭ D`, which is `B♭` major in second inversion (the bass `F` is its fifth, and the root `B♭` is the middle note).
6. Find a first-inversion `D` major on strings 4–3–2 (`F♯ A D`). Expected: string 4 fret 4 (`F♯`), string 3 fret 2 (`A`), string 2 fret 3 (`D`): `4 2 3`.
7. Play `C – C/E – F – G` with the bass notes `C E F G` under any shapes. Describe how the bass line differs from `C – C – F – G`.
8. Explain why a `G` chord with `B` as the lowest note is still `G` and not `Bm`. Expected: the pitch classes `G B D` are unchanged; a minor `B` chord needs `B D F♯`.

## Mastery criteria

- **Conceptual:** Define inversion by the lowest sounding note. Separate root, bass, and voicing, and explain what a slash symbol means.
- **Written:** Produce all three inversions of any major, minor, or diminished triad in note names, with correct spelling.
- **Fretboard:** Play all three inversions of a major and a minor triad on strings 4–3–2 and point to the root in each.
- **Aural:** Hear the bass note change while the harmony stays the same, and identify first versus second inversion by the bass.
- **Application:** Play a short progression with slash chords so the bass note is the one written.
