/**
 * KeratoVision Background Script — Firefox
 *
 * Persistent background page (MV2).
 * Sets default config on first install and relays messages.
 */

const DEFAULT_CONFIG = {
    astigmatAxis: 90,
    astigmatPower: 1.5,
    keratoSeverity: 2,
    fontSize: 18,
    luminanceClamp: 0.95,
    enabled: true,
    polarityReversed: false,
    edgeEnhancement: true,
    readingGuide: false,
    comaAngle: 0,
    comaIntensity: 0,
    chromaticCorrection: true,
};

browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        browser.storage.sync.set(DEFAULT_CONFIG).then(() => {
            console.log('[KeratoVision] Default configuration set.');
        });
    }
});

browser.runtime.onMessage.addListener((message, sender) => {
    if (message.target === 'content') {
        return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs[0]?.id) {
                return browser.tabs.sendMessage(tabs[0].id, message);
            }
        });
    }
});
