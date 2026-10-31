# Regression tests

Playwright-driven regression tests for the `tearoff-panes` plugin. Each spec
in `specs/` reproduces one real bug that was found and fixed during
development, plus the core open/drag/close flow -- so a future change that
reintroduces one of them fails loudly instead of needing to be rediscovered
by hand.

## Prerequisites

- This repo cloned with its submodule (see the main [README](../README.md)
  for `git submodule update --init`) -- the tests boot the dev server and
  build a throwaway fixture wiki straight from `vendor/TiddlyWiki5`.
- Node.js.
- `dist/tearoff-panes-<version>.html` built and up to date with
  `plugins/phriendly/tearoff-panes/plugin.info` (run
  `../scripts/build-library.sh` if you've changed plugin code and haven't
  rebuilt it yet) -- the import-roundtrip test imports this exact file.

## Running

```sh
cd test
npm install   # once, downloads playwright-chromium and its bundled browser
npm test
```

This boots `editions/tearoff-dev` on `127.0.0.1:8098`, runs each spec against
it in a fresh browser page, then shuts the server down. Output is one
`PASS`/`FAIL` line per spec; a failure prints the assertion and a stack
trace. Exit code is non-zero if anything failed.

You can also run it from the repo root without `cd`-ing in:

```sh
node test/run-all.js
```

## What's covered

| Spec | What it guards against |
| --- | --- |
| `basic-pane` | The core open / drag / close flow, and that dragging persists geometry back to the pane's state tiddler. |
| `viewport-position` | A pane opening off-screen on a scrolled page, or scrolling away with the page instead of floating over it. |
| `scroll-into-view` | A link clicked inside a pane not scrolling that pane's own body to reveal the newly opened tiddler. |
| `link-order-and-zorder` | A link inserting its target in the wrong position in a pane's story list; a newly opened pane rendering behind (and unclickable under) an existing one. |
| `empty-pane-closes` | Closing the last tiddler in a pane leaving an empty, still-interactive pane frame behind. |
| `ghost-pane-after-drag` | Dragging a pane then clicking a link inside it leaving a ghost empty-pane outline at the pre-drag location. |
| `import-roundtrip` | The actual distribution path: importing `dist/tearoff-panes-<version>.html` into a plugin-free wiki, saving, and cold-reloading still works. |

## Adding a new spec

Each file in `specs/` exports an `async function(page, baseUrl)` (or, for a
spec that doesn't need the live dev server, `async function()` -- see
`import-roundtrip.spec.js`) that throws (e.g. via Node's built-in
`assert/strict`) on failure. Add the new filename's base to the appropriate
list (`SERVER_SPECS` or `STANDALONE_SPECS`) in `run-all.js`.
