import * as Log from "./log.mjs";
import * as OS from "./os.mjs";

const SCOOP_INSTALL_URL = "https://get.scoop.sh";

const buckets = ["extras"];
const apps = ["buf", "coreutils", "git", "starship"];

export async function install() {
	await installScoop();
	await addBuckets();
	await installApps();
	await updateApps();
}

async function installScoop() {
	Log.info("Installing Scoop...");

	await OS.usePowerShellInstaller(
		SCOOP_INSTALL_URL,
		async (path) => {
			await $`Set-ExecutionPolicy RemoteSigned -scope CurrentUser`;
			await $`powershell.exe -file "${path}" -RunAsAdmin`;
		},
	);

	const shimsPath = OS.home("scoop\\shims");
	process.env.PATH = `${shimsPath};${process.env.PATH}`;

	Log.warning(
		`Temporarily added ${shimsPath} to $PATH. Please, restart Windows after the script has finished.`,
	);
}

async function addBuckets() {
	for (const bucket of buckets) {
		await $`scoop bucket add ${bucket}`;
	}
}

async function installApps() {
	await $`scoop install ${apps}`;
}

async function updateApps() {
	await $`scoop update -a`;
}
