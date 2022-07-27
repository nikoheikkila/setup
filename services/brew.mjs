import { nothrow } from "zx";
import * as Log from "./log.mjs";
import * as OS from "./os.mjs";

const HOMEBREW_INSTALL_URL =
	"https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh";

/**
 * Installs the Homebrew package manager system wide
 * @returns {Promise<void>}
 */
export const install = async () => {
	Log.info("Installing Homebrew...");

	await OS.useInstaller(HOMEBREW_INSTALL_URL, async (path) => {
		await $`bash ${path}`;
	});
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
