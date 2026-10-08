# CAGED navigation

**Prerequisites:** Triad string sets; major scale on the neck  
**Next:** Pentatonic and blues

## Concept

**CAGED** is a navigation map built from five open chord shapes: `C`, `A`, `G`, `E`, `D`. Each shape can be moved up the neck (using a barre in place of the open strings) to play the same chord in a new location. The five shapes of one chord appear up the neck in a repeating order and overlap each other, so together they cover the whole fretboard. Each shape also sits inside a nearby scale pattern that contains its chord tones, so the chord shape tells you where the scale notes around it are.

CAGED is a **map**, not a theory of music. It does not tell you which chords to play or why. It helps you see where chord tones and scale notes sit in each region of the neck. It does not replace knowing the note names, and it is not the only way to organize the fretboard.

## Underlying logic

### One chord, five locations

Each open chord is an arrangement of the root, third, and fifth across the strings. Because the tuning is fixed, each arrangement keeps its internal fret pattern when you slide it, and you get the chord whose root is wherever the shape's root lands.

To play chord `X` with shape `S`, shift the open shape by the number of semitones from `S` to `X`, and use a barre where open strings would have been.

For `C` major (strings 6 to 1):

| Shape | Frets | Notes (low to high) | Roots on |
| --- | --- | --- | --- |
| `C` shape (open) | `x32010` | C E G C E | string 5 fret 3, string 2 fret 1 |
| `A` shape (barre fret 3) | `x35553` | C G C E G | string 5 fret 3, string 3 fret 5 |
| `G` shape (frets 5 to 8) | `875558` | C E G C E C | string 6 fret 8, string 3 fret 5, string 1 fret 8 |
| `E` shape (barre fret 8) | `8 10 10 9 8 8` | C G C E G C | string 6 fret 8, string 4 fret 10, string 1 fret 8 |
| `D` shape (frets 10 to 13) | `xx 10 12 13 12` | C G C E | string 4 fret 10, string 2 fret 13 |

In the `E` shape row, the frets from string 6 to string 1 are 8, 10, 10, 9, 8, 8. In the `D` shape row, strings 6 and 5 are muted and strings 4 to 1 are frets 10, 12, 13, 12.

Going up the neck the shapes appear in the order `C`, `A`, `G`, `E`, `D`, then `C` again an octave higher (`x 15 14 12 13 12`). The order is the same for every key; only the fret positions shift.

### The same rule in another key

For `G` major, shift each open shape to a `G` root. The shapes up the neck are `G` (open `320003`), the `E` shape at fret 3 (`355433`), the `D` shape at fret 5 (`xx5787`), the `C` shape at fret 7 (`x10 9 7 8 7`), the `A` shape at fret 10 (`x10 12 12 12 10`), then `G` again at fret 12. The order is `G E D C A`, the same cycle starting at a different shape.

### Chord tones anchor the scale

A scale pattern near a chord shape contains the chord tones plus the scale notes between them. Around the `E`-shape `C` chord (frets 7 to 10):

| String | Frets in this box | Notes |
| --- | --- | --- |
| 6 | 7, 8, 10 | B C D |
| 5 | 7, 8, 10 | E F G |
| 4 | 7, 9, 10 | A B C |
| 3 | 7, 9, 10 | D E F |
| 2 | 8, 10 | G A |
| 1 | 7, 8, 10 | B C D |

Within that box, the `E`-shape chord notes are string 6 fret 8 (`C`), string 5 fret 10 (`G`), string 4 fret 10 (`C`), string 3 fret 9 (`E`), string 2 fret 8 (`G`), and string 1 fret 8 (`C`). The scale grows around them.

### What CAGED does not do

- It does not give every voicing. Many useful chord shapes sit outside the five.
- It maps major triads most directly. Minor, seventh, and pentatonic versions exist (flatten the third, add the seventh), but each is a variation you must learn deliberately.
- It does not name the notes for you.
- It cuts the neck in one way. Three notes per string (next lesson) cuts it another way, and the two views can be used together.

## Musical significance

Playing the same chord in several places lets you choose register, tone color, and string group to suit the music. Seeing chord tones inside the scale pattern gives you reliable targets during improvisation: when the chord changes, you can find the new chord's tones by switching to the matching shape in the region where you are playing.

## Guitar application

### Procedure

1. Choose the chord (for example `C`).
2. Find its root on string 6, string 5, and string 4.
3. The `E` shape's root is on string 6 (barre), the `A` shape's root is on string 5 (barre), and the `D` shape's root is on string 4.
4. For the `C` and `G` shapes, shift the open shape by the distance from `C` (or `G`) to your chord's root.
5. Check by playing each shape and naming the notes on at least two strings.

### Moving between neighboring shapes

Neighboring shapes share notes. The `A`-shape `C` (`x35553`) and the `G`-shape `C` (`875558`) both contain the `C` at string 3 fret 5. Use that shared note as a pivot to change position without losing your place.

## Exercises

1. Play the five `C` major shapes in order from the table and say the root string of each.
2. Play the five `G` major shapes listed above and name the notes of the `D`-shape `xx5787` (string 4 fret 5 `G`, string 3 fret 7 `D`, string 2 fret 8 `G`, string 1 fret 7 `B`).
3. Play the `C` major scale in the frets 7 to 10 box from the table. Slowly play ascending and say `C`, `E`, `G` aloud as you pass each chord tone.
4. Choose `A` major. Using the shift rule, find the `E` shape (fret 5, `577655`) and the `D` shape (fret 7, `xx7 9 10 9`). Write the notes of each.
5. Play a two-chord loop `C` to `F`, using one shape for `C` and a neighboring shape for `F` so that neither chord requires a move of more than three frets.

## Mastery criteria

- **Conceptual:** explain CAGED as five overlapping chord and scale maps, and give two things it does not tell you.
- **Written:** write the five shape names in cyclic order and the fret location of the five `C` major shapes.
- **Fretboard:** play a major chord in all five shapes and name the root string in each.
- **Fretboard:** play the scale fragment around one chord shape and mark the chord tones.
- **Aural:** hear that the same chord in different positions has the same pitch classes but a different register.
- **Application:** play a simple progression, staying in one region of the neck by choosing neighboring shapes.
