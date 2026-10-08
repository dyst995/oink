# Intervals on the neck

**Prerequisites:** Locating pitch classes; interval names  
**Next:** Constructing the major scale

**Prerequisites:** Interval names and quality; interval spelling and inversion; octaves on the neck; tuning and open strings

**Next:** The major scale

## Concept

Every interval has a **physical location** relative to a root on the guitar. Two situations cover almost everything:

1. **On one string:** frets equal half steps, so an interval is a fret offset.
2. **Across strings:** the gap between open strings (5 half steps, except 4 between strings 3 and 2) changes the fret offset.

Here are the fret offsets from a root to a note **higher in pitch**. "Next string" means the next thinner string (string 6 to 5, 5 to 4, 4 to 3, or 2 to 1).

| Interval | Half steps | Same string | Next string (not 3 to 2) | String 3 to 2 |
| --- | --- | --- | --- | --- |
| m2 | 1 | +1 | -4 | -3 |
| M2 | 2 | +2 | -3 | -2 |
| m3 | 3 | +3 | -2 | -1 |
| M3 | 4 | +4 | -1 | 0 |
| P4 | 5 | +5 | 0 | +1 |
| Tritone | 6 | +6 | +1 | +2 |
| P5 | 7 | +7 | +2 | +3 |
| m6 | 8 | +8 | +3 | +4 |
| M6 | 9 | +9 | +4 | +5 |
| m7 | 10 | +10 | +5 | +6 |
| M7 | 11 | +11 | +6 | +7 |
| P8 | 12 | +12 | +7 | +8 |

The table is a fast reference, but you should be able to rebuild it from two facts: **half steps = frets** and **the open-string gap**.

## Underlying logic

A note on the next thinner string at the same fret is already 5 half steps higher (4 for the string 3 to 2 pair). So to reach an interval of `n` half steps, you need `n - 5` frets of offset (or `n - 4` across strings 3 and 2). A P4 across strings is the same fret because the tuning is built from P4s.

Two ways to use this:

- **Derive.** "I want a major 3rd (4) on the next string. 4 minus 5 is -1: one fret lower." Fast, reliable, and works on any string pair, even in other tunings once you know the gaps.
- **Recognize.** Familiar shapes (a power chord, an octave shape) are repeated fret offsets. They are consequences, not axioms.

Important cautions:

- **The offset changes when you cross strings 3 and 2.** A shape that spans only the lower four strings does not look the same when moved to the top strings. Moving it requires a one-fret adjustment, which is why the same chord shape changes when transposed across that gap.
- **Offsets measure pitch, not string number.** A note on a thinner string can be lower in pitch than a note on a thicker string when the fret on the thinner string is low and the fret on the thicker string is high. Always check which note is higher before naming the interval. If the second note is lower, the interval is descending.
- A negative fret offset means the note is on a lower fret of the next string. If that fret is below 0, the note is not available there. Find it on the same string or in another octave.
- The same pitch can appear in several places. An interval has many locations; pick the one that suits the passage.

## Musical significance

Players hear and play melodies as interval patterns. Knowing where each interval lives lets you transcribe by ear (find the next note by guessing the interval), improvise with chord tones, and build chords from the root without memorizing every shape. It also lets you move **one** pattern to any root.

Intervals on the neck are also how many standard chord shapes arise. A major triad contains M3 and P5 above the root; a minor triad contains m3 and P5. Each tone is a fret offset away from the root, and those offsets change if you change string pairs.

## Guitar application

**One string.** Root on string 6 fret 5 (`A`). Major 3rd: fret 9 (`C♯`). Perfect 5th: fret 12 (`E`). Minor 7th: fret 15 (`G`), if the neck has it, or use an octave lower.

**Across strings (not crossing 3 to 2).** Root on string 6 fret 5 (`A`):

- P4: string 5 fret 5 (`D`).
- M3: string 5 fret 4 (`C♯`).
- m3: string 5 fret 3 (`C`).
- P5: string 5 fret 7 (`E`).
- m7: string 5 fret 10 (`G`).

Power chord check: root `G` on string 6 fret 3, P5 `D` on string 5 fret 5, and octave `G` on string 4 fret 5.

**Across strings 3 and 2.** Root on string 3 fret 5 (`C`):

- M3: string 2 fret 5 (`E`), the same fret.
- P4: string 2 fret 6 (`F`).
- P5: string 2 fret 8 (`G`).

Compare two perfect 5ths. From string 4 fret 3 (`F`), the P5 `C` is on string 3 fret 5: +2. From string 3 fret 2 (`A`), the P5 `E` is on string 2 fret 5: +3. The extra fret comes from crossing the G-to-B gap.

Ear: play each interval on one string (frets +3, +4, +7), then the same pitch classes across strings. The same-size intervals sound alike, with a difference in tone (strings differ in thickness and timbre). Practice naming the interval you hear first, then verify with the fret offset.

## Exercises

1. Starting from string 6 fret 5 (`A`), find on string 5: M3, P5, M6, m7. **Check:** fret 4 (`C♯`), fret 7 (`E`), fret 9 (`F♯`), fret 10 (`G`).
2. Starting from string 5 fret 3 (`C`), find on string 4: m3 and M3. **Check:** string 4 fret 1 (`E♭`) and fret 2 (`E`).
3. Starting from open string 3 (`G`), find on string 2: P4, M3, P5. **Check:** fret 1 (`C`), fret 0 (`B`), fret 3 (`D`).
4. Without checking the table, derive the fret offset for a tritone across a normal string pair and across string 3 to 2. **Check:** +1 and +2.
5. A `C` major triad has the notes `C E G`. With the root on string 5 fret 3, find `E` on string 4 and `G` on string 3 within frets 0-5. **Check:** `E` at string 4 fret 2, `G` at string 3 fret 0 (open). Then name the intervals above the root: M3 and P5.
6. Ear drill: with a partner (or a recording of yourself made earlier), have a root played on string 6 and a second note played on string 5 at a secret offset from the table. Name the interval by ear, then confirm with the fret offset. Do ten rounds, mixing M3, m3, P4, P5, and m7.

## Mastery criteria

- **Conceptual:** You can explain why the fret offset to the next string is `n - 5` (and `n - 4` across strings 3 and 2).
- **Written:** You can fill in the offset table for same string, next string, and the string 3 to 2 pair, using derivation, not memory alone.
- **Fretboard:** From any root, you can find each common interval (m3, M3, P4, P5, m7) on the same string and the next string.
- **Aural:** You can identify an interval by ear on one string and then find the same interval on another string pair.
- **Practical:** You can play power chords and major and minor triad shapes by thinking "root plus these intervals," and adjust them correctly when crossing strings 3 and 2.
