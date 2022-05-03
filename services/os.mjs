import { nanoid } from "nanoid";
import { fetch, fs, os, path, which } from "zx";
import * as Log from "./log.mjs";

const OH_MY_FISH_INSTALL_URL = "https://raw.githubusercontent.com/oh-my-fish/oh-my-fish/master/bin/install";

/**
 * Checks whether current environment is a CI pipeline
 * @returns {boolean}
 */
export const isPipeline = () => !!process.env.CI;

/**
 * Build path to the current working directory with optional components
 * @param {string} components
 * @returns string
 */
export const cwd = (components = "") =>
	path.resolve(process.cwd(), ...splitComponents(components));

/**
 * Build path to $HOME with optional components
 * @param {string} components
 * @returns string
 */
export const home = (components = "") =>
	path.resolve(os.homedir(), ...splitComponents(components));

/**
 * Build path from the repository root with optional components
 * @param {string} components
 * @returns string
 */
export const root = (components = "") =>
	path.resolve(__dirname, ...splitComponents(components));

/**
 * Build path from the opereating system temporary directory with optional components
 * @param {string} components
 * @returns string
 */
export const temporary = (components = "") =>
	path.resolve(os.tmpdir(), ...splitComponents(components));

const splitComponents = (components = "") => components.split(path.sep);

/**
 * Get current operating system name
 * @returns string
 */
export const platform = () => os.platform().toLowerCase();

/**
 * Determines whether the current operating system is Windows
 * @returns {boolean}
 */
export const isWindows = () => platform() === "win32";

/**
 * Retrieves the path to the given executable or throws error if not found
 * @param {string} program
 * @returns {string}
 * @throws {Error}
 */
export const getPath = (program) => which.sync(program);

/**
 * Sets the OS to use Fish shell
 * @returns {Promise<void>}
 */
export const changeShell = async () => {
	if (isPipeline()) {
		return Log.info("Not changing the login shell as this is a CI pipeline.");
	}

	const shell = await which("fish");
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
 * @returns {Promise<void>}
 */
export const installOhMyFish = async () => {
	Log.info("Installing Oh My Fish...");

	await useInstaller(
		OH_MY_FISH_INSTALL_URL,
		async (path) => {
			const installFlags = ["--noninteractive", "--yes"];

			if (isPipeline()) {
				installFlags.push("--check");
			}

			await $`fish ${path} ${installFlags}`;
		},
	);
};

/**
 * Copies a file from source path to destination path
 * @param {string} source
 * @param {string} destination
 * @returns {Promise<void>}
 */
export const copy = async (source, destination) => {
	if (isWindows()) {
		source = source.replace(/\//g, "\\");
		destination = destination.replace(/\//g, "\\");
	}

	await $`cp ${source} ${destination}`;
};

/**
 * Downloads the contents of given URL to the given destination
 * @param {string} url
 * @param {string} destination
 */
export const download = async (url, destination) => {
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
 * @returns {Promise<{configuration: string, configurationPath: string}>}
 */
export const getFishShellConfiguration = async () => {
	return await getShellConfiguration(home(".config/fish/config.fish"));
};

/**
 * Retrieves the configuration path and its contents for the PowerShell
 * @returns {Promise<{configuration: string, configurationPath: string}>}
 */
export const getPowerShellConfiguration = async () => {
	return await getShellConfiguration(process.env.PROFILE);
};

/**
 * Downloads an installation script to a temporary file, executes a callback, and removes the file.
 * @param {string} url
 * @param {(path: string) => Promise<void>} callback
 * @returns {Promise<void>}
 */
export const useInstaller = async (url, callback) => {
	const temporaryPath = getTemporaryFilePath();

	try {
		await download(url, temporaryPath);
		await callback(temporaryPath);
	} catch (error) {
		Log.error(`Installation failed with message: ${error.message}`);
	} finally {
		await remove(temporaryPath);
	}
};

/**
 * Downloads a PowerShell installation script to a temporary file, executes a callback, and removes the file.
 * @param {string} url
 * @param {(path: string) => Promise<void>} callback
 * @returns {Promise<void>}
 */
export const usePowerShellInstaller = async (url, callback) => {
	const extension = "ps1";
	const temporaryPath = getTemporaryFilePath(extension);

	try {
		await download(url, temporaryPath);
		await callback(temporaryPath);
	} catch (error) {
		Log.error(`Installation failed with message: ${error.message}`);
	} finally {
		await remove(temporaryPath);
	}
};

/**
 * Generates a random file path using nano-IDs (similar to UUIDs).
 * If extension is provided, it will be appended to the file name.
 * Note that on Windows, scripts MUST have a file extension (e.g. `.ps1`) before you can run them.
 * @returns string
 */
const getTemporaryFilePath = (extension = "") => {
	const result = temporary(nanoid());
	return !!extension ? `${result}.${extension}` : result;
};

const getShellConfiguration = async (configurationPath) => {
	if (!exists(configurationPath)) {
		return { configuration: "", configurationPath };
	}

	const configuration = await readFrom(configurationPath);
	return { configuration, configurationPath };
};

const encoding = "utf8";

export const readFrom = async (file) => await fs.readFile(file, encoding);
export const appendTo = async (file, contents) => {
	if (exists(file)) {
		return await fs.appendFile(file, contents, encoding);
	}

	await fs.writeFile(file, contents, encoding);
};
export const exists = (file) => fs.pathExistsSync(file);
export const remove = async (file) => await fs.remove(file);
