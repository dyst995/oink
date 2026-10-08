# Pitch, octave, and pitch class

**Prerequisites:** None

**Next:** The twelve pitch classes

## Concept

**Pitch** is how high or low a note sounds. Physically it corresponds to the frequency of the vibration, measured in hertz (Hz). A string vibrating 110 times per second sounds lower than one vibrating 220 times per second.

An **octave** is the distance between a pitch and the pitch with double its frequency (a 2:1 ratio). Notes an octave apart are different pitches, but they sound strongly alike, so music gives them the same letter name.

A **pitch class** is the name shared by every pitch that is a whole number of octaves apart. `A` is a pitch class. `A2`, `A3`, and `A4` are three different pitches in that class. The number is the **octave number** and tells you which one.

| Pitch (with octave) | Pitch class | Frequency (approx.) |
| --- | --- | --- |
| `A2` | `A` | 110 Hz |
| `A3` | `A` | 220 Hz |
| `A4` | `A` | 440 Hz |

## Underlying logic

Frequency is perceived roughly logarithmically: what your ear hears as "the same distance" is a constant ratio, not a constant number of hertz. Going from 110 Hz to 220 Hz sounds like the same step as 220 Hz to 440 Hz, even though the second gap is twice as large in hertz. That is why the octave is defined by doubling, not by adding.

Octave equivalence is what lets us use a small set of names. Instead of naming every audible pitch separately, we name the classes and add an octave number only when we need to say which one. The class tells you **what** note; the octave number tells you **where**.

Two cautions:

- Same pitch class does not mean same sound. `E2` and `E4` are clearly different pitches. They are the "same note" only in the naming system.
- Octave numbers here are **sounding** pitch (scientific pitch notation, where `A4` = 440 Hz and middle `C` = `C4`). Guitar music is usually written one octave higher than it sounds, so a written `E3` sounds as `E2`.

## Musical significance

Octave equivalence is the foundation of nearly all Western theory. Scales repeat at the octave, chords can be spread across octaves without changing their name, and a melody sung by a low voice and a high voice an octave apart still counts as "the same tune." Doubling a part an octave higher or lower thickens a sound without adding a new harmony.

Pitch versus pitch class also changes what question you are asking. "Which note is this?" is a pitch-class question. "Which of those two `E`s is higher?" is a pitch question. Chord and scale theory mostly asks the first; arranging, voicing, and melody writing ask both.

## Guitar application

The open strings in standard tuning are, from string 6 (lowest) to string 1 (highest): `E2`, `A2`, `D3`, `G3`, `B3`, `E4`. String 6 and string 1 are both `E`: same pitch class, two octaves apart (24 semitones, two octaves).

- Open string 5 is `A2` (110 Hz). Its 12th-fret note is `A3` (220 Hz), exactly one octave up.
- The 12th fret sits at half the string's vibrating length, which is why it doubles the frequency. Frets are not evenly spaced; they get closer together up the neck, but each fret is still the same pitch step.
- You can play the same pitch class in many places. `E` appears at string 6 open (`E2`), string 4 fret 2 (`E3`), string 2 fret 5 (`E4`), and string 1 open (`E4`). The first three are three different pitches; the last two are the same pitch played on two strings.

Hear it: play open string 6, then string 4 fret 2. Both are `E`. Sing the first one and slide your voice to match the second. Most people find it natural to "land" on the matching note an octave up or down. Then play string 6 open and string 1 open together and listen for how well they blend.

## Exercises

1. Name the pitch class of each: `C3`, `C5`, `G2`, `G4`. **Check:** `C`, `C`, `G`, `G`. Then say which of each pair is higher: `C3` or `C5` (`C5`); `G2` or `G4` (`G4`).
2. If `A4` is 440 Hz, what is the frequency of `A5`? Of `A3`? **Check:** 880 Hz and 220 Hz.
3. Play open string 5 (`A2`), then string 5 fret 12 (`A3`). Say what changed and what stayed the same. **Check:** the pitch is higher (`A3` vs `A2`), but the pitch class is still `A`.
4. Using frets 0-5 only, find every place `E` occurs on strings 6, 4, 2, and 1. **Check:** string 6 fret 0 (`E2`), string 4 fret 2 (`E3`), string 2 fret 5 (`E4`), string 1 fret 0 (`E4`). Which two are the same pitch? (The last two.)
5. Ear drill: play any note on string 6, then sing the same pitch class an octave above. Check by playing the note two strings up and two frets higher (string 6 fret `n` to string 4 fret `n+2`, which is exactly one octave up). Repeat for five different starting notes. If you are off, decide whether you went too high, too low, or landed on a different pitch class.

## Mastery criteria

- **Conceptual:** You can explain the difference between pitch, octave, and pitch class without using the other terms in the definition.
- **Written:** Given a list of notes with octave numbers, you can group them by pitch class and order them by pitch.
- **Fretboard:** You can find at least three different pitches that share a pitch class on your guitar and say which is highest.
- **Aural:** You can hear that two notes an octave apart are "the same note" in name while clearly different in height, and you can match an octave by singing.
- **Application:** You can say why `E2` and `E4` on your guitar count as one pitch class but are not interchangeable in a part you are playing.
