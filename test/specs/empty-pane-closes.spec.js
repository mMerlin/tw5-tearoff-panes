"use strict";

// Regression test for: closing the last tiddler in a pane left an empty,
// still-draggable/resizable pane frame behind instead of closing the pane.

const assert = require("assert/strict");

module.exports = async function emptyPaneCloses(page, baseUrl) {
	await page.setViewportSize({ width: 1200, height: 800 });
	await page.goto(baseUrl, { waitUntil: "load" });
	await page.waitForSelector(".tc-story-river", { timeout: 15000 });

	await page.evaluate(() => {
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "First", text: "[[Second]]" }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "Second", text: "[[Third]]" }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "Third", text: "The last one." }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({
			title: "$:/state/tearoff/First",
			list: ["First", "Second", "Third"], x: "80", y: "80", w: "480", h: "360", z: "10"
		}));
	});
	await page.waitForTimeout(300);

	const stateTitle = "$:/state/tearoff/First";
	let safety = 5;
	while ((await page.evaluate((t) => window.$tw.wiki.tiddlerExists(t), stateTitle)) && safety-- > 0) {
		const closeButton = page.locator('.tc-tearoff-pane [aria-label="close"]').first();
		if (await closeButton.count() === 0) {
			break;
		}
		await closeButton.click();
		await page.waitForTimeout(150);
	}

	assert.equal(
		await page.evaluate((t) => window.$tw.wiki.tiddlerExists(t), stateTitle),
		false,
		"expected closing the last tiddler in a pane to remove the pane's own state tiddler"
	);
	assert.equal(await page.locator(".tc-tearoff-pane").count(), 0,
		"expected no pane DOM node left behind after closing all its tiddlers");
};
