# Contributing

This plugin has had one maintainer so far. Bug reports and small, focused
pull requests are welcome. For anything larger or open-ended, see "Scope"
below before investing time in a PR.

## Reporting bugs / requesting features

Use [GitHub Issues](https://github.com/mMerlin/tw5-tearoff-panes/issues).
Include your TiddlyWiki version, browser, and the plugin version (visible
in the sidebar's **Control Panel → Plugins** tab) when reporting a bug.

## Before you start

```sh
git clone --recurse-submodules https://github.com/mMerlin/tw5-tearoff-panes.git
cd tw5-tearoff-panes
```

`vendor/TiddlyWiki5` is needed to build and test. See the main
[README](README.md) for dev-server and build commands.

## Making a change

- Match the existing code style (tab indentation in `.js`/`.tid` files --
  look at a neighboring file rather than guessing).
- If you change anything under `plugins/phriendly/tearoff-panes/`, bump
  `version` in its `plugin.info` and regenerate `dist/` with
  `scripts/build-library.sh` (see README).
- Add or update a spec under `test/specs/` for any behavior change -- see
  `test/README.md`. Run `cd test && npm test` before opening a PR.
- Add an entry to `CHANGELOG.md` under "Unreleased".

## Scope

This plugin deliberately targets MDI-style panes inside one browser
window. Real separate-OS-window support is a known, intentionally
deferred direction -- open an issue to discuss an approach before sending
a PR for it.

## License

By contributing, you agree your contribution is made under this project's
[MIT license](LICENSE).
