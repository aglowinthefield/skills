---
name: nitpick
description: Load a UI target (a page, component, route, or stylesheet) into a local hot-reloading preview, then spend the rest of the session making small design tweaks to it, one per message. Use when the user says "/nitpick <thing>", "nitpick X", "let's polish X", "design pass on X", or wants to iterate quickly on how something looks.
---

# Nitpick

A nitpick session has two phases. Setup gets the target live in a browser with hot reload. The loop then treats every user message as one small design tweak until the user exits.

Once the loop starts, it lasts for the rest of the session. A question that is not a tweak gets an answer, then the loop resumes.

## 1. Pin the target

Turn the request into concrete files and one URL to look at.

If the user gave no target, or only said "nitpick", do not ask them to name a page or component. Default to the **whole project**: set up the repo's dev server (step 2, option 1), open the app's home route, and start the loop. Mention in one line that they can name a narrower target at any time. When the target is the whole project, the main files are the app's global styles, tokens, and layout, and each tweak may touch whatever file the user is pointing at on screen.

1. Find the files that render the target: component, styles, tokens, and the route that mounts it. Use `rg` on visible text, class names, or component names.
2. If the target maps to two or more places, pick the likeliest and say so. Ask only when a wrong pick would waste real setup time.
3. Note the data the target needs to render: auth, API data, feature flags. This decides the surface in step 2.

**Done when:** you can name the target's main file and the URL or route where it shows.

## 2. Pick the live surface

Take the first option that works, and tell the user which one you picked and why in one line.

1. **The repo's dev server with hot reload.** Read `package.json` scripts, `AGENTS.md`, and the README for the dev command. Vite, Next, Remix, SvelteKit, Astro, and Rails with a bundler all qualify. If the target needs a backend, start that too, or point the dev server at one already running.
2. **An existing story.** If Storybook, Ladle, or Histoire already has a story for the target, run it. This skips auth and data.
3. **A scratch route.** If the real page is hard to reach (behind login, deep in a flow, needs live data), add a throwaway route or page that renders only the target with fixture data. Name it `nitpick-<slug>` so it is easy to find and delete.
4. **A static file under a reload server.** For plain HTML and CSS, or an exported snippet, serve the folder with `npx browser-sync start --server --files "**/*"` or `npx live-server`.
5. **Edit and screenshot.** If nothing reloads (native app, email template, a build that takes minutes), rebuild on each tweak and take a screenshot. Say plainly that this loop is slow.

## 3. Set up

1. Work in a separate worktree so the main checkout stays clean: create `.worktrees/nitpick-<slug>` on branch `nitpick/<slug>`. If you are already in a linked worktree, or the repo's instructions say otherwise, follow those instead.
2. Install dependencies in the worktree if `node_modules` or the equivalent is missing.
3. Find a free port. Do not take ports the user's main dev server or other sessions use. `lsof -iTCP -sTCP:LISTEN -nP` lists them.
4. Start the server in the background with output logged to `/tmp/nitpick-<slug>.log`. Wait for it with a bounded poll on the URL, not a fixed sleep.
5. Open the URL with `open <url>` on macOS.
6. Write the session state to `/tmp/nitpick-<slug>.md`: worktree path, branch, server command, PID, URL, main files, and the base commit. If the context is compacted, this file holds what you need to continue.
7. Tell the user the URL, the surface, and the main files in three lines or fewer. Then say the loop is on.

**Done when:** the page loads at the URL and an edit to the main file shows up without a manual restart. Prove this with one no-op edit, such as a whitespace change, and check the log or the page.

## 4. The loop

Each user message is one tweak, such as "more padding", "the gray is too warm", "make the title wrap less", or "match the card above".

For each tweak:

1. Make the smallest edit that does it. Change values, not structure. Use the repo's existing tokens, variables, and utility classes before raw values. Do not refactor, rename, or reformat code near the edit.
2. Commit it in the worktree with a message that quotes the tweak: `nitpick: more padding on the card header`. One commit per tweak makes undo exact.
3. Reply in one or two lines: what changed, as `file:line` and the before and after values. Example: `` `Card.tsx:42` padding `12px` to `16px` ``.
4. If hot reload may miss the change (component structure, new imports, config, or CSS-in-JS edge cases), say "hard refresh needed".

Rules for the loop:

- Do not run tests, lint, or typecheck unless the user asks or the change breaks the page. If the dev server log shows an error after an edit, fix it before replying.
- If a tweak is ambiguous ("make it pop"), make your best guess, say what you chose, and offer one alternative in a few words. Do not stop to ask.
- If a tweak would change more than about 20 lines or touch shared components used elsewhere, say so in one line and ask before doing it.
- Only screenshot when the user asks, or when you cannot tell whether a change worked. Use Playwright or the harness's browser tool if one is available.

### Loop commands

- **"undo"** or **"back N":** `git reset --hard HEAD~N` (default 1) in the worktree, and name the tweaks removed.
- **"compare"** or **"log":** show the diff or one-line commit list since the base.

## 5. Exit

The loop ends when the user says "done", "ship it", "that's it", or switches to unrelated work.

1. Stop the server by PID. Delete the scratch route from step 2 if you made one, in its own commit.
2. Squash the tweak commits into one commit with a message that lists the net changes, in the repo's commit style. If the user wants per-tweak history, skip the squash.
3. Report the branch, the net diff stat, and the next step: merge, open a PR, or keep iterating later. Follow the repo's rules for commits and PRs.
4. Delete `/tmp/nitpick-<slug>.md`.
