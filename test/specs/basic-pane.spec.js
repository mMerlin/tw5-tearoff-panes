"use strict";

// Core open / drag / close flow: popping a tiddler out, confirming its
// geometry persists back to its state tiddler, and confirming close removes
// that state tiddler again.

const assert = require("assert/strict");

module.exports = async function basicPane(page, baseUrl) {
	const consoleErrors = [];
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(baseUrl, { waitUntil: "load" });
	await page.waitForSelector(".tc-story-river", { timeout: 15000 });

	const tiddlerFrame = await page.waitForSelector('[data-tiddler-title="GettingStarted"]', { timeout: 5000 });
	const openButton = await tiddlerFrame.waitForSelector('[aria-label="Pop out this tiddler"]', { timeout: 5000 });
	await openButton.click();
	await page.waitForTimeout(300);

	assert.equal(await page.locator(".tc-tearoff-pane").count(), 1,
		"expected exactly one pane after clicking the popout button");
	assert.equal(
		await page.evaluate(() => window.$tw.wiki.tiddlerExists("$:/state/tearoff/GettingStarted")),
		true,
		"expected a pane state tiddler to exist"
	);

	const titlebar = page.locator(".tc-tearoff-pane-titlebar").first();
	const box = await titlebar.boundingBox();
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 80, { steps: 5 });
	await page.mouse.up();
	await page.waitForTimeout(200);

	const geometryAfterDrag = await page.evaluate(() => {
		const t = window.$tw.wiki.getTiddler("$:/state/tearoff/GettingStarted");
		return t ? { x: Number(t.fields.x), y: Number(t.fields.y) } : null;
	});
	assert.ok(geometryAfterDrag, "expected the pane state tiddler to still exist after dragging");
	assert.ok(geometryAfterDrag.x > 80 && geometryAfterDrag.y > 80,
		"expected the dragged geometry to persist back to the state tiddler");

	await page.locator(".tc-tearoff-pane-close").first().click();
	await page.waitForTimeout(200);
	assert.equal(
		await page.evaluate(() => window.$tw.wiki.tiddlerExists("$:/state/tearoff/GettingStarted")),
		false,
		"expected the pane state tiddler to be deleted after closing the pane"
	);

	assert.deepEqual(consoleErrors, [], "expected no uncaught page errors");
};
