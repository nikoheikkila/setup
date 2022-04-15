import { fetch, fs, os, path, which } from "zx";
import * as Log from "./log.mjs";

/**
 * Checks whether current environment is a CI pipeline
 * @returns {boolean}
 */
export const isPipeline = () => !!process.env.CI;

/**
 * Build path to $HOME with optional components
 * @param {string} components
 * @returns string
 */
export const home = (components = "") =>
	path.resolve(os.homedir(), ...(components.split(path.sep)));

/**
 * Build path from the repository root with optional components
 * @param {string} components
 * @returns string
 */
export const root = (components = "") =>
	path.resolve(__dirname, ...(components.split(path.sep)));

/**
 * Build path from the opereating system temporary directory with optional components
 * @param {string} components
 * @returns string
 */
export const temporary = (components = "") =>
	path.resolve(os.tmpdir(), ...(components.split(path.sep)));

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
 * Validate whether a given program is installed and located in $PATH
 * @param {string} program
 * @returns boolean
 */
export const isInstalled = (program) => which.sync(program) !== null;

/**
 * Sets the OS to use Fish shell
 * @returns {Promise<void>}
 */
export const changeShell = async () => {
	if (isPipeline()) {
		return Log.info("Not changing the login shell as this is a CI pipeline.");
	}

	const shell = "/usr/local/bin/fish";
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

	const destination = temporary("install.fish");
	const installURL = "https://raw.githubusercontent.com/oh-my-fish/oh-my-fish/master/bin/install";
	const installFlags = ["--noninteractive", "--yes"];

	if (isPipeline()) {
		installFlags.push("--check");
	}

	await download(installURL, destination);
	await $`fish ${destination} ${installFlags}`;
	await remove(destination);
};

/**
 * Configures the terminal prompt with Starship
 * @returns {Promise<void>}
 */
export const configurePrompt = async () => {
	if (!isInstalled("starship")) {
		Log.info("Installing Starship...");
		await $`curl -sS https://starship.rs/install.sh | sh`;
	}

	Log.info("Configuring Starship...");
	const activationCommand = "starship init fish | source";
	const { configuration, configurationPath } = await getFishShellConfiguration();

	if (!configuration.includes(activationCommand)) {
		await appendTo(configurationPath, activationCommand);
	}

	await copy(root("config/starship.toml"), home(".config/starship.toml"));
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

	await $`cp -a ${source} ${destination}`;
};

/**
 * Downloads the contents of given URL to the given destination
 * @param {string} url
 * @param {string} destination
 */
export const download = async (url, destination) => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Could not download ${url}`);
	}

	const textContent = await response.text();
	await appendTo(destination, textContent);
};

const getFishShellConfiguration = async () => {
	const configurationPath = home(".config/fish/config.fish");
	const configurationExists = await exists(configurationPath);

	if (!configurationExists) {
		return { configuration: "", configurationPath };
	}

	const configuration = await readFrom(configurationPath);
	return { configuration, configurationPath };
};

const encoding = "utf8";

const readFrom = async (file) => await fs.readFile(file, encoding);
const exists = async (file) => await fs.pathExists(file);
const appendTo = async (file, contents) =>
	await fs.appendFile(file, contents, { encoding });
const remove = async (file) => await fs.remove(file);
