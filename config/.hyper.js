"use strict";
// See https://hyper.is#cfg for all currently supported options.

const fontFamily = '"JetBrainsMono Nerd Font", Monaco, monospace';

module.exports = {
    config: {
        updateChannel: 'stable',
        fontSize: 20,
        fontFamily,
        uiFontFamily: fontFamily,
        fontWeight: 'normal',
        fontWeightBold: 'bold',
        lineHeight: 1.25,
        letterSpacing: 0,
        cursorColor: 'rgba(248,28,229,0.8)',
        cursorAccentColor: '#000',
        cursorShape: 'BEAM',
        cursorBlink: false,
        foregroundColor: '#fff',
        backgroundColor: '#000',
        selectionColor: 'rgba(248,28,229,0.3)',
        borderColor: '#333',
        css: '',
        termCSS: '',
        workingDirectory: '',
        showHamburgerMenu: '',
        showWindowControls: false,
        padding: '10px 0 0 10px',
        shell: '/opt/homebrew/bin/fish',
        shellArgs: ['-i', '--login'],
        env: {},
        bell: false,
        copyOnSelect: true,
        defaultSSHApp: true,
        quickEdit: false,
        macOptionSelectionMode: 'vertical',
        webGLRenderer: true,
        webLinksActivationKey: '',
        disableLigatures: false,
        disableAutoUpdates: false,
        screenReaderMode: false,
        preserveCWD: true,
    },
    plugins: ["hyper-night-owl"],
    localPlugins: [],
    keymaps: {},
};
//# sourceMappingURL=config-default.js.map
