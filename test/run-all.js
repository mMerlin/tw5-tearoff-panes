#!/usr/bin/env node
"use strict";

const { chromium } = require("playwright-chromium");
const { startDevServer, stopDevServer } = require("./helpers/dev-server");

// Specs that run against the live dev server, sharing one server + browser.
const SERVER_SPECS = [
	"basic-pane",
	"viewport-position",
	"scroll-into-view",
	"link-order-and-zorder",
	"empty-pane-closes",
	"ghost-pane-after-drag"
];

// Specs that manage their own lifecycle (e.g. file:// loads, no dev server).
const STANDALONE_SPECS = [
	"import-roundtrip"
];

async function main() {
	let failures = 0;

	const server = await startDevServer();
	const browser = await chromium.launch();
	try {
		for (const name of SERVER_SPECS) {
			const spec = require("./specs/" + name + ".spec.js");
			const page = await browser.newPage();
			try {
				await spec(page, server.baseUrl);
				console.log("PASS  " + name);
			} catch (err) {
				failures++;
				console.error("FAIL  " + name);
				console.error(err && err.stack ? err.stack : err);
			} finally {
				await page.close();
			}
		}
	} finally {
		await browser.close();
		await stopDevServer(server);
	}

	for (const name of STANDALONE_SPECS) {
		const spec = require("./specs/" + name + ".spec.js");
		try {
			await spec();
			console.log("PASS  " + name);
		} catch (err) {
			failures++;
			console.error("FAIL  " + name);
			console.error(err && err.stack ? err.stack : err);
		}
	}

	if (failures > 0) {
		console.error("\n" + failures + " test(s) failed.");
		process.exitCode = 1;
	} else {
		console.log("\nAll tests passed.");
	}
}

main().catch((err) => {
	console.error("FATAL", err);
	process.exit(1);
});
