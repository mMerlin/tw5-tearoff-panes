# Changelog

All notable changes to the `tearoff-panes` plugin are documented here.
Versions refer to `plugins/phriendly/tearoff-panes/plugin.info` and the
matching `dist/tearoff-panes-<version>.html` distributable.

## [Unreleased]

Nothing yet.

## [0.0.4] - 2026-11-01

First tagged release.

### Fixed

- A link clicked inside a pane didn't scroll that pane's own body to reveal
  the newly opened tiddler (the core's page-level scroller only ever scrolls
  the browser window). Panes now intercept `tm-scroll` and scroll their own
  body instead.
- Dragging a pane and then clicking a link inside it could leave a ghost
  "empty pane" outline at the pane's original, pre-drag location. Caused by
  a pane's own per-tiddler history state tiddler sharing the `$:/state/tearoff/`
  prefix used to detect open panes, so it was briefly rendered as a second,
  empty pane. Fixed by tightening the pane-detection filter.

## [0.0.3]

### Fixed

- A newly opened pane could render behind an already-open pane and be
  unclickable until reopened a second time. New panes now compute their
  z-index as one above the current maximum instead of a hardcoded value.
- Clicking a tiddler link inside a pane inserted the referenced (or newly
  created) tiddler in the wrong position in that pane's own story list.
  Fixed by forwarding the pane's navigation-order configuration to its
  internal navigator.
- Closing the last tiddler in a pane left an empty, still-draggable/resizable
  pane frame behind instead of closing the pane itself.

## [0.0.2]

### Fixed

- A pane opened near the top of the document and scrolled with the page
  instead of floating over it. Panes now use `position: fixed` instead of
  `position: absolute`.

### Changed

- Shortened the toolbar button's tooltip from "Open this tiddler in a
  draggable, resizable pane" to "Pop out this tiddler", matching the rest of
  the toolbar's short-hint convention.
- `dist/` distributable filenames now include the plugin's version number
  (e.g. `tearoff-panes-0.0.2.html`), so a specific build can always be
  identified and re-downloaded even once multiple variants (MDI,
  separate-windows) eventually exist side by side.

## [0.0.1]

### Added

- Initial scaffold: a generic draggable, resizable `tearoffframe` widget: and
  an `action-openinpane` action widget to open (or refocus) a tiddler's pane.
  Panes render tiddler content through TiddlyWiki's normal view/edit template
  cascade, so any installed content-type plugin works inside a pane exactly
  as it does in the main window.
- Pane state (`$:/state/tearoff/<title>` tiddlers) is pure, ephemeral UI
  state -- not part of the saved document -- cleared on reload the same way
  any tiddler outside `$:/DefaultTiddlers` would be.
