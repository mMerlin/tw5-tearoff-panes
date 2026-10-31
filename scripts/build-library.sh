#!/bin/bash
# Rebuilds dist/tearoff-panes-<version>.html -- the minimal, plugin-only
# file users import into an existing TiddlyWiki document. The version in
# the filename comes from plugins/phriendly/tearoff-panes/plugin.info, so
# bump that version before running this whenever the plugin changes, and
# commit the result. Older dist/tearoff-panes-*.html files are left in
# place -- this script does not delete past versions.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('plugins/phriendly/tearoff-panes/plugin.info','utf8')).version)")

TIDDLYWIKI_PLUGIN_PATH="$(pwd)/plugins" \
	node vendor/TiddlyWiki5/tiddlywiki.js editions/tearoff-dev --build library

mkdir -p dist
OUTFILE="dist/tearoff-panes-${VERSION}.html"
cp editions/tearoff-dev/output/tearoff-panes.html "$OUTFILE"
echo "Wrote $OUTFILE ($(wc -c < "$OUTFILE") bytes)"
