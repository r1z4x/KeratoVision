/**
 * KeratoVision Content Script — Firefox
 *
 * Entry point injected into every page.
 * Uses browser.runtime (Promise-based).
 */

if (!window.__keratoVisionInitialized) {
    window.__keratoVisionInitialized = true;

    (async function keratoVisionInit() {
        'use strict';

        try {
            const config = await ConfigManager.load();

            if (config.enabled) {
                AdaptiveRenderer.apply(config);
            }

            ConfigManager.onChange((updatedConfig) => {
                if (updatedConfig.enabled) {
                    AdaptiveRenderer.apply(updatedConfig);
                } else {
                    AdaptiveRenderer.remove();
                }
            });

            browser.runtime.onMessage.addListener((message, sender) => {
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
                            return Promise.resolve({ status: 'applied' });

                        case 'TOGGLE':
                            if (message.enabled) {
                                return ConfigManager.load().then((cfg) => {
                                    AdaptiveRenderer.apply(cfg);
                                    return { status: 'enabled' };
                                });
                            } else {
                                AdaptiveRenderer.remove();
                                return Promise.resolve({ status: 'disabled' });
                            }

                        case 'GET_STATUS':
                            return Promise.resolve({ active: AdaptiveRenderer.isActive(), version: '2.1' });

                        case 'FORCE_REFRESH':
                            return ConfigManager.load().then((cfg) => {
                                AdaptiveRenderer.apply(cfg);
                                return { status: 'refreshed' };
                            });

                        default:
                            return false;
                    }
                } catch (err) {
                    console.error('[KeratoVision] Error:', err);
                    return false;
                }
            });

            console.log('[KeratoVision] Firefox adaptive rendering engine v2.1 initialized.');
        } catch (error) {
            console.error('[KeratoVision] Init failed:', error);
        }
    })();
} else {
    console.log('[KeratoVision] Re-injection detected, refreshing...');
    ConfigManager.load().then((config) => {
        if (config.enabled) {
            AdaptiveRenderer.apply(config);
        }
    });
}
