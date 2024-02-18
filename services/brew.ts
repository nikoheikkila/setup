import {$} from "bun";
import * as Log from "./log.js";
import * as OS from "./os.js";

const HOMEBREW_INSTALL_URL =
	"https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh";

/**
 * Installs the Homebrew package manager system-wide
 */
export const install = async (): Promise<void> => {
    if (await OS.isInstalled("brew")) {
        return Log.info("Homebrew is already installed.");
    }

    Log.info("Installing Homebrew...");

	await OS.useInstaller(HOMEBREW_INSTALL_URL, async (path: string) => {
		await $`bash ${path}`;
	});
};

/**
 * Installs Homebrew packages using the included Brewfile
 */
export const bundle = async (): Promise<void> => {
	const output = await $`brew bundle check`.text();

	if (output.includes("dependencies are satisfied")) {
        return Log.info("All Homebrew packages are already installed.");
	}

	Log.info("Installing Homebrew packages from Brewfile...");
	await $`brew bundle install`;
};
