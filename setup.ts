import * as Homebrew from "./services/brew.js";
import * as Git from "./services/git.js";
import * as Log from "./services/log.js";
import * as OS from "./services/os.js";
import * as Prompt from "./services/prompt.js";

Log.info(
  `
New Development Box Setup Script
By Niko Heikkilä <https://github.com/nikoheikkila>
Follow me on Mastodon: <https://fosstodon.org/@nikoheikkila>
`,
);

async function setupMacOS(): Promise<void> {
  Log.info("Running setup for macOS...");

  await Homebrew.install();
  await Homebrew.bundle();

  await Git.configure();

  await OS.changeShell();
  await OS.installOhMyFish();

  await Prompt.configureFish();
}

try {
    await setupMacOS();
} catch (error: unknown) {
    Log.warning("An error occurred during the setup process.");
    Log.error(error as Error);
    process.exit(1);
}
