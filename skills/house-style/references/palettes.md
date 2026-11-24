# Palettes

Every palette is stored as [Base16](https://github.com/tinted-theming/home) slots, so any Base16 scheme drops in. A fixed mapping turns slots into roles. A palette lists `overrides` only where the mapping misses the contrast floors in `SKILL.md` or the result looks wrong.

To add a palette: copy its Base16 YAML from [tinted-theming/schemes](https://github.com/tinted-theming/schemes/tree/spec-0.11/base16), run the contrast script on the roles below, and add overrides for the pairs that fail.

## Role mapping

| Role | Slot | Use |
| --- | --- | --- |
| `background` | base00 | Page and main pane |
| `surface` | base01 | Sidebar, cards, popovers, code blocks |
| `border` | base02 | Rules, outlines, selection, hover |
| `text-faint` | base03 | Disabled text, placeholders, comments (not for reading) |
| `text-muted` | base04 | Secondary text, metadata |
| `text` | base05 | Body text |
| `text-strong` | base06 | Headings and emphasis where the body text is not already the strongest |
| `danger` | base08 | Failed, destructive, removed |
| `warning` | base09 | Interrupted, needs attention soon |
| `attention` | base0A | Ready, waiting on the user |
| `success` | base0B | Done, approved, added |
| `info` | base0C | Neutral notices |
| `running` | base0D | In progress, links |
| `other` | base0E | A seventh category such as archived |

Status colours are marks: a dot, a bar, a background tint, a badge outline. The label beside them stays in `text` or `text-muted`.

## Compline and Lauds (default)

Compline (dark) and Lauds (light) by Joshua Blais, <https://github.com/joshuablais/compline>, GPL-3.0. Low-saturation hues "as whispers of the same tone". Neither has a purple, so `other` uses teal and base0F uses dark cyan. Bakery's Default theme is built from Compline.

```yaml
compline:
  base00: "#1a1d21"
  base01: "#22262b"
  base02: "#3d424a"
  base03: "#676d77"
  base04: "#8b919a"
  base05: "#f0efeb"
  base06: "#f0efeb"
  base07: "#f5f4f2"
  base08: "#cdacac"
  base09: "#ccc4b4"
  base0A: "#d4ccb4"
  base0B: "#b8c4b8"
  base0C: "#b4c0c8"
  base0D: "#b4bcc4"
  base0E: "#b4c4bc"
  base0F: "#98a4ac"
  overrides:
    sidebar: "#171a1e"   # base1, a step below background
lauds:
  base00: "#f0efeb"
  base01: "#e0dcd4"
  base02: "#b8b5b0"
  base03: "#7d7a75"
  base04: "#5f5c58"
  base05: "#1a1d21"
  base06: "#2d2a27"
  base07: "#0f1114"
  base08: "#8b6666"
  base09: "#7a6d5a"
  base0A: "#8b7e52"
  base0B: "#5a6b5a"
  base0C: "#64757d"
  base0D: "#5a6b7a"
  base0E: "#4d6b6b"
  base0F: "#546470"
```

Measured against `background`: Compline text 14.7, muted 5.3, border 1.67. Lauds text 14.7, muted 5.8, border 1.78, status marks 3.5 to 5.0.

## Everforest

By sainnhe, <https://github.com/sainnhe/everforest>. Base16 ports from tinted-theming (`everforest`, `everforest-light-medium`). Warm green-grey, soft on the eyes.

```yaml
everforest-dark:
  base00: "#2d353b"
  base01: "#343f44"
  base02: "#475258"
  base03: "#859289"
  base04: "#9da9a0"
  base05: "#d3c6aa"
  base06: "#e6e2cc"
  base07: "#fdf6e3"
  base08: "#e67e80"
  base09: "#e69875"
  base0A: "#dbbc7f"
  base0B: "#a7c080"
  base0C: "#83c092"
  base0D: "#7fbbb3"
  base0E: "#d699b6"
  base0F: "#9da9a0"
everforest-light:
  base00: "#fdf6e3"
  base01: "#f4f0d9"
  base02: "#e6e2cc"
  base03: "#939f91"
  base04: "#829181"
  base05: "#5c6a72"
  base06: "#475258"
  base07: "#2d353b"
  base08: "#f85552"
  base09: "#f57d26"
  base0A: "#dfa000"
  base0B: "#8da101"
  base0C: "#35a77c"
  base0D: "#3a94c5"
  base0E: "#df69ba"
  base0F: "#829181"
  overrides:
    # As published, light text is 5.2:1, muted 3.1:1, border 1.2:1 and accents 2.1 to 3.1:1.
    text: "#475258"        # 7.4
    text-muted: "#5c6a72"  # 5.2
    border: "#c3c6b2"      # 1.6
    # Accents mixed toward base07 just far enough for 3.2:1 as marks.
    danger: "#ee5351"
    warning: "#cd6f2a"
    attention: "#aa8012"
    success: "#7f910a"
    info: "#349672"
    running: "#398fbe"
    other: "#cd64ad"
```

Everforest dark measures text 7.4, muted 5.1, border 1.55.

## Gruvbox

By morhetz, <https://github.com/morhetz/gruvbox>. Base16 ports by Dawid Kurek (`gruvbox-dark-medium`, `gruvbox-light-medium`). Warm, retro, higher saturation than the others; best where colour already carries a lot of meaning.

```yaml
gruvbox-dark:
  base00: "#282828"
  base01: "#3c3836"
  base02: "#504945"
  base03: "#665c54"
  base04: "#bdae93"
  base05: "#d5c4a1"
  base06: "#ebdbb2"
  base07: "#fbf1c7"
  base08: "#fb4934"
  base09: "#fe8019"
  base0A: "#fabd2f"
  base0B: "#b8bb26"
  base0C: "#8ec07c"
  base0D: "#83a598"
  base0E: "#d3869b"
  base0F: "#d65d0e"
gruvbox-light:
  base00: "#fbf1c7"
  base01: "#ebdbb2"
  base02: "#d5c4a1"
  base03: "#bdae93"
  base04: "#665c54"
  base05: "#504945"
  base06: "#3c3836"
  base07: "#282828"
  base08: "#9d0006"
  base09: "#af3a03"
  base0A: "#b57614"
  base0B: "#79740e"
  base0C: "#427b58"
  base0D: "#076678"
  base0E: "#8f3f71"
  base0F: "#d65d0e"
```

Measured: dark text 8.6, muted 6.8, border 1.67; light text 7.8, muted 5.7, border 1.51.
