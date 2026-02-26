/**
 * KeratoVision Service Worker (Background Script)
 *
 * Manifest V3 service worker for:
 * - Setting default config on first install
 * - Relaying messages between popup and content scripts
 */

// Default config — must match config-manager.js
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

// Set default config on first install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.sync.set(DEFAULT_CONFIG, () => {
            console.log('[KeratoVision] Default configuration set.');
        });
    }
});

// Relay messages from popup to content script on the active tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target === 'content') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    sendResponse(response);
                });
            }
        });
        return true; // async
    }
});
