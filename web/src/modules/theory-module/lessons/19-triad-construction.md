# Triad construction

**Prerequisites:** Modes in context; interval names and quality  
**Next:** Triad inversions

## Concept

A **triad** is three pitch classes stacked in thirds: a **root**, a **third** above it, and a **fifth** above that. Four qualities are common, each defined by its two stacked thirds:

| Quality | Stack | Formula | Half steps from root | Symbol |
| --- | --- | --- | --- | --- |
| Major | M3 + m3 | `1 3 5` | `0 4 7` | `C`, `Cmaj` |
| Minor | m3 + M3 | `1 ♭3 5` | `0 3 7` | `Cm`, `Cmin` |
| Diminished | m3 + m3 | `1 ♭3 ♭5` | `0 3 6` | `Cdim`, `C°` |
| Augmented | M3 + M3 | `1 3 ♯5` | `0 4 8` | `Caug`, `C+` |

Two things decide the sound:

- The **third** separates major from minor.
- The **fifth** is perfect in major and minor, lowered in diminished, raised in augmented.

Spelling is part of the definition. A triad uses three **letters a third apart**: the root letter, two letters up, four letters up. `C` triads use `C E G`. Accidentals adjust the sound without changing the letters.

## Underlying logic

**Why thirds.** Stacking thirds takes every other letter of the alphabet. Root and fifth reinforce each other; the third sets the color. This three-note unit is the basic chord material of tonal music.

**Two ways to build any triad.** Practice both until they agree.

1. **From the major scale on the root.** Take `1 3 5` and alter. `C` major is `C D E F G A B`, so `1 3 5` is `C E G` (major). Flatten the third for minor: `C E♭ G`. Flatten the fifth too for diminished: `C E♭ G♭`. Raise the fifth for augmented: `C E G♯`.
2. **From stacked thirds.** Put a third above the root, then a third above that. A major third spans 4 half steps, a minor third 3. For diminished: `C` to `E♭` is a minor third, and `E♭` to `G♭` is a minor third.

**Spelling procedure.**

1. Write the three letters: root, +2 letters, +4 letters.
2. Apply the formula to decide which accidentals each letter needs.
3. Check the half-step counts: `0 4 7`, `0 3 7`, `0 3 6`, or `0 4 8`.

**Letters, not just sounds.** `C E♭ G` is `C` minor. `C D♯ G` sounds the same on a guitar but is not a spelling of a `C` minor triad: `D` is not a third above `C`. Do not trade correct letters for easier accidentals.

Awkward roots to practice:

- `E` augmented: `E G♯ B♯`, not `E G♯ C`. The fifth of `E` takes the letter `B`.
- `F♯` diminished: `F♯ A C`. The fifth of `F♯` takes the letter `C`. The perfect fifth is `C♯`, so the diminished fifth is `C` natural.
- `D♭` major: `D♭ F A♭`. `F` is natural because the third above `D♭` is a major third.

**Symmetry of augmented.** Two stacked major thirds divide the octave into three equal parts. The pitch classes `C E G♯` are also `E G♯ B♯` (`E` augmented) and `A♭ C E` (`A♭` augmented). One augmented triad therefore has three possible roots, and the spelling tells you which is meant. Diminished triads are not symmetric (the diminished seventh chord is).

## Musical significance

The four qualities have distinct jobs:

- **Major** is stable and bright. It is the usual chord for I, IV, and V in a major key.
- **Minor** is stable and darker. It is I in minor, and ii, iii, and vi in major.
- **Diminished** is unstable. Both thirds are small and the root and fifth form a tritone, so the chord wants to resolve. It appears as vii° in major and ii° in minor.
- **Augmented** is unstable in a different way: floating, with two equal intervals and no single clear center. It is rare and usually passing.

A major triad is a major third with a minor third on top; minor reverses the order. That single flip changes the mood of the whole chord.

## Guitar application

**Open chords as doubled triads.** Open chords repeat the same three pitch classes. `C` (`x32010`) is `C E G C E` on strings 5 to 1. `Am` (`x02210`) is `A E A C E`. `G` (`320003`) is `G B D G B G` on strings 6 to 1. These are voicings of one triad, not different chords.

