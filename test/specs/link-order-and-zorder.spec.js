"use strict";

// Regression test for two bugs:
//  - a link clicked inside a pane (to an existing tiddler, or one that gets
//    created on the fly) landed in the wrong position in that pane's own
//    story list, instead of directly below the tiddler it was clicked from.
//  - a newly opened second pane could render behind an already-open pane
//    and be unclickable until reopened a second time.

const assert = require("assert/strict");

module.exports = async function linkOrderAndZOrder(page, baseUrl) {
	await page.setViewportSize({ width: 1200, height: 800 });
	await page.goto(baseUrl, { waitUntil: "load" });
	await page.waitForSelector(".tc-story-river", { timeout: 15000 });

	await page.evaluate(() => {
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "ExistingRef", text: "I already exist." }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({
			title: "SourceTiddler",
			text: "See also [[ExistingRef]] and [[NewRefTarget]]."
		}));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({
			title: "$:/state/tearoff/SourceTiddler",
			list: ["SourceTiddler"], x: "80", y: "80", w: "600", h: "400", z: "10"
		}));
	});
	await page.waitForTimeout(300);

	const paneForSource = page.locator('.tc-tearoff-pane:has([data-tiddler-title="SourceTiddler"])');
	await paneForSource.locator('a:has-text("ExistingRef")').first().click();
	await page.waitForTimeout(200);
	const orderAfterExistingLink = await page.evaluate(() => window.$tw.wiki.getTiddlerList("$:/state/tearoff/SourceTiddler"));
	assert.deepEqual(orderAfterExistingLink, ["SourceTiddler", "ExistingRef"],
		"expected clicking an existing-tiddler link to insert it directly below the source tiddler, in the same pane");

	await paneForSource.locator('a:has-text("NewRefTarget")').first().click();
	await page.waitForTimeout(200);
	const orderAfterNewLink = await page.evaluate(() => window.$tw.wiki.getTiddlerList("$:/state/tearoff/SourceTiddler"));
	assert.deepEqual(orderAfterNewLink, ["SourceTiddler", "NewRefTarget", "ExistingRef"],
		"expected a not-yet-existing tiddler's link to also land directly below the source tiddler, in the same pane");

	await page.evaluate(() => {
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "SecondPaneTarget", text: "Second pane content." }));
		const storyTiddler = window.$tw.wiki.getTiddler("$:/StoryList"),
			list = window.$tw.wiki.getTiddlerList("$:/StoryList");
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler(storyTiddler, { title: "$:/StoryList", list: list.concat(["SecondPaneTarget"]) }));
	});
	await page.waitForTimeout(200);
	const mainWindowFrame = page.locator('.tc-story-river [data-tiddler-title="SecondPaneTarget"]');
	await mainWindowFrame.waitFor({ timeout: 5000 });
	await mainWindowFrame.locator('[aria-label="Pop out this tiddler"]').click();
	await page.waitForTimeout(300);

	const zValues = await page.evaluate(() => ({
		source: Number(window.$tw.wiki.getTiddler("$:/state/tearoff/SourceTiddler").fields.z),
		second: Number(window.$tw.wiki.getTiddler("$:/state/tearoff/SecondPaneTarget").fields.z)
	}));
	assert.ok(zValues.second > zValues.source, "expected a newly opened pane to render above an already-open pane");

	// Prove the second pane is actually interactive, not just visually on top.
	const secondPaneFrame = page.locator('.tc-tearoff-pane:has([data-tiddler-title="SecondPaneTarget"])');
	await secondPaneFrame.locator(".tc-tearoff-pane-close").click();
	await page.waitForTimeout(200);
	assert.equal(
		await page.evaluate(() => window.$tw.wiki.tiddlerExists("$:/state/tearoff/SecondPaneTarget")),
		false,
		"expected clicking the second pane's own close button to actually close it"
	);
};
