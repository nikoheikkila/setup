#!/usr/bin/env zx

import { $ } from "zx";
import * as APT from "./services/apt.mjs";
import * as Homebrew from "./services/brew.mjs";
import * as Git from "./services/git.mjs";
import * as Log from "./services/log.mjs";
import * as OS from "./services/os.mjs";
import * as Prompt from "./services/prompt.mjs";
import * as Scoop from "./services/scoop.mjs";

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

	$.shell = OS.getPath("powershell");
	$.prefix = "";
	$.quote = quote;

	await Scoop.install();
	await Git.configure();
	await Prompt.configurePowerShell();
}

async function setupLinux() {
	Log.info("Running setup for Linux...");

	await APT.install();

	await Git.configure();

	await OS.changeShell();
	await OS.installOhMyFish();

	await Prompt.configureFish();
}

async function setupMacOS() {
	Log.info("Running setup for macOS...");

	await Homebrew.install();
	await Homebrew.bundle();

	await Git.configure();

	await OS.changeShell();
	await OS.installOhMyFish();

	await Prompt.configureFish();
}

/**
 * Custom quote transformer to ensure compatibility with Windows and PowerShell
 * @param {string} value string to be quoted
 * @returns string
 */
function quote(value) {
	if (/^[a-z0-9/_.-]+$/i.test(value) || value === "") {
		return value;
	}

	return value.replace(/\\/g, "\\\\").replace(/'/g, "\\\'").replace(
		/\f/g,
		"\\f",
	).replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(
		/\v/g,
		"\\v",
	).replace(/\0/g, "\\0");
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
