"use strict";

// Regression test for: a pane opened near the top of a long, scrolled
// document instead of in the visible viewport, and scrolled away with the
// page instead of floating over it. Fixed via `position: fixed`.

const assert = require("assert/strict");

module.exports = async function viewportPosition(page, baseUrl) {
	await page.setViewportSize({ width: 1000, height: 700 });
	await page.goto(baseUrl, { waitUntil: "load" });
	await page.waitForSelector(".tc-story-river", { timeout: 15000 });

	await page.evaluate(() => {
		const spacer = document.createElement("div");
		spacer.style.height = "3000px";
		document.body.appendChild(spacer);
		window.scrollTo(0, 2000);
	});
	await page.waitForTimeout(100);

	const tiddlerFrame = await page.waitForSelector('[data-tiddler-title="GettingStarted"]', { timeout: 5000 });
	const openButton = await tiddlerFrame.waitForSelector('[aria-label="Pop out this tiddler"]', { timeout: 5000 });
	await openButton.click();
	await page.waitForTimeout(300);

	const paneBox = await page.evaluate(() => {
		const el = document.querySelector(".tc-tearoff-pane");
		const r = el.getBoundingClientRect();
		return { top: r.top, cssPosition: getComputedStyle(el).position };
	});
	const viewportHeight = await page.evaluate(() => window.innerHeight);

	assert.equal(paneBox.cssPosition, "fixed", "expected the pane to use position: fixed");
	assert.ok(paneBox.top >= 0 && paneBox.top < viewportHeight,
		"expected the pane to open inside the visible viewport, not off-screen above it");

	const posBefore = await page.evaluate(() => document.querySelector(".tc-tearoff-pane").getBoundingClientRect().top);
	await page.evaluate(() => window.scrollTo(0, 500));
	await page.waitForTimeout(100);
	const posAfter = await page.evaluate(() => document.querySelector(".tc-tearoff-pane").getBoundingClientRect().top);

	assert.equal(posBefore, posAfter, "expected the pane to stay fixed to the viewport while the page scrolls");
};
