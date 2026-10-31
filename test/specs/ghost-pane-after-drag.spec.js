"use strict";

// Regression test for: dragging a pane and then clicking a link inside it
// left a ghost "empty pane" outline behind at the pane's original,
// pre-drag location. Caused by the pane's own per-tiddler history state
// tiddler sharing the `$:/state/tearoff/` prefix used to detect open panes.

const assert = require("assert/strict");

module.exports = async function ghostPaneAfterDrag(page, baseUrl) {
	await page.setViewportSize({ width: 1200, height: 800 });
	await page.goto(baseUrl, { waitUntil: "load" });
	await page.waitForSelector(".tc-story-river", { timeout: 15000 });

	await page.evaluate(() => {
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "ExistingRef", text: "I already exist." }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "SourceTiddler", text: "See also [[ExistingRef]]." }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({
			title: "$:/state/tearoff/SourceTiddler",
			list: ["SourceTiddler"], x: "80", y: "80", w: "480", h: "360", z: "10"
		}));
	});
	await page.waitForTimeout(300);

	const titlebar = page.locator(".tc-tearoff-pane-titlebar").first();
	const box = await titlebar.boundingBox();
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + 300, box.y + 200, { steps: 10 });
	await page.mouse.up();
	await page.waitForTimeout(200);

	const pane = page.locator(".tc-tearoff-pane").first();
	await pane.locator('a:has-text("ExistingRef")').first().click();
	await page.waitForTimeout(300);

	assert.equal(await page.locator(".tc-tearoff-pane").count(), 1,
		"expected exactly one pane after dragging then clicking a link inside it -- no leftover ghost pane");
};
