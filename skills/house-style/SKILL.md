---
name: house-style
description: Tom's house style for every UI. Use when building, restyling, reviewing or polishing an interface, choosing fonts or colours, or writing a repo's DESIGN.md. Load it before any other design skill; it wins where they disagree.
---

# House style

Quiet, dense, legible software in the tradition of Linear, native macOS apps (Mail, Finder, Notes) and GitHub's code views. Every element earns its place: colour carries meaning, motion smooths, text informs.

## Order of authority

1. The repo's `DESIGN.md` holds the concrete tokens: fonts, palette, radius, spacing. It wins on values.
2. This skill holds the taste. It wins on judgement, including over the skills below.
3. A repo with UI and no `DESIGN.md` gets one before the first styling change. See [DESIGN.md](#designmd).

Hand off to these skills for depth, keeping this skill's rules on top:

| Work | Skill |
| --- | --- |
| Building or reshaping a tool screen | `interface-design` |
| Dense lists, tables, status views | `operational-expert-tool-ui` |
| How a component feels, motion, interaction polish | `emil-design-eng` |
| Auditing finished UI | `web-design-guidelines` |
| Iterating on a live preview | `nitpick` |

## Principles for every surface

- **Colour is meaning.** Status, diffs, repo identity, links, danger. Structure comes from neutrals: background, a raised surface, a border, two text greys. The primary colour is a neutral. Saturated colour lives in syntax highlighting and diffs.
- **Both modes, always.** Every surface ships dark and light and follows the system setting. Design dark first, then check light.
- **Contrast floors.** Body text 7:1, secondary text 4.5:1, status marks 3:1, borders 1.5:1, each against the background it sits on. Check new pairs with `node <skill-dir>/scripts/contrast.mjs <fg> <bg>`.
- **Text informs.** Every word on screen tells the user something they need. UI copy follows `clear-voice`: short whole sentences, sentence case, plain verbs on buttons. Cut, on sight:
  - helper text that repeats the field label
  - a subtitle that restates its heading
  - empty-state paragraphs (one line and one action instead)
  - toasts confirming a change already visible
  - tooltips that repeat a visible label
  - section labels like "Overview" or "Details" above self-evident content
- **Flat structure.** One level of container. Group with spacing, a rule or a heading; a card holds content, never other cards.
- **Labels in sentence case** at every size. Emphasis comes from weight or colour.
- **Motion smooths.** It exists where a flicker or a pop would otherwise happen: something appearing, leaving, resizing, reordering, changing state. It answers the user's input, runs 120 to 200 ms, uses a spring or ease-out curve, and turns off under `prefers-reduced-motion`. Page navigation is instant. A status change made by the system gets a background tint that fades over about 600 ms. Live progress (work running, waiting on someone) may loop, like a spinner, slowly and quietly; under reduced motion it becomes a static mark.
- **Icons with words.** Lucide icons, each beside a text label. An icon stands alone only in a toolbar where it has a tooltip and a keyboard shortcut.

## Surfaces

### Tools

Apps used to get work done: Bakery, dashboards, admin screens, desktop apps.

- Compact by default on a 4px grid. Rows 28 to 36px. Padding sized for a desktop screen.
- Sidebar type is fixed at 13px with 11px metadata, like Linear and macOS sidebars.
- Body 13 to 14px. Hierarchy comes from weight (400, 500, 600) and the two text greys; keep sizes to small steps, three or four per view.
- `tabular-nums` on numeric columns; monospace for IDs, hashes, paths and timestamps.
- Every primary action has a keyboard shortcut, shown in its tooltip or menu item.
- A Cmd+K command palette belongs in tools Tom fully owns once there are enough commands or objects that menus slow him down. Shared or team repos (silk-remix, for example) follow their own conventions.
- A density setting (compact, comfortable, cozy) and a theme picker are for tools used all day. Treat the theme picker as a stretch goal.

### Reading sites

Personal pages, notes, catalogues: bookspell is the reference.

- A narrow column under 75 characters, visible underlined links, plain rules.
- Type on the Perfect Fourth scale (1.333) from a 16px body. Serif body text gets slightly more line height.

### Landing pages

- The same restraint as everything else, plus one deliberate typographic idea that gives the page its character.
- Show the real product: a screenshot or a live demo in place of an illustration.

## Library

When a repo has no tokens yet:

- Fonts: pick from [references/fonts.md](references/fonts.md). Go outside it only when Tom asks.
- Colour: design the repo's own palette in the tradition described in [references/colour.md](references/colour.md). Its reference themes show the feel; they are not palettes to copy.

## DESIGN.md

Each repo with UI keeps a `DESIGN.md` in the [Google DESIGN.md format](https://github.com/google-labs-code/design.md): YAML tokens on top, prose on why below.

1. Write the tokens the code actually uses: colours for both modes, fonts, type scale, radius, spacing. Take values from the repo's CSS, or for a new repo from the fonts library and a palette built in the colour tradition.
2. Below the tokens, record the decisions this repo makes beyond this skill, and its exceptions to it.
3. Lint it: `npx -y -p @google/design.md designmd lint DESIGN.md`. Add that command to the repo's local check script. Leave CI out of it while the format is alpha.
4. Point to it from the repo's `AGENTS.md`: "Treat `DESIGN.md` as the source of truth for visual decisions, and load the `house-style` skill for UI work."

## Before calling UI work done

Done means you have looked at it:

1. Screenshot the changed screen in dark and light at the size it ships, with `nitpick`'s preview or a headless browser.
2. Walk the principles and the surface section above against the screenshots, and fix what they show.
3. Run the contrast script on any colour pair you introduced.
4. Report what you checked and attach or link the screenshots.
