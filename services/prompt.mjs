import * as Log from "./log.mjs";
import * as OS from "./os.mjs";

const STARSHIP_INSTALLER_URL = "https://starship.rs/install.sh";

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

	await activateStarship(activationCommand, configuration, configurationPath);
	await copyStarshipConfiguration();
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

	await activateStarship(activationCommand, configuration, configurationPath);
	await copyStarshipConfiguration();
}

const installStarship = async () => {
	await OS.useInstaller(
		STARSHIP_INSTALLER_URL,
		async (path) => {
			await $`sh ${path} --yes`;
		},
	);
};

async function activateStarship(command, configuration, configurationPath) {
	if (!configuration.includes(command)) {
		await OS.appendTo(configurationPath, command);
	}
}

async function copyStarshipConfiguration() {
	await OS.copy(
		OS.root("config/starship.toml"),
		OS.home(".config/starship.toml"),
	);
}
