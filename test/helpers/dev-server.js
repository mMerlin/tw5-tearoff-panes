"use strict";

// Boots the editions/tearoff-dev TiddlyWiki server (the same one used for
// manual testing) as a child process, for the specs that exercise live
// in-page behaviour over HTTP. Specs that only need a static file (e.g. the
// import-roundtrip test) don't use this.

const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const PORT = 8098;
const BASE_URL = `http://127.0.0.1:${PORT}/`;

function waitForServer(url, timeoutMs) {
	const start = Date.now();
	return new Promise((resolve, reject) => {
		(function poll() {
			const req = http.get(url, (res) => {
				res.resume();
				resolve();
			});
			req.on("error", () => {
				if (Date.now() - start > timeoutMs) {
					reject(new Error("dev server did not start within " + timeoutMs + "ms"));
				} else {
					setTimeout(poll, 200);
				}
			});
		})();
	});
}

async function startDevServer() {
	const child = spawn(
		process.execPath,
		[
			path.join(ROOT, "vendor", "TiddlyWiki5", "tiddlywiki.js"),
			path.join(ROOT, "editions", "tearoff-dev"),
			"--listen", "port=" + PORT
		],
		{
			cwd: ROOT,
			env: Object.assign({}, process.env, { TIDDLYWIKI_PLUGIN_PATH: path.join(ROOT, "plugins") }),
			stdio: "ignore"
		}
	);
	await waitForServer(BASE_URL, 20000);
	return { child: child, baseUrl: BASE_URL };
}

function stopDevServer(server) {
	return new Promise((resolve) => {
		server.child.once("exit", resolve);
		server.child.kill();
	});
}

module.exports = { startDevServer: startDevServer, stopDevServer: stopDevServer };
