const repositories = ["ppa:fish-shell/release-3"];

const packages = [
	"awscli",
	"azure-cli",
	"bash",
	"bat",
	"cmake",
	"curl",
	// "exa", -- not available in ubuntu 20.04
	"fd-find",
	"fish",
	"fping",
	"fzf",
	"git-extras",
	"git",
	"gnupg",
	"golang",
	"grc",
	"htop",
	"httpie",
	"hugo",
	"ispell",
	"jq",
	"ncdu",
	"neovim",
	"nodejs",
	"optipng",
	"prettyping",
	// "ripgrep", -- currently broken package :(
	"rsync",
	"rustc",
	"shellcheck",
	"speedtest-cli",
	"tldr",
	"tmux",
	"tree",
	"wget",
];

/**
 * Installs packages using APT package manager
 * @returns {Promise<void>}
 */
export async function install() {
	await addRepositories();
	await installPackages();
	await cleanup();
}

async function cleanup() {
	await $`sudo apt-get -y autoremove`;
}

async function installPackages() {
	await $`sudo dpkg --configure -a`;
	await $`sudo apt-get install -f -y ${packages}`;
}

async function addRepositories() {
	await $`sudo apt-add-repository -y ${repositories}`;
	await $`sudo apt-get update`;
}
