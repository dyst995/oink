# Octaves on the neck

**Prerequisites:** Locating pitch classes on the fretboard; pitch, octave, and pitch class

**Next:** Fretboard memorization

## Concept

An **octave** is 12 half steps. On guitar that gives you two ways to find the same pitch class one octave higher:

- **Along one string:** go up **12 frets**. String 5 fret 0 (`A2`) to string 5 fret 12 (`A3`).
- **Across strings:** use a **geometric shape**. Moving two strings toward the thinner side (string 6 to 4, 5 to 3) means going up **2 frets**. Moving from string 4 to 2 or string 3 to 1 means going up **3 frets**.

| From string | To string | Fret change for one octave up |
| --- | --- | --- |
| 6 | 4 | +2 |
| 5 | 3 | +2 |
| 4 | 2 | +3 |
| 3 | 1 | +3 |

Example: `G2` is string 6 fret 3. One octave up is `G3`: string 4 fret 5 (+2), which is also string 3 fret 0 (the open `G`). Another `G` an octave above that is `G4`: string 1 fret 3.

## Underlying logic

The octave shapes are not new facts. They follow from the open-string gaps (5, 5, 5, 4, 5) and the 12-half-step octave.

- Two adjacent strings (the same fret) differ by 5 half steps, or 4 for strings 3 and 2.
- Two strings apart: strings 6 to 4 differ by 5 + 5 = 10 half steps, so an octave (12) needs 12 minus 10 = **+2 frets**. Strings 5 to 3: also 10, so +2.
- Strings 4 to 2: 5 + 4 = 9 half steps, so 12 minus 9 = **+3 frets**. Strings 3 to 1: 4 + 5 = 9, so +3.

That is the whole derivation. Every rule is: **octave = 12 minus the half steps between open strings.** Treat the shape as a **tool you can derive**, not an axiom you must trust. If you forget the shape, you can recompute it in seconds, and if you ever retune, the derivation tells you the new shape.

Two limits of shapes:

- They are one-octave shapes for specific string pairs. The same pitch is often available in several places, so a shape tells you one correct location, not the only one. Any pair that spans the G-to-B gap differs by one fret from a pair that does not.
- A shape only works if the target fret exists. If the answer would be below fret 0, use the same shape in the other direction or a different string pair.

## Musical significance

Octave doubling is everywhere: a bass line doubling a vocal an octave below, a lead guitar doubling a rhythm riff an octave up. Octave shapes also reveal the **same pitch class in multiple registers**, which is how you find a root, third, or fifth in several places and choose the voicing that fits the part.

Octave awareness also clarifies chord names. Notes may be spread over several octaves (for example, a root at string 5 and again at string 3), but they are still the same chord because pitch class, not register, determines the chord's identity.

## Guitar application

Three practical uses:

1. **Find a root in several registers.** Root `A`: string 6 fret 5 (`A2`), string 4 fret 7 (`A3`), string 2 fret 10 (`A4`), and string 1 fret 5 (also `A4`, the same pitch as string 2 fret 10). The shapes check out: 6 to 4 is +2 (fret 5 to 7), 4 to 2 is +3 (fret 7 to 10).
2. **Play octave dyads.** On strings 6 and 4, play fret `n` and fret `n + 2` together (for example, frets 3 and 5 for `G2` and `G3`). Mute the string in between with a finger or palm.
3. **Check with a harmonic.** Lightly touch a string directly over the 12th-fret wire (not behind it) and pick. The harmonic matches the fretted 12th-fret note, one octave above the open string.

Ear: play the lower note, then the upper note, and listen for the strong sense of sameness. Then play them together and compare with an octave dyad of different notes. Octaves almost merge into one tone, with little roughness.

## Exercises

1. Derive the octave shape from strings 4 to 2 using only the open-string pitches. **Check:** `D3` to `D4`: `D4` is on string 2 fret 3, so +3 from string 4 fret 0.
2. Starting from string 6 fret 5 (`A`), find the `A` one octave up on strings 4 and then 2 and 1. **Check:** string 4 fret 7; string 2 fret 10; string 1 fret 5.
3. Find the octave above `C` at string 5 fret 3 on string 3. **Check:** string 3 fret 5 (+2).
4. Suppose string 2 were retuned down a half step to `B♭`. What would the octave shape from string 4 to string 2 become? **Check:** `D3` to `B♭3` is 8 half steps, so 12 minus 8 = +4 (string 4 fret 0 `D3` and string 2 fret 4 `D4`).
5. Ear test: play a random note on string 6, then try to sing the octave above. Verify with the shape (+2 frets, two strings up). Try five notes.

## Mastery criteria

- **Conceptual:** You can explain why the octave shape depends on the string pair and derive it from open-string gaps.
- **Written:** You can write all four octave shapes from memory and justify each.
- **Fretboard:** Given a note, you can find its octave up and down on the same string and across strings quickly.
- **Aural:** You can hear an octave as "the same note, higher" and sing one from a played note.
- **Application:** You can find a root in three registers and choose which one fits a bass line, rhythm part, or lead.
