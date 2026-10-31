"use strict";

// Regression test for: clicking a link inside a pane didn't scroll that
// pane's own body to reveal the newly opened tiddler (the core's page-level
// scroller only ever scrolls the browser window). Fixed by having the pane
// intercept `tm-scroll` and scroll its own body.

const assert = require("assert/strict");

module.exports = async function scrollIntoView(page, baseUrl) {
	await page.setViewportSize({ width: 1200, height: 800 });
	await page.goto(baseUrl, { waitUntil: "load" });
	await page.waitForSelector(".tc-story-river", { timeout: 15000 });

	await page.evaluate(() => {
		const longText = "Padding line.\n".repeat(80);
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "TallSource", text: longText + "\n[[TallTarget]]" }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({ title: "TallTarget", text: "I am the scroll target.\n" + longText }));
		window.$tw.wiki.addTiddler(new window.$tw.Tiddler({
			title: "$:/state/tearoff/TallSource",
			list: ["TallSource"], x: "80", y: "80", w: "480", h: "360", z: "10"
		}));
	});
	await page.waitForTimeout(300);

	const mainWindowScrollBefore = await page.evaluate(() => window.scrollY);
	const paneBody = page.locator(".tc-tearoff-pane-body").first();
	const bodyScrollBefore = await paneBody.evaluate((el) => el.scrollTop);

	await paneBody.locator('a:has-text("TallTarget")').first().click();
	await page.waitForTimeout(600); // smooth scroll animation

	const bodyScrollAfter = await paneBody.evaluate((el) => el.scrollTop);
	const mainWindowScrollAfter = await page.evaluate(() => window.scrollY);

	assert.equal(mainWindowScrollAfter, mainWindowScrollBefore, "expected the main window not to scroll");
	assert.ok(bodyScrollAfter > bodyScrollBefore,
		"expected the pane's own body to scroll to reveal the newly opened tiddler");
};
