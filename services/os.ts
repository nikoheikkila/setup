import {$} from "bun";
import { nanoid } from "nanoid";
import * as Log from "./log.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

const OH_MY_FISH_INSTALL_URL =
	"https://raw.githubusercontent.com/oh-my-fish/oh-my-fish/master/bin/install";

/**
 * Build path to $HOME with optional components
 */
export const home = (components = ""): string => {
	return path.resolve(os.homedir(), ...splitComponents(components));
}

/**
 * Build path from the repository root with optional components
 */
export const root = (components = ""): string => {
    return path.resolve(__dirname, '..', ...splitComponents(components));
};

/**
 * Build path from the operating system temporary directory with optional components
 */
export const temporary = (components = "") => {
    return path.resolve(os.tmpdir(), ...splitComponents(components));
};

export const isInstalled = (program: string) => $`which ${program}`.text().then((output) => output.trim().length > 0);

const splitComponents = (components = "") => components.split(path.sep);

/**
 * Sets the OS to use Fish shell
 */
export const changeShell = async () => {
	const shell = await $`which fish`.text();
	const currentShell = process.env.SHELL ?? "/bin/sh";

	if (currentShell === shell) {
		return Log.info(`${shell} is already your shell`);
	}

	Log.info(`Changing shell from ${currentShell} to ${shell}...`);
	await $`chsh -s ${shell}`;
};

/**
 * Installs the Oh-My-Fish framework
 * On CI pipelines only performs a readiness check
 */
export const installOhMyFish = async (): Promise<void> => {
    if (await isInstalled("omf")) {
        return Log.info("Oh My Fish is already installed.");
    }

	Log.info("Installing Oh My Fish...");

	await useInstaller(OH_MY_FISH_INSTALL_URL, async (path) => {
		const installFlags = ["--noninteractive", "--yes"];
		await $`fish ${path} ${installFlags}`;
	});
};

/**
 * Copies a file from source path to destination path
 */
export const copy = async (source: string, destination: string) => {
	await $`cp ${source} ${destination}`;
};

/**
 * Downloads the contents of given URL to the given destination
 */
export const download = async (url: string, destination: string) => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(
			`Could not download from '${url}'. Server responded with status ${response.status} ${response.statusText}`,
		);
	}

	const textContent = await response.text();
	await appendTo(destination, textContent);
};

/**
 * Retrieves the configuration path and its contents for the Fish shell
 */
export const getFishShellConfiguration = async () => {
	return await getShellConfiguration(home(".config/fish/config.fish"));
};

type InstallerCallback = (path: string) => Promise<void>;

/**
 * Downloads an installation script to a temporary file, executes a callback, and removes the file.
 */
export const useInstaller = async (url: string, callback: InstallerCallback) => {
	const temporaryPath = getTemporaryFilePath();

	try {
		await download(url, temporaryPath);
		await callback(temporaryPath);
	} catch (error: unknown) {
		Log.error(`Installation failed with message: ${error}`);
	} finally {
		await remove(temporaryPath);
	}
};

/**
 * Generates a random file path using nano-IDs (similar to UUIDs).
 * If extension is provided, it will be appended to the file name.
 */
const getTemporaryFilePath = (extension = "") => {
	const result = temporary(nanoid());
	return !!extension ? `${result}.${extension}` : result;
};

const getShellConfiguration = async (configurationPath: string) => {
	if (!await exists(configurationPath)) {
		return { configuration: "", configurationPath };
	}

	const configuration = await readFrom(configurationPath);
	return { configuration, configurationPath };
};

const encoding = "utf8";

export const readFrom = async (file: string) => await fs.readFile(file, encoding);
export const appendTo = async (file: string, contents: string) => {
	if (await exists(file)) {
		return await fs.appendFile(file, contents, encoding);
	}

	await fs.writeFile(file, contents, encoding);
};
export const exists = (file: string) => fs.exists(file);
export const remove = (file: string) => fs.unlink(file);
