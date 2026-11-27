# Fonts

Pick one family, or two that differ clearly (a sans for UI and a serif for reading, say). Pair any of them with the system monospace stack for code and identifiers.

| Font | Use it for | Stack |
| --- | --- | --- |
| Inter | Tools and dense UI. Neutral, legible at 11 to 14px, has tabular figures. Alice and Silk use it. | `Inter, ui-sans-serif, system-ui, sans-serif` |
| Instrument Sans | Tools or sites that want a little more warmth than Inter. coda uses it. | `"Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif` |
| IBM Plex Sans | Technical tools with a mechanical, engineered tone. Pairs with IBM Plex Mono. impression uses it. | `"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif` |
| Georgia | Reading sites and display headings. Already on every system, no font loading. bookspell uses it. | `Georgia, "Times New Roman", serif` |
| System monospace | Code, IDs, hashes, paths, timestamps, keyboard keys. | `ui-monospace, SFMono-Regular, Menlo, monospace` |

Self-host web fonts (`@fontsource` packages or files in the repo) so the app works offline and in a Tauri webview.
