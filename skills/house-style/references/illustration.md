# Drawn hand

Tom's software borrows hierarchy and a drawn hand from two illustrators, [izm_ni](https://x.com/izm_ni) (his favourite) and [mmqz8](https://x.com/mmqz8), with Alice's Today page as the reference build ([hub/alice-today.html](../hub/alice-today.html)). Take their hierarchy and hand, not their characters.

## What they do

- **Loud and quiet.** One subject dominates. Everything else is small: a caption, a date, a serial number.
- **Hand against machine.** Display words are drawn, like bubble letters or a scrawled title. Small print is mechanical: tracked capitals, monospace, a barcode.
- **Line before fill.** Shapes are outlined in ink on paper. Flat colour is the exception.
- **Marginalia.** Notes, arrows, speech bubbles and small marks (stars, hearts, crosses) sit around the subject, as in a sketchbook.
- **Overlap.** A figure crosses the frame or runs off the edge instead of sitting in a box.
- **The making shows.** Lines wobble, sketch marks stay in.

## Ink and pen

Every screen prints in two layers.

- **Ink** is the software: data, structure and controls, in the text colours and hairlines of the repo's palette.
- **Pen** is the app's own voice: a speech bubble, a circle around the number that matters, a star beside an item that needs you, the mark on the selected sidebar item. Pen is one hue drawn in a hand face and hand-drawn SVG strokes. Cobalt is the default: `#3049B8` on paper, `#8C9BEA` on a dark ground, both about 7:1.

Pen marks point at something true and actionable, such as the oldest card waiting for review. A pen mark that only decorates gets cut, like any other text under "Text informs".

## On screen

| Trait | Rule |
| --- | --- |
| Loud and quiet | One page title in the display face, about five times the body size (76px over 14px). Under it, small print in tracked monospace capitals: the date, the tallies. Rows and lists stay dense. |
| A figure | An app with a character (Alice) shows her as a large line drawing beside the content, cropped by the page edge. She speaks in one bubble per view, saying the single most useful thing on the page. |
| Line before fill | Inputs and buttons are outlined with a 3px radius; rows split on hairlines; the sidebar has no filled pills. |
| Controls stay controls | The primary action is solid ink, or outlined with a 2px hard offset shadow when it repeats on every row. Secondary actions are outlined. Tertiary actions are underlined text. Hover fills with ink; focus shows a ring. |
| Overlap | The figure and her bubble may cross empty space and the page edge. They never cover text or a control. |
| Dark mode | The same print inverted: light line on a near-black ground, as in mmqz8's black-ground pieces. |

## Limits

- One figure and one bubble per view, and a handful of pen marks. More turns the page into a scrapbook.
- Never set paragraphs, labels, buttons or data in the hand face.
- Small print uses the muted text colour, so it meets the 4.5:1 floor. The faint grey is for borders and marks only.
- Drawn display text carries a real text alternative.
- A figure traced automatically from a raster image is fine for a mockup. A shipped figure is drawn or inked by hand.
