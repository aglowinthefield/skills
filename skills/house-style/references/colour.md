# Colour tradition

Tom's palettes come from the tradition of editor and terminal themes built for reading code for hours. Four themes mark it: Compline, Everforest, Gruvbox and the Base16 system. They are references for the feel, not palettes to copy. Each repo designs its own palette in this tradition and records it in `DESIGN.md`.

| Reference | What it teaches |
| --- | --- |
| [Compline and Lauds](https://github.com/joshuablais/compline) (Joshua Blais) | The quiet end: hues "as whispers of the same tone", accent saturation 9 to 27%. Closest to Tom's own work. |
| [Everforest](https://github.com/sainnhe/everforest) (sainnhe) | Warm green-grey, soft contrast that still reads. |
| [Gruvbox](https://github.com/morhetz/gruvbox) (morhetz) | The loud end of the tradition: retro warmth, accents up to full saturation, still on a lifted dark ground. |
| [Base16](https://github.com/tinted-theming/home) | The structure: a short neutral ramp plus eight accents, each with a fixed meaning. |

## What they share

Measured in HSL (hue, saturation, lightness) across the four:

- **Lifted darks.** Dark backgrounds sit at 9 to 20% lightness, never black, and lean cool (hue 206 to 214) or neutral.
- **Cream lights.** Text on dark is warm off-white (hue 41 to 48, lightness 75 to 93%). Light backgrounds are warm paper (hue 44 to 48, lightness 88 to 94%), never pure white.
- **Warm against cool.** A cool-grey ground under warm text, and the reverse in light mode.
- **One lightness band for accents.** Within a theme, the accents sit close in lightness (Compline within 3 points), so status colours read as a family and no hue shouts.
- **A short neutral ramp.** Four to eight neutral steps do all the structural work: ground, raised surface, border, faint, muted and body text.

## Building a palette in the tradition

1. Choose where on the quiet-to-loud range the product sits. Tools Tom lives in lean toward Compline.
2. Set the dark ground and its warm text first, then the light pair as paper and ink.
3. Build the neutral ramp, one role per step: `background`, `surface`, `border`, `text-faint`, `text-muted`, `text`.
4. Add accents only for meanings the product has, in one lightness band. Base16's slots give the usual set: `danger`, `warning`, `attention`, `success`, `info`, `running`, `other`.
5. Check every pair with `scripts/contrast.mjs` against the floors in `SKILL.md`. Light variants fail most often: Everforest Light as published puts body text at 5.2:1 and borders at 1.2:1, so darken text and borders before accents.
