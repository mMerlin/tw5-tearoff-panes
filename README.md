# tearoff-panes

A TiddlyWiki5 plugin that lets you open any tiddler in a draggable,
resizable pane floating over the main story river, without leaving the
current browser window or document.

## What it does

- Click the "popout" button in a tiddler's toolbar to pop it into its own
  floating pane. Keep working in the main window (or other panes) while
  that pane stays open for reference.
- Panes are fully independent: drag them anywhere, resize them, overlap
  them, and arrange as many as you need to match your current task.
- Panes support editing, not just viewing. Each pane has its own navigation
  state, so clicking a not-yet-created tiddler reference inside a pane
  creates and opens that new tiddler in the *same* pane, rather than the
  main window.
- Panes render tiddlers through TiddlyWiki's normal view/edit template
  cascade, so any content-type plugin you have installed (Markdown,
  CodeMirror, image viewers, custom editors, etc.) works inside a pane
  exactly as it does in the main window -- this plugin never has to know
  about content types itself.
- Panes are deliberately ephemeral UI state, not part of your saved
  document: closing and reopening the wiki, or clicking "Home", clears
  open panes the same way it clears any tiddler not listed in
  `$:/DefaultTiddlers`. The sidebar only ever exists in the main window.

## Status

Early scaffold. The open/drag/resize/close flow, and the full
import-into-an-existing-wiki path below, have both been verified end to end
against a real build. Broader testing (multiple simultaneous panes, the
create-new-tiddler-inside-a-pane flow) is still outstanding. There is no
tagged release yet.

## Adding this to an existing TiddlyWiki document

You don't need this repo, Node.js, or git for this -- just one file:
**[`dist/tearoff-panes-0.0.4.html`](dist/tearoff-panes-0.0.4.html)**. It's a
small (~14&nbsp;KB) file containing *only* this plugin -- no TiddlyWiki
core, no demo content -- kept up to date in this repo so there's nothing to
build.

The version number is in the filename because TiddlyWiki's import silently
overwrites a same-titled tiddler, with no confirmation prompt -- so there's
no "are you sure, here's what you're replacing" moment during the import
itself. Checking the filename *before* you import, and checking the
installed version afterward in the sidebar's **Control Panel → Plugins**
tab (TiddlyWiki does show it there), are the two points where you can
actually confirm which code ended up in your wiki. `dist/` may eventually
hold more than one file -- e.g. an MDI variant alongside a
separate-OS-windows variant -- so always grab the filename the current
README section names, not an assumed "latest".

1. Download `dist/tearoff-panes-0.0.4.html` (e.g. via the link above, or
   `raw.githubusercontent.com/.../dist/tearoff-panes-0.0.4.html` once this
   repo has a home).
2. Open your existing TiddlyWiki document in a browser.
3. Drag the downloaded file into the browser window. (The sidebar's
   **Tools → import** button reaches the same place, but makes you browse
   to and select the file first -- dragging gets you there in one step.)
4. TiddlyWiki shows the one tiddler it found, `$:/plugins/phriendly/tearoff-panes`,
   already selected -- there's nothing else in this file to deselect. Confirm
   the import. If a copy is already installed, this overwrites it
   immediately and silently, so double-check the filename *before* this
   step, not after.
5. Save your wiki, then reload the page -- TiddlyWiki needs a reload to
   finish activating a newly imported (or upgraded) plugin.
6. Open any tiddler and look for the new "popout" button in its toolbar.
   You can confirm which version actually loaded afterward via the
   sidebar's **Control Panel → Plugins** tab.

You only need the full repo (below) if you want to **fork or modify** the
plugin's behavior -- not to use it as-is.

## Developing / forking

`vendor/TiddlyWiki5` is a git submodule, kept purely as a local reference
and the source of the `tiddlywiki` CLI used for building/testing --
it is not vendored into the plugin itself. The plugin source lives entirely
under `plugins/phriendly/tearoff-panes/`.

```sh
git clone --recurse-submodules <this-repo-url>
cd tiddlywiki-enhancements-C_045
# or, if already cloned without --recurse-submodules:
git submodule update --init
```

To boot a live dev server with the plugin loaded:

```sh
TIDDLYWIKI_PLUGIN_PATH="$(pwd)/plugins" \
  node vendor/TiddlyWiki5/tiddlywiki.js editions/tearoff-dev --listen port=8080
```

Then open `http://127.0.0.1:8080/` in a browser.

To build a full demo wiki (plugin + TiddlyWiki's own starter content) for
poking around in, rather than the minimal distributable file:

```sh
TIDDLYWIKI_PLUGIN_PATH="$(pwd)/plugins" \
  node vendor/TiddlyWiki5/tiddlywiki.js editions/tearoff-dev --build index
# -> editions/tearoff-dev/output/index.html
```

**After changing anything under `plugins/phriendly/tearoff-panes/`**, bump
`version` in `plugins/phriendly/tearoff-panes/plugin.info`, regenerate the
distributable file, and commit both:

```sh
./scripts/build-library.sh
# -> writes dist/tearoff-panes-<version>.html, read from plugin.info
```

## Tests

Regression tests live in [`test/`](test/) -- one Playwright spec per bug
that's been found and fixed, plus the core open/drag/close flow and the
actual import-into-an-existing-wiki path. Quick start:

```sh
cd test
npm install
npm test
```

See [`test/README.md`](test/README.md) for what each spec covers, what's
required to run them, and how to add a new one.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for what's changed in each version.

## License

MIT -- see [`LICENSE`](LICENSE).
