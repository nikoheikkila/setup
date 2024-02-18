import { $ } from "bun";
import * as Log from "./log.js";
import * as OS from "./os.js";

const STARSHIP_INSTALLER_URL = "https://starship.rs/install.sh";

/**
 * Configures the Fish terminal prompt with Starship
 */
export const configureFish = async (): Promise<void> => {
	await installStarship();

	Log.info("Configuring Starship...");
	const { configurationPath } =
		await OS.getFishShellConfiguration();

	if (!configurationPath) {
		return Log.info(
			"Could not find Fish shell configuration file. Skipping configuration.",
		);
	}

	await copyStarshipConfiguration();
};

const installStarship = async (): Promise<void> => {
    if (await OS.isInstalled("starship")) {
        return Log.info("Starship is already installed.");
    }

	await OS.useInstaller(STARSHIP_INSTALLER_URL, async (path: string) => {
		await $`sh ${path} --yes`;
	});
};

async function copyStarshipConfiguration(): Promise<void> {
	await OS.copy(
		OS.root("config/starship.toml"),
		OS.home(".config/starship.toml"),
	);
}
