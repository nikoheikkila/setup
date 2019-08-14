#!/bin/bash
set -eo pipefail
IFS=$'\n\t'

#  __      __.__             ________  .__       _________
# /  \    /  \  |__   ____   \______ \ |__| _____\_____   \
# \   \/\/   /  |  \ /  _ \   |    |  \|  |/  ___/  /   __/
#  \        /|   Y  (  <_> )  |    `   \  |\___ \  |   |
#   \__/\  / |___|  /\____/  /_______  /__/____  > |___|
#        \/       \/                 \/        \/  <___>

# Helper functions

function ohai() {
	local green='\033[0;32m'
	local reset='\033[0m'
	local msg="${1}"

	echo -e "${green}${msg}${reset}"
}

function on_mac() {
	[[ $(uname -a | grep -c "Darwin") -eq 1 ]]
}

function on_wsl() {
	[[ $(uname -a | grep -c "Microsoft") -eq 1 ]]
}

# Start

ohai "New Development Box Setup Script"
ohai "By Niko Heikkilä"
ohai "Follow me on Mastodon: https://mastodon.technology/@nikoheikkila"

# Export necessary variables
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_EMOJI=1

if ! command -v brew > /dev/null; then
	ohai "Installing Homebrew..."

	if on_mac; then
		ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" < /dev/null
	elif on_wsl; then
		sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)" < /dev/null

		[[ -d $HOME/.linuxbrew ]] && eval '$($HOME/.linuxbrew/bin/brew shellenv)'
		[[ -d /home/linuxbrew/.linuxbrew ]] && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
		[[ -r $HOME/.bash_profile ]] && echo "eval \$($(brew --prefix)/bin/brew shellenv)" >> "$HOME/.bash_profile"

		echo "eval \$($(brew --prefix)/bin/brew shellenv)" >> "$HOME/.profile"
	fi

fi

# Latest brew, install brew cask on macOS
brew upgrade
brew update
brew tap caskroom/cask

ohai "Installing regular Homebrew formulae..."

while read -r package; do
	brew install "$package"
done < formulae.txt

if on_mac; then
	ohai "Installing Homebrew Casks..."
	while read -r cask; do
		brew install "$cask"
	done < casks.txt
fi

if [[ $(grep "$(whoami)" /etc/passwd | grep -c fish) -eq 0 ]]; then
	ohai "Setting login shell to Fish"
	chsh -s "$(command -v fish)"
fi

if [[ ! -d "$HOME/.local/share/omf" ]]; then
	ohai "Installing Oh-My-Fish framework..."
	curl -sSL https://get.oh-my.fish > install
    fish install --path="$HOME/.local/share/omf" --config="$HOME/.config/omf"
    rm -f install
fi

# Perform post-install steps for macOS
on_mac && source mac_defaults.sh

ohai "Done!"
