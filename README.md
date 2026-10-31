# tearoff-panes

A TiddlyWiki5 plugin that lets you open any tiddler in a draggable,
resizable pane floating over the main story river, without leaving the
current browser window or document.

## What it does

- Click the "Open in pane" button in a tiddler's toolbar to pop it into its
  own floating pane. Keep working in the main window (or other panes) while
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
**[`dist/tearoff-panes.html`](dist/tearoff-panes.html)**. It's a small
(~13&nbsp;KB) file containing *only* this plugin -- no TiddlyWiki core, no
demo content -- kept up to date in this repo so there's nothing to build.

1. Download `dist/tearoff-panes.html` (e.g. via the link above, or
   `raw.githubusercontent.com/.../dist/tearoff-panes.html` once this repo
   has a home).
2. Open your existing TiddlyWiki document in a browser.
3. Open the sidebar's **Tools** tab and click **import** -- or simply drag
   the downloaded file into the browser window.
4. TiddlyWiki will list the one tiddler it found:
   `$:/plugins/aboratech/tearoff-panes`. Check it and confirm the import.
5. Save your wiki, then reload the page -- TiddlyWiki needs a reload to
   finish activating a newly imported plugin.
6. Open any tiddler and look for the new "Open in pane" button in its
   toolbar.

You only need the full repo (below) if you want to **fork or modify** the
plugin's behavior -- not to use it as-is.

## Developing / forking

`vendor/TiddlyWiki5` is a git submodule, kept purely as a local reference
and the source of the `tiddlywiki` CLI used for building/testing --
it is not vendored into the plugin itself. The plugin source lives entirely
under `plugins/aboratech/tearoff-panes/`.

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

**After changing anything under `plugins/aboratech/tearoff-panes/`**,
regenerate the distributable file and commit the result:

```sh
./scripts/build-library.sh
# -> rewrites dist/tearoff-panes.html
```
