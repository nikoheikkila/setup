#!/usr/bin/env zx

import * as Log from "./services/log.mjs";
import * as OS from "./services/os.mjs";
import * as Homebrew from "./services/brew.mjs";
import * as Git from "./services/git.mjs";
import * as APT from "./services/apt.mjs";

Log.info(
	`
New Development Box Setup Script
By Niko Heikkilä <https://github.com/nikoheikkila>
Follow me on Mastodon: <https://mastodon.technology/@nikoheikkila>
`,
);

const os = OS.platform();

async function setupWindows() {
	Log.info("Running setup for Windows...");
}

async function setupLinux() {
	Log.info("Running setup for Linux...");

	await APT.install();

	await Git.configure();

	await OS.changeShell();
	await OS.installOhMyFish();
	await OS.configurePrompt();
}

async function setupMacOS() {
	Log.info("Running setup for macOS...");

	await Homebrew.install();
	await Homebrew.bundle();

	await Git.configure();

	await OS.changeShell();
	await OS.installOhMyFish();
	await OS.configurePrompt();
}

switch (os) {
	case "darwin":
		setupMacOS();
		break;
	case "win32":
		setupWindows();
		break;
	case "linux":
		setupLinux();
		break;
	default:
		Log.error(`Unsupported operating system: ${os}`);
}
