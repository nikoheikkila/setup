import { nothrow } from "zx";
import * as Log from "./log.mjs";
import * as OS from "./os.mjs";

/**
 * Installs the Homebrew package manager system wide
 * @returns {Promise<void>}
 */
export const install = async () => {
	if (OS.isInstalled("brew")) {
		return Log.info("Homebrew is already installed.");
	}

	Log.info("Installing Homebrew...");
	await $`curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash`;
};

/**
 * Installs Homebrew packages using the included Brewfile
 * @returns {Promise<void>}
 */
export const bundle = async () => {
	const allInstalled = await $`brew bundle check`.exitCode === 0;

	if (allInstalled) {
		return;
	}

	Log.info("Installing Homebrew packages from Brewfile...");
	await nothrow($`brew bundle`);
};
