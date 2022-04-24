import * as OS from "./os.mjs";
import * as Log from "./log.mjs";

/**
 * Configures the Fish terminal prompt with Starship
 * @returns {Promise<void>}
 */
export const configureFish = async () => {
	await installStarship();

	Log.info("Configuring Starship...");
	const { configuration, configurationPath } = await OS.getFishShellConfiguration();

	if (!configurationPath) {
		return Log.info(
			"Could not find Fish shell configuration file. Skipping configuration.",
		);
	}

	const activationCommand = "starship init fish | source";

	if (!configuration.includes(activationCommand)) {
		await OS.appendTo(configurationPath, activationCommand);
	}

	await OS.copy(
		OS.root("config/starship.toml"),
		OS.home(".config/starship.toml"),
	);
};

/**
 * Configures the PowerShell terminal prompt with Starship
 * @returns {Promise<void>}
 */
export async function configurePowerShell() {
	Log.info("Configuring Starship...");

	const { configuration, configurationPath } = await OS.getPowerShellConfiguration();

	if (!configurationPath) {
		return Log.warning(
			"Could not find PowerShell configuration file (see $PROFILE). Skipping configuration.",
		);
	}

	const activationCommand = "Invoke-Expression (&starship init powershell)";

	if (!configuration.includes(activationCommand)) {
		await OS.appendTo(configurationPath, activationCommand);
	}

	await OS.copy(
		OS.root("config/starship.toml"),
		OS.home(".config/starship.toml"),
	);
}

const installStarship = async () => {
	if (OS.isInstalled("starship")) {
		return Log.info("Starship is already installed");
	}

	const destination = OS.temporary("install.sh");
	const installURL = "https://starship.rs/install.sh";
	const installFlags = ["--yes"];

	await OS.download(installURL, destination);
	await $`sh ${destination} ${installFlags}`;
	await OS.remove(destination);
};
