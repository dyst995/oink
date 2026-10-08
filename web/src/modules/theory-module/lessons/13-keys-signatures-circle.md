# Keys, key signatures, and the circle of fifths

**Prerequisites:** Scale degrees and formulas  
**Next:** The major scale across the neck

## Concept

A **key** is a set of pitch classes organized around one **tonic**: the note that feels like home. "In the key of `G` major" means the music uses the `G` major collection and treats `G` as the point of rest. **Tonality** is that organization: some notes and chords resolve toward others, and the tonic is where they resolve.

A **key signature** is the written list of sharps or flats that every note of that name receives throughout the piece. It tells you which collection of seven letters is in use. It does not, by itself, tell you the tonic: a signature belongs equally to a major key and its relative minor (lesson 15).

The **circle of fifths** arranges the twelve keys so that neighbours differ by exactly one accidental.

## Underlying logic

Start from the tetrachord split in lesson 11. The upper four notes of `C` major are `G A B C` (W W H). Those same notes are the lower tetrachord of `G` major. To finish `G` major you need a new upper tetrachord starting on `D`: `D E F♯ G`. The only change from `C` major is `F` becoming `F♯`.

So moving **up a perfect fifth** (`C` to `G`) adds **one sharp**, always on the new key's degree 7. Moving **down a perfect fifth** (`C` to `F`) adds **one flat**, always on the new key's degree 4. The two collections share six of seven notes.

This gives fixed orders:

- Order of sharps: `F♯ C♯ G♯ D♯ A♯ E♯ B♯`.
- Order of flats: `B♭ E♭ A♭ D♭ G♭ C♭ F♭`. It is the sharps order reversed.

| Key | Sharps or flats | Accidentals |
| --- | --- | --- |
| `C` | 0 | none |
| `G` | 1 sharp | `F♯` |
| `D` | 2 sharps | `F♯ C♯` |
| `A` | 3 sharps | `F♯ C♯ G♯` |
| `E` | 4 sharps | `F♯ C♯ G♯ D♯` |
| `B` | 5 sharps | `F♯ C♯ G♯ D♯ A♯` |
| `F♯` | 6 sharps | `F♯ C♯ G♯ D♯ A♯ E♯` |
| `F` | 1 flat | `B♭` |
| `B♭` | 2 flats | `B♭ E♭` |
| `E♭` | 3 flats | `B♭ E♭ A♭` |
| `A♭` | 4 flats | `B♭ E♭ A♭ D♭` |
| `D♭` | 5 flats | `B♭ E♭ A♭ D♭ G♭` |
| `G♭` | 6 flats | `B♭ E♭ A♭ D♭ G♭ C♭` |

`F♯` and `G♭` major sound identical but are spelled differently. Both are real keys with different signatures.

Reading a signature quickly:

- **Sharp keys:** the last sharp in the order is degree 7. The tonic is a half step above it. Three sharps (last is `G♯`) means `A`.
- **Flat keys:** the second-to-last flat is the tonic. Three flats (`B♭ E♭ A♭`): second-to-last is `E♭`. Exception: one flat is `F`, which you memorize.

## Musical significance

Key signatures keep notation readable and tell you what the "normal" notes are. Accidentals outside the signature are the interesting ones: they signal chromatic color, a borrowed note, or a change of key.

Neighbours on the circle are closely related. `C` major's neighbours `G` and `F` supply its most important chords: `G` is its dominant (V) and `F` its subdominant (IV). Most songs modulate to a neighbour first, because only one note changes.

Descending-fifth motion (`C → F`, `A → D → G`) is one of the most common root movements in tonal music, so the circle is also a map of strong progressions.

## Guitar application

Moving by a fifth is a fixed shape on the neck. From a root on string 6 at fret `r`:

- Up a fifth: string 5, fret `r+2`.
- Down a fifth (same as up a fourth): string 5, fret `r`.

From `C` at string 6, fret 8: the `G` is at string 5, fret 10 and the `F` is at string 5, fret 8. Both are neighbours on the circle.

Going **up a fourth** is the same fret one string toward string 1 for the string pairs 6–5, 5–4, and 4–3 (`E→A→D→G`). The 3–2 pair (`G→B`) is only a major third, so the "same fret" rule breaks there; do not extend it across that pair.

Practical key finding on guitar:

1. Look at the chords. `C`, `G`, and `D` are three adjacent keys on the circle. The middle one (`G`) is the likely tonic, with `C` as IV and `D` as V.
2. Test with the signature: `G`, `C`, `D`, `Em`, and `Am` all use only the notes of `G` major (one sharp, `F♯`). A chord such as `D7` or `Bm` also fits. An `F` or `B♭` chord does not.
3. Confirm by ear: where does the music settle? That chord is the tonic.

## Exercises

1. Write the key signature of `A`, `E`, `B♭`, and `D♭` as lists of accidentals. Expected: `F♯ C♯ G♯`; `F♯ C♯ G♯ D♯`; `B♭ E♭`; `B♭ E♭ A♭ D♭ G♭`.
2. Name the major key from the signature: 4 flats, 2 sharps, 5 sharps, 1 flat. Expected: `A♭`, `D`, `B`, `F`.
3. Fill in the circle of fifths clockwise from `C` for all 12 keys. Expected: `C G D A E B F♯ D♭ A♭ E♭ B♭ F`.
4. Which two notes differ between `D` major and `A` major? Expected: only `G` (in `D`) versus `G♯` (in `A`). The new sharp is degree 7 of the new key.
5. On string 6, root `A` at fret 5. Find `E` (the fifth up) and `D` (the fifth down) on string 5. Expected: string 5 fret 7 and string 5 fret 5.
6. A song in `D` uses `D G A Bm`. Which chords are neighbours of `D` on the circle? Expected: `G` and `A`.
7. Play `G` (string 6, fret 3), then `D` (string 5, fret 5), then `A` (string 4, fret 7), then `E` (string 3, fret 9). Each is a fifth above the last. Listen to how each step feels fresh but related.

## Mastery criteria

- **Conceptual:** Distinguish key from key signature. Explain why moving up a fifth adds a sharp, using the tetrachord split.
- **Written:** Write signatures for any key up to six accidentals, both directions, from the rules not from memory alone.
- **Fretboard:** From any root on string 6, find the fifth above and below it on string 5 without counting from open.
- **Aural:** Hear a tonic: sing or hum where a short progression resolves.
- **Application:** Use the circle to find the I, IV, and V chords of a key, and to choose a likely key for a set of chords.