**One root, four qualities on strings 4–3–2 (`D G B`).** Take root `G` on string 4, fret 5. All four qualities sit within a one-fret difference:

| Quality | String 4 (root) | String 3 (third) | String 2 (fifth) | Notes |
| --- | --- | --- | --- | --- |
| Major | fret 5 | fret 4 | fret 3 | `G B D` |
| Minor | fret 5 | fret 3 | fret 3 | `G B♭ D` |
| Diminished | fret 5 | fret 3 | fret 2 | `G B♭ D♭` |
| Augmented | fret 5 | fret 4 | fret 4 | `G B D♯` |

The frets are the formula. Major to minor: the third moves down one fret (string 3, 4 to 3). Minor to diminished: the fifth moves down one fret (string 2, 3 to 2). Major to augmented: the fifth moves up one fret (string 2, 3 to 4).

The recipe moves with the root. With root `C` on string 4, fret 10: major is `10 9 8`, minor `10 8 8`, diminished `10 8 7`, augmented `10 9 9`.

Why the major shape descends: from string 4 to string 3 the open tuning gap is 5 half steps, and a major third is 4, so the third is one fret lower. From string 4 to string 2 the gap is 9, and a perfect fifth is 7, so the fifth is two frets lower.

## Exercises

1. Spell major triads on `D`, `F`, `A`, `B♭`, `E♭`, and `F♯`. Expected: `D F♯ A`; `F A C`; `A C♯ E`; `B♭ D F`; `E♭ G B♭`; `F♯ A♯ C♯`.
2. Spell minor triads on `E`, `A`, `B`, `C`, `F♯`, and `B♭`. Expected: `E G B`; `A C E`; `B D F♯`; `C E♭ G`; `F♯ A C♯`; `B♭ D♭ F`.
3. Spell diminished triads on `B`, `F♯`, `C`, `G`, and `A`. Expected: `B D F`; `F♯ A C`; `C E♭ G♭`; `G B♭ D♭`; `A C E♭`.
4. Spell augmented triads on `C`, `D`, `E`, and `F`. Expected: `C E G♯`; `D F♯ A♯`; `E G♯ B♯`; `F A C♯`.
5. Name the root and quality: `A C♯ E`, `D F A♭`, `E♭ G♭ B♭`, `G B♭ D♭`, `B D♯ F♯`. Expected: `A` major, `D` diminished, `E♭` minor, `G` diminished, `B` major.
6. Find the error and correct it: `G B D♯` called `G` major; `C E♭ G♭` called `C` minor; `E G♯ C` called `E` augmented. Expected: `G B D♯` is `G` augmented; `C E♭ G♭` is `C` diminished; `E G♯ C` should be spelled `E G♯ B♯`.
7. On strings 4–3–2 with root `C` at string 4, fret 10, play major (`10 9 8`), minor (`10 8 8`), diminished (`10 8 7`), and augmented (`10 9 9`). Name each note aloud.
8. Using the same fret recipes, build all four qualities on root `D` at string 4, fret 12 (fret 0 does not work: the third and fifth would need negative frets). Expected: major `12 11 10` (`D F♯ A`), minor `12 10 10` (`D F A`), diminished `12 10 9` (`D F A♭`), augmented `12 11 11` (`D F♯ A♯`).
9. Play a `C` major triad, then lower its third one fret, then lower its fifth one fret. Describe each sound in one word and say which note changed.

## Mastery criteria

- **Conceptual:** Define each of the four qualities by its stack of thirds, formula, and half-step count. Explain why letter spelling matters.
- **Written:** Spell all four qualities on any root, including awkward ones such as `E` augmented and `F♯` diminished, with correct letters.
- **Fretboard:** On strings 4–3–2, build all four qualities from one root by moving only the third and the fifth, naming each note.
- **Aural:** Distinguish major from minor, and both from diminished and augmented, played on guitar from the same root.
- **Application:** Read the three pitch classes in an open chord fingering and identify which are doubled.
