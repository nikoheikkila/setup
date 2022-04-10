import * as Log from "./log.mjs";
import * as OS from "./os.mjs";

const dotFiles = [".gitconfig", ".gitignore"];

/**
 * Configures Git with desired dotfiles
 * @returns {Promise<void>}
 */
export const configure = async () => {
	Log.info("Configuring Git...");

	for (const file of dotFiles) {
		await OS.copy(OS.root(`dotfiles/${file}`), OS.home(file));
	}
};
