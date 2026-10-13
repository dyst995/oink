# Intervals on the neck: derive, locate and use

**Prerequisites:** Open-string tuning; octaves; interval names, spelling and inversion  
**Next:** Major scale construction

## Learning goals
Calculate intervals between **any two fretted notes**, not only adjacent strings; locate interval targets from a root; handle the G–B tuning exception; and connect shapes to real notes and chord tones.

## 1. Standard tuning is a pitch map
Open strings, low to high:
| String | Pitch | MIDI number |
| --- | --- | ---: |
| 6 | E2 | 40 |
| 5 | A2 | 45 |
| 4 | D3 | 50 |
| 3 | G3 | 55 |
| 2 | B3 | 59 |
| 1 | E4 | 64 |

Adjacent strings are **five semitones** apart except G3→B3 (strings 3→2), which is **four**. Each fret adds one semitone. The string number alone does **not** guarantee which played note is higher: high frets on thick strings can exceed low frets on thinner ones.

## 2. The universal calculation
Assign each played note its pitch number:

**pitch = open-string MIDI number + fret**

Then calculate:

**signed distance = second pitch − first pitch**.

Positive = ascending, negative = descending, zero = unison. The **absolute value** gives the semitone size. Finally, use the **spelled note letters** to determine the interval number and quality. Semitone distance alone cannot distinguish enharmonic interval names.

**Example A: sixth string fret 8 to second string fret 1.**
- 6th open E2 = 40; +8 = **48 (C3)**.
- 2nd open B3 = 59; +1 = **60 (C4)**.
- 60 − 48 = **12**: **P8**, one octave.

**Example B: sixth string fret 8 to second string fret 5.**
- C3 = 48; B3 + 5 = **64 (E4)**.
- 64 − 48 = **16**: **M10**, a major third plus one octave.

**Example C: fifth string fret 3 to fourth string fret 2.**
- A2 + 3 = **C3** (48).
- D3 + 2 = **E3** (52).
- 52 − 48 = **4**: **M3**.

**Example D: sixth string fret 12 (E3) to first string open (E4).**
- E2 + 12 = E3 (52); E4 = 64; difference **12** = P8.

## 3. Adjacent-string shortcut
For the next thinner string, let **g** be the gap between the open strings (5 normally; 4 from G to B). If your root is at fret **r**, and the target interval is **n** semitones above it, the target fret is:

**target fret = r + n − g**

Thus **fret offset = n − g**.

| Interval | Semitones | Normal adjacent pair: offset | G→B pair: offset |
| --- | ---: | ---: | ---: |
| m2 | 1 | −4 | −3 |
| M2 | 2 | −3 | −2 |
| m3 | 3 | −2 | −1 |
| M3 | 4 | −1 | 0 |
| P4 | 5 | 0 | +1 |
| Tritone | 6 | +1 | +2 |
| P5 | 7 | +2 | +3 |
| m6 | 8 | +3 | +4 |
| M6 | 9 | +4 | +5 |
| m7 | 10 | +5 | +6 |
| M7 | 11 | +6 | +7 |
| P8 | 12 | +7 | +8 |

**Example:** Root A2 at sixth-string fret 5. For a P5, n = 7 and g = 5, so fifth-string target fret = 5 + 7 − 5 = **7**, giving E3.

**G→B exception:** Root A3 at third-string fret 2. P5 = E4; target on second string = 2 + 7 − 4 = **5**.

A negative offset is **relative to the root fret**, not a negative physical fret. If the calculated target is below fret zero, that fingering does not exist: change strings or octaves.

## 4. Nonadjacent strings: sum the tuning gaps
The same formula works across *any* strings if you use the total gap between their open pitches:

**target fret = root fret + desired semitones − total open-string gap**.

Examples of total open-string gaps:
- String 6→4: 10 semitones.
- String 5→3: 10 semitones.
- String 4→2: 9 semitones (crosses G→B).
- String 6→2: 19 semitones.
- String 6→1: 24 semitones.

**Worked example: C3 on string 6 fret 8 → E4 on string 2.**
Desired M10 = 16 semitones; gap from open string 6 to 2 = 19.
Target fret = 8 + 16 − 19 = **5**. The note is E4, string 2 fret 5.

**Worked example: G2 on string 6 fret 3 → G3 on string 4.**
Desired octave = 12; open-string gap = 10.
Target fret = 3 + 12 − 10 = **5**: string 4 fret 5.

This arithmetic describes pitch; still check note spelling to decide whether an enharmonic distance is, for example, A4 or d5.

## 5. Shape vocabulary: understand, don't merely memorize
From sixth-string fret 3 (G2):
- **M3**: fifth-string fret 2 (B2).
- **m3**: fifth-string fret 1 (B♭2).
- **P5**: fifth-string fret 5 (D3).
- **P8**: fourth-string fret 5 (G3).
- **m7**: fourth-string fret 3 (F3).

From fifth-string fret 3 (C3):
- **M3**: fourth-string fret 2 (E3).
- **P5**: fourth-string fret 5 (G3).
- **P8**: third-string fret 5 (C4).

A power chord is a root plus fifth, often doubled with an octave. The familiar “two frets up, one string thinner” fifth shape is a consequence of tuning: 7 − 5 = 2.

## 6. Multiple locations and octave displacement
The **same pitch** can be played in multiple places: C3 is sixth-string fret 8 *and* fifth-string fret 3. These positions form a **unison**, not an octave. C4 is second-string fret 1, third-string fret 5, fourth-string fret 10, fifth-string fret 15 and sixth-string fret 20 (if available).

When you relocate a note, ask: did its **pitch** stay the same, or did you shift it by an octave? Chord-tone identity (third, fifth, etc.) can stay the same while the exact interval above the bass changes.

## 7. A practical interval routine
1. Choose a root, such as C3 (string 5 fret 3).
2. Name a target interval *before* touching the guitar: M3 = E; P5 = G; m7 = B♭.
3. Find the note on the **same string**, then the next string, then a nonadjacent string using the gap formula.
4. Say both the **note name** and **exact interval** (including compound number).
5. Play root and target melodically, then together as a double-stop.
6. Repeat from a different root and cross the G–B string pair deliberately.
7. Finally, use the intervals to build a triad or a short melodic phrase.

## Exercises
1. Identify notes and intervals: string 6 fret 8 → string 5 fret 3; string 6 fret 8 → string 2 fret 1; string 6 fret 8 → string 2 fret 5.  
2. From fifth-string fret 3 (C3), find M3 and P5 on string 4.  
3. From third-string fret 2 (A3), find M3 and P5 on string 2.  
4. From sixth-string fret 3 (G2), find the octave on string 4.  
5. Calculate the total open-string gap from string 5 to string 2.  
6. Why can a note on a thinner string be *lower* than a note on a thicker string?

### Answers
1. C3→C3 = P1 (unison); C3→C4 = P8; C3→E4 = M10.  
2. E3 at fret 2; G3 at fret 5.  
3. C♯4 at fret 2; E4 at fret 5.  
4. G3 at fourth-string fret 5.  
5. 5 + 5 + 4 = **14** semitones.  
6. Fretting can raise the thicker string's pitch enough to exceed the thinner string's low-fret pitch.

## Mastery check
Without consulting a shape diagram, you can compute the semitone distance between arbitrary fretboard positions, name the notes and exact interval, find a requested interval on different strings, and explain the G–B tuning exception.
