import * as OS from "./os.mjs";
import * as Log from "./log.mjs";

/**
 * Configures the terminal prompt with Starship
 * @returns {Promise<void>}
 */
export const configure = async () => {
	await installStarship();

	Log.info("Configuring Starship...");
	const activationCommand = "starship init fish | source";
	const { configuration, configurationPath } = await OS.getFishShellConfiguration();

	if (!configuration.includes(activationCommand)) {
		await OS.appendTo(configurationPath, activationCommand);
	}

	await OS.copy(
		OS.root("config/starship.toml"),
		OS.home(".config/starship.toml"),
	);
};

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
