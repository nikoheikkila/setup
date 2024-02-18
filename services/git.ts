import * as Log from "./log.ts";
import * as OS from "./os.ts";

const dotFiles = [".gitconfig", ".gitignore"];

/**
 * Configures Git with desired dotfiles
 */
export const configure = async () => {
	Log.info("Configuring Git...");

	for (const file of dotFiles) {
		await OS.copy(OS.root(`dotfiles/${file}`), OS.home(file));
	}
};
