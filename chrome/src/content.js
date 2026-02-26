/**
 * KeratoVision Content Script
 *
 * Entry point injected into every page.
 * - Idempotent: safe to inject multiple times (uses global flag)
 * - Loads config and applies adaptive rendering
 * - Listens for live updates + storage changes
 */

// Guard against re-injection (popup may re-inject scripts)
if (!window.__keratoVisionInitialized) {
    window.__keratoVisionInitialized = true;

    (async function keratoVisionInit() {
        'use strict';

        try {
            const config = await ConfigManager.load();

            if (config.enabled) {
                AdaptiveRenderer.apply(config);
            }

            // Storage change listener
            ConfigManager.onChange((updatedConfig) => {
                if (updatedConfig.enabled) {
                    AdaptiveRenderer.apply(updatedConfig);
                } else {
                    AdaptiveRenderer.remove();
                }
            });

            // Direct message listener
            chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
                try {
                    switch (message.type) {
                        case 'LIVE_UPDATE':
                            if (message.config) {
                                if (message.config.enabled) {
                                    AdaptiveRenderer.apply(message.config);
                                } else {
                                    AdaptiveRenderer.remove();
                                }
                            }
                            sendResponse({ status: 'applied' });
                            return false;

                        case 'TOGGLE':
                            if (message.enabled) {
                                ConfigManager.load().then((cfg) => {
                                    AdaptiveRenderer.apply(cfg);
                                    sendResponse({ status: 'enabled' });
                                });
                            } else {
                                AdaptiveRenderer.remove();
                                sendResponse({ status: 'disabled' });
                            }
                            return true;

                        case 'GET_STATUS':
                            sendResponse({ active: AdaptiveRenderer.isActive(), version: '2.1' });
                            return false;

                        case 'FORCE_REFRESH':
                            ConfigManager.load().then((cfg) => {
                                AdaptiveRenderer.apply(cfg);
                                sendResponse({ status: 'refreshed' });
                            });
                            return true;

                        default:
                            return false;
                    }
                } catch (err) {
                    console.error('[KeratoVision] Error:', err);
                    return false;
                }
            });

            console.log('[KeratoVision] Adaptive rendering engine v2.1 initialized.');
        } catch (error) {
            console.error('[KeratoVision] Init failed:', error);
        }
    })();
} else {
    // Re-injection: just refresh the renderer with current config
    console.log('[KeratoVision] Re-injection detected, refreshing...');
    ConfigManager.load().then((config) => {
        if (config.enabled) {
            AdaptiveRenderer.apply(config);
        }
    });
}
