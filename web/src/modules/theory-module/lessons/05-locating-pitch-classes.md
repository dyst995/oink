# Locating pitch classes on the fretboard

**Prerequisites:** Tuning and open strings; half steps and whole steps

**Next:** Octaves on the neck

## Concept

To **locate a pitch class** means to find where it lives on a given string. The method is always the same: start from the open string, count half steps (frets) up to the target, and use the `E`-`F` and `B`-`C` half-step pairs to know where accidentals do and do not occur.

On each string, frets 0-11 contain every pitch class **exactly once**, and fret 12 repeats the open string's class. Here are the naturals by string. The number is the fret.

| String | Naturals and their frets |
| --- | --- |
| 6 | `E` 0, `F` 1, `G` 3, `A` 5, `B` 7, `C` 8, `D` 10, `E` 12 |
| 5 | `A` 0, `B` 2, `C` 3, `D` 5, `E` 7, `F` 8, `G` 10, `A` 12 |
| 4 | `D` 0, `E` 2, `F` 3, `G` 5, `A` 7, `B` 9, `C` 10, `D` 12 |
| 3 | `G` 0, `A` 2, `B` 4, `C` 5, `D` 7, `E` 9, `F` 10, `G` 12 |
| 2 | `B` 0, `C` 1, `D` 3, `E` 5, `F` 6, `G` 8, `A` 10, `B` 12 |
| 1 | same as string 6 (`E` 0, `F` 1, `G` 3, ...) |

Sharps and flats sit on the frets **between** the naturals. For example on string 5, `C♯`/`D♭` is fret 4 (between `C` at 3 and `D` at 5).

## Underlying logic

The table is not something to memorize in isolation. It follows from two facts you already have:

- One fret is one half step (lesson 3).
- The natural notes follow the pattern whole, whole, half, whole, whole, whole, half going `C D E F G A B C`, with the two half steps at `E`-`F` and `B`-`C` (lessons 2 and 3).

So on string 6 starting from `E`: `E` to `F` is a half step (fret 1); `F` to `G` is whole (fret 3); `G` to `A` whole (fret 5); `A` to `B` whole (fret 7); `B` to `C` half (fret 8); `C` to `D` whole (fret 10); `D` to `E` whole (fret 12). The fret numbers come from adding 1 or 2 each time.

This gives you a **derivation** you can run in a second if recall fails, rather than a table you either remember or do not. Fast recall comes from running the derivation until it is automatic, then relying on landmarks.

Useful landmarks:

- Fret 5 on a string is the open note of the next thinner string (string 6 fret 5 is `A`, open string 5), except on string 3, where fret 4 gives open string 2. Fret 12 repeats the open string.
- `E` and `B` are the notes just before a half step. If you are on `E` or `B`, the next fret up is a natural (`F` or `C`), not a sharp.
- Strings 6 and 1 are identical in note layout (both `E`), two octaves apart.

## Musical significance

Fast, accurate note location is what lets you read a chord chart, transpose, or use the key of a song without hunting. It is also what makes theory actionable: a formula like "root, third, fifth" is only useful if you can find the root and count to the other notes. A player who can name any fret immediately can check whether a note they hear or plan fits the key.

Locating notes by counting is slower than recall, but it is always correct, and it trains the underlying structure. Treat the counting as scaffolding that fades as recall gets faster.

## Guitar application

Strategy for finding any note, say `F♯` on string 4:

1. Start from the open string: string 4 is `D`.
2. Count natural steps: `D` (0), `E` (2), `F` (3).
3. `F♯` is one fret above `F`, so fret 4.

You can cross-check with a neighbor. String 5 fret 9 is `F♯`. The same pitch on the next thinner string (string 4) is five frets lower, so string 4 fret 4 (9 minus 5) is the same `F♯`. This five-frets-lower rule holds for every adjacent pair except string 3 to string 2, where it is four frets lower, as the tuning lesson showed.

Use the table as a checker, not a crutch. Then practice with a goal: "Find every `C` in frets 0-12." The answer: string 6 fret 8, string 5 fret 3, string 4 fret 10, string 3 fret 5, string 2 fret 1, and string 1 fret 8.

Ear: before checking the fret, sing the note name you are about to play, then play it and compare. If you cannot yet pitch it exactly, aim for the right direction (up or down from your last note) and confirm.

## Exercises

1. Name the notes at string 6 fret 3, string 5 fret 7, string 4 fret 9, string 3 fret 4, string 2 fret 6. **Check:** `G`, `E`, `B`, `B`, `F`.
2. Find every `A` on frets 0-12 across all six strings. **Check:** string 6 fret 5, string 5 frets 0 and 12, string 4 fret 7, string 3 fret 2, string 2 fret 10, string 1 fret 5.
3. Find `F♯` on strings 6, 5, 4, 3, 2, and 1 within frets 0-12. **Check:** string 6 fret 2, string 5 fret 9, string 4 fret 4, string 3 fret 11, string 2 fret 7, string 1 fret 2.
4. Choose a random string and a random fret. Predict the note by counting from the open string. Then check with the table. Repeat 20 times. **Check:** aim for 18 or more correct without hesitation.
5. Use the Fretboard memorization tool to drill one string at a time. When a string takes under two seconds per note, add the next string.

## Mastery criteria

- **Conceptual:** You can state the rule: count half steps from the open string, with half steps at `E`-`F` and `B`-`C`.
- **Written:** You can write the naturals and fret numbers for a string from memory by derivation.
- **Fretboard:** You can name any note on frets 0-12 of strings 6-1 without hesitation, and find any named pitch class on any string.
- **Aural:** You can sing the note you intend to play and confirm it on the string.
- **Practical:** You can drill note recall for at least five minutes with consistent speed and few errors.
