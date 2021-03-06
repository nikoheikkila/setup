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
	[[ $(uname -a | grep -ci "Darwin") -eq 1 ]]
}

function change_shell() {
	local shell="${1}"

	if [[ -n "${NO_INTERACTIVE}" ]]; then
		echo "Setting login shell to ${shell}"
	else
		chsh -s "${shell}"
	fi
}

function copy() {
    local source="${1}"
	local target="${2}"

    # Prompt before overwriting a file
    set +e
    command cp -iv "${source}" "${target}"
    set -e
}

ohai "New Development Box Setup Script"
ohai "By Niko Heikkilä"
ohai "Follow me on Mastodon: https://mastodon.technology/@nikoheikkila"

# Export necessary variables
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_EMOJI=1
export HOMEBREW_MAKE_JOBS=4

# Preliminary checks
[[ -d "$HOME/.config" ]] || mkdir -p "$HOME/.config"

# Install Homebrew or Linuxbrew
if ! command -v brew > /dev/null; then
	ohai "Installing Homebrew..."

	if on_mac; then
		/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
	else
		/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

		[[ -d $HOME/.linuxbrew ]] && eval '$($HOME/.linuxbrew/bin/brew shellenv)'
		[[ -d /home/linuxbrew/.linuxbrew ]] && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
		[[ -r $HOME/.bash_profile ]] && echo "eval \$($(brew --prefix)/bin/brew shellenv)" >> "$HOME/.bash_profile"

		echo "eval \$($(brew --prefix)/bin/brew shellenv)" >> "$HOME/.profile"
	fi

	ohai "Installed $(brew --version 2>&1 | head -n 1)"
fi

ohai "Checking that required Homebrew formulae are installed..."
brew bundle || true

ohai "Setting up Git..."
copy dotfiles/.gitignore "$HOME/.gitignore"
copy dotfiles/.gitconfig "$HOME/.gitconfig"

change_shell "$(command -v fish)"

if [[ ! -d "$HOME/.local/share/omf" ]]; then
	ohai "Installing Oh-My-Fish framework..."
	curl -sSL https://get.oh-my.fish > install
    fish install --path="$HOME/.local/share/omf" --config="$HOME/.config/omf"
    rm -f install
	ohai "Installed $(omf --version)"
fi

ohai "Configuring Starship prompt..."
copy config/starship.toml "$HOME/.config/starship.toml"

if [[ $(grep -c "eval (starship init fish)" "$HOME/.config/fish/config.fish") -eq 0 ]]; then
    echo "eval (starship init fish)" >> "$HOME/.config/fish/config.fish"
fi

ohai "Configuring tmux..."
[[ -d "$HOME/.tmux" ]] && rm -rf "$HOME/.tmux/"
git clone https://github.com/nikoheikkila/.tmux "$HOME/.tmux"
copy "$HOME/.tmux/.tmux.conf" "$HOME/.tmux.conf"
copy "$HOME/.tmux/.tmux.conf.local" "$HOME/.tmux.conf.local"

# Perform post-install steps for macOS
on_mac && source mac_defaults.sh

ohai "Done!"
