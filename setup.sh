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

ohai "New Development Box Setup Script"
ohai "By Niko Heikkilä"
ohai "Follow me on Mastodon: https://mastodon.technology/@nikoheikkila"

# Export necessary variables
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_EMOJI=1

# Preliminary checks
[[ -d "$HOME/.config" ]] || mkdir -p "$HOME/.config"

# Install Homebrew or Linuxbrew
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

ohai "Installing Homebrew formulae..."
while read -r package; do brew install "$package"; done < formulae.txt

# These are only available on macOS
on_mac && brew install reattach-to-user-namespace

ohai "Setting login shell to Fish"
chsh -s "$(command -v fish)"

if [[ ! -d "$HOME/.local/share/omf" ]]; then
	ohai "Installing Oh-My-Fish framework..."
	curl -sSL https://get.oh-my.fish > install
    fish install --path="$HOME/.local/share/omf" --config="$HOME/.config/omf"
    rm -f install
fi

ohai "Configuring Starship prompt"
cp starship.toml "$HOME/.config/"

if [[ $(grep -c "eval (starship init fish)" "$HOME/.config/fish/config.fish") -eq 0 ]]; then
    echo "eval (starship init fish)" >> "$HOME/.config/fish/config.fish"
fi

ohai "Configuring tmux"
[[ -d "$HOME/.tmux" ]] && rm -rf "$HOME/.tmux/"
git clone https://github.com/nikoheikkila/.tmux "$HOME/.tmux"
cp "$HOME/.tmux/.tmux.conf" "$HOME/"
cp "$HOME/.tmux/.tmux.conf.local" "$HOME/"

# Perform post-install steps for macOS
on_mac && source mac_defaults.sh

ohai "Done!"
