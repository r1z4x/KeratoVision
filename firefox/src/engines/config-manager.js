/**
 * KeratoVision ConfigManager — Firefox
 *
 * Uses browser.storage.sync (Promise-based).
 */

const ConfigManager = {
    defaults: {
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
    },

    async load() {
        try {
            const data = await browser.storage.sync.get(ConfigManager.defaults);
            return { ...ConfigManager.defaults, ...data };
        } catch (err) {
            console.warn('[KeratoVision] Config load fallback:', err);
            return { ...ConfigManager.defaults };
        }
    },

    onChange(callback) {
        browser.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync') return;
            ConfigManager.load().then(callback);
        });
    },
};
