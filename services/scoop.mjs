import * as OS from "./os.mjs";
import * as Log from "./log.mjs";

const buckets = ["extras"];

const apps = ["buf", "coreutils", "git", "starship"];

export async function install() {
	await installScoop();
	await addBuckets();
	await installApps();
	await updatePackages();
}

async function installScoop() {
	if (OS.isInstalled("scoop")) {
		return Log.info("Scoop is already installed");
	}

	const downloadPath = OS.cwd("install.ps1");
	const shimsPath = OS.home("scoop\\shims");

	Log.info("Installing Scoop...");
	await OS.download("https://get.scoop.sh", downloadPath);
	await $`Set-ExecutionPolicy RemoteSigned -scope CurrentUser`;
	await $`${downloadPath} -RunAsAdmin`;
	await OS.remove(downloadPath);

	Log.info(`Adding ${shimsPath} to $PATH`);
	process.env.PATH = `${shimsPath};${process.env.PATH}`;
}

async function addBuckets() {
	for (const bucket of buckets) {
		await $`scoop bucket add ${bucket}`;
	}
}

async function installApps() {
	await $`scoop install ${apps}`;
}

async function updatePackages() {
	await $`scoop update -a`;
}
