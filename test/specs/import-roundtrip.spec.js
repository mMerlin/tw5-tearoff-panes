"use strict";

// End-to-end check of the actual distribution path: import the current
// dist/tearoff-panes-<version>.html into a plugin-free wiki, save, cold-reload,
// and confirm the feature still works. Builds its own throwaway "plugin-free
// wiki" fixture straight from the TiddlyWiki5 submodule's empty edition, so
// this doesn't depend on anything outside this repo and vendor/TiddlyWiki5.
//
// Manages its own browser/page lifecycle (unlike the other specs) since it
// doesn't need the live dev server -- it loads plain files over file://.

const assert = require("assert/strict");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright-chromium");

const ROOT = path.join(__dirname, "..", "..");

module.exports = async function importRoundtrip() {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tearoff-panes-import-test-"));

	try {
		execFileSync(process.execPath, [
			path.join(ROOT, "vendor", "TiddlyWiki5", "tiddlywiki.js"),
			path.join(ROOT, "vendor", "TiddlyWiki5", "editions", "empty"),
			"--output", tmpDir,
			"--render", "$:/core/save/all", "empty.html", "text/plain"
		], { cwd: ROOT, stdio: "ignore" });

		const emptyWikiPath = path.join(tmpDir, "empty.html");
		const version = JSON.parse(
			fs.readFileSync(path.join(ROOT, "plugins", "phriendly", "tearoff-panes", "plugin.info"), "utf8")
		).version;
		const libraryPath = path.join(ROOT, "dist", "tearoff-panes-" + version + ".html");
		assert.ok(fs.existsSync(libraryPath),
			"expected dist/tearoff-panes-" + version + ".html to exist -- run scripts/build-library.sh first");
		const libraryFileText = fs.readFileSync(libraryPath, "utf8");

		const browser = await chromium.launch();
		try {
			const page = await browser.newPage();
			await page.goto("file://" + emptyWikiPath, { waitUntil: "load" });
			await page.waitForSelector(".tc-story-river", { timeout: 15000 });

			assert.equal(
				await page.evaluate(() => window.$tw.wiki.tiddlerExists("$:/plugins/phriendly/tearoff-panes")),
				false,
				"expected the plugin-free fixture wiki not to already have the plugin"
			);

			// Mirrors the DATA RESULT of Tools -> import -> confirm: TW5's own
			// import UI is core functionality, not something this test re-verifies.
			// What matters here is whether our distributable file parses correctly
			// and produces a working, saveable, reloadable plugin.
			await page.evaluate((fileText) => {
				const incomingTiddlers = window.$tw.wiki.deserializeTiddlers("text/html", fileText, {});
				incomingTiddlers.forEach((fields) => window.$tw.wiki.addTiddler(new window.$tw.Tiddler(fields)));
			}, libraryFileText);
			await page.waitForTimeout(300);

			assert.equal(
				await page.evaluate(() => window.$tw.wiki.tiddlerExists("$:/plugins/phriendly/tearoff-panes")),
				true,
				"expected the plugin tiddler to exist immediately after import"
			);

			const savedHtml = await page.evaluate(() => window.$tw.wiki.renderTiddler("text/plain", "$:/core/save/all"));
			const savedPath = path.join(tmpDir, "saved.html");
			fs.writeFileSync(savedPath, savedHtml, "utf8");
			await page.close();

			const page2 = await browser.newPage();
			await page2.goto("file://" + savedPath, { waitUntil: "load" });
			await page2.waitForSelector(".tc-story-river", { timeout: 15000 });

			assert.equal(
				await page2.evaluate(() => window.$tw.wiki.tiddlerExists("$:/plugins/phriendly/tearoff-panes")),
				true,
				"expected the plugin to survive a save + cold reload cycle"
			);

			const tiddlerFrame = await page2.waitForSelector('[data-tiddler-title="GettingStarted"]', { timeout: 5000 });
			const openButton = await tiddlerFrame.waitForSelector('[aria-label="Pop out this tiddler"]', { timeout: 5000 });
			await openButton.click();
			await page2.waitForTimeout(300);

			assert.equal(await page2.locator(".tc-tearoff-pane").count(), 1,
				"expected the popout feature to actually work after import + save + reload");
		} finally {
			await browser.close();
		}
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
};
