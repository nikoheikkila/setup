import { fs, os, path, which } from "zx";
import * as Log from "./log.mjs";

/**
 * Build path to $HOME with optional components
 * @param {string} components
 * @returns string
 */
export const home = (components = "") =>
	path.resolve(os.homedir(), ...(components.split("/")));

/**
 * Build path from the repository root with optional components
 * @param {string} components
 * @returns string
 */
export const root = (components = "") =>
	path.resolve(__dirname, ...(components.split("/")));

/**
 * Get current operating system name
 * @returns string
 */
export const platform = () => os.platform().toLowerCase();

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
 * @returns {Promise<void>}
 */
export const installOhMyFish = async () => {
	Log.info("Installing Oh My Fish...");

	if (fs.pathExistsSync(home(".local/share/omf"))) {
		return Log.info("Oh My Fish is configured.");
	}

	await $`curl https://raw.githubusercontent.com/oh-my-fish/oh-my-fish/master/bin/install | fish`;
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
	await $`cp -a ${source} ${destination}`;
};

const readFrom = async (file) => await fs.readFile(file, "utf8");
const appendTo = async (contents, file) => await fs.appendFile(file, contents);

const getFishShellConfiguration = async () => {
	const configurationPath = home(".config/fish/config.fish");
	const configuration = await readFrom(configurationPath);

	return { configuration, configurationPath };
};
