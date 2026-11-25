# Command-line tools

The help and output of Tom's CLIs: `bakery-cli`, `unconscious` and `impression` share one layout, so they look like a set. Copy [cli-help.ts](cli-help.ts) into the repo (it has no dependencies) and keep the tool's own commands in a registry next to it. Each tool keeps its copy; there is no shared package.

## Help

```
<banner, on a terminal only>

Usage  tool <command> [options]

Cards
  add TITLE...        quick capture: a new Triage card
  show CARD_ID        a card with its dependencies, attempts and review

Options
  -v, --version       print the version

Environment
  TOOL_URL            the server

  tool help <command> for its options and examples.
```

- **A registry is the source of truth.** One `COMMANDS` array (name, group, args, summary, details, options, examples) drives the overview, each command's page, usage lines and typo suggestions. A test checks that the commands the CLI routes and the ones listed are the same set. Commands only agents or hooks call (`impression hook`) are routed but left out of the list.
- **Grouped by job**, 3 to 6 groups with short headings ("Cards", "Set up", "Tidy up"), in the order a person meets them. Commands sit in the order they're used within a group.
- **Arguments show in the overview**, in caps (`CARD_ID`, `TEXT...`, `[PATH]`), so the list alone says how to call each command. Full flags go on the command's own page.
- **Summaries are lowercase, no full stop**, and say what the command does or shows: "a card's attempts, tokens and cost", "move a card to Ready". They follow `clear-voice`.
- **Every way to ask for help works**: no command, `help`, `-h`, `--help`, `help <command>` and `<command> --help`. Help goes to stdout and exits 0.
- **A command's page** has a header line (`tool cmd  summary`), Usage with every flag, details as short paragraphs, Options, then Examples as `$ command   # what it does`.

## Colour

The terminal's 16 ANSI colours, never fixed RGB, so the person's theme picks shades that read on light and dark:

| Role | Code |
| --- | --- |
| Headings | bold magenta `1;35` |
| Command names | magenta `35` |
| Arguments, flags, env names | yellow `33` |
| Comments, versions, `$` | dim `2` |
| ok / warn / bad / info | green / yellow / red / cyan |

Layout and colour only on a terminal: piped output stays plain, so agents and scripts read it cleanly. `NO_COLOR` drops colour and keeps the layout; `FORCE_COLOR` wins over both (`FORCE_COLOR=0` turns everything off).

## Banner

The overview opens with a small piece of art on a terminal: 4 to 10 rows, drawn from the tool's identity (Bakery's braille cake, Unconscious Development's tarot cards, Impression's braille cloud), shaded top to bottom in a few related colours. Beside it: the name letter-spaced in bold (`b a k e r y`), a one-sentence tagline, the version dimmed. Braille line art reads finer than block characters; draw it from a shape in code rather than by hand. Pipes and `--help` captured by an agent get no banner.

## Errors

- Unknown command: `tool: Unknown command: crete. Did you mean create? Run tool help to see them all.` on stderr, exit 2.
- Wrong arguments: the message, then the command's usage line (`Usage: tool edit ID TEXT...`), exit 1 or 2.
- No stack traces for a person's mistake.

## Output

Lists print one item per line, tab-separated when piped. On a terminal the same lines are laid out in aligned columns, with status words in their colour (Bakery's `layout()` in `scripts/cli-style.mjs`). `--json` prints the full data for scripts.

## Parsing

Hand-rolled: the commands are few and the registry already knows them. A parser library would bring its own help layout, which is what this file replaces. Keep hook commands (run on every agent prompt) on a fast path that loads nothing they don't need.
