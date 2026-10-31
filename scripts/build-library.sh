#!/bin/bash
# Rebuilds dist/tearoff-panes.html -- the minimal, plugin-only file users
# import into an existing TiddlyWiki document. Run this after any change
# under plugins/aboratech/tearoff-panes/, and commit the result.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

TIDDLYWIKI_PLUGIN_PATH="$(pwd)/plugins" \
	node vendor/TiddlyWiki5/tiddlywiki.js editions/tearoff-dev --build library

mkdir -p dist
cp editions/tearoff-dev/output/tearoff-panes.html dist/tearoff-panes.html
echo "Wrote dist/tearoff-panes.html ($(wc -c < dist/tearoff-panes.html) bytes)"
