/**
 * @typedef {Object} AdaptiveConfig
 * @property {number} astigmatAxis     - 0–180 degrees
 * @property {number} astigmatPower    - 0–6 diopters
 * @property {number} keratoSeverity   - 0–5 scale
 * @property {number} fontSize         - 16–30 px
 * @property {number} luminanceClamp   - 0.90–1.0
 * @property {boolean} enabled
 * @property {boolean} polarityReversed - reverse contrast (dark mode)
 * @property {boolean} edgeEnhancement - Gabor-inspired text-stroke
 * @property {boolean} readingGuide    - mouse-following reading line
 * @property {number} comaAngle        - 0–360 degrees (coma aberration direction)
 * @property {number} comaIntensity    - 0–5 scale
 * @property {boolean} chromaticCorrection - chromatic aberration reduction
 */

const DEFAULT_CONFIG = Object.freeze({
  astigmatAxis: 90,
  astigmatPower: 1.5,
  keratoSeverity: 2,
  fontSize: 18,
  luminanceClamp: 0.95,
  enabled: true,
  // New: Academic research-based parameters
  polarityReversed: false,
  edgeEnhancement: true,
  readingGuide: false,
  comaAngle: 0,
  comaIntensity: 0,
  chromaticCorrection: true,
});

const ConfigManager = {
  /**
   * Load config from chrome.storage.sync, merging with defaults.
   * @returns {Promise<AdaptiveConfig>}
   */
  async load() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT_CONFIG, (result) => {
        resolve(result);
      });
    });
  },

  /**
   * Save config to chrome.storage.sync.
   * @param {Partial<AdaptiveConfig>} config
   * @returns {Promise<void>}
   */
  async save(config) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(config, resolve);
    });
  },

  /**
   * Listen for storage changes and fire callback with updated config.
   * @param {(config: AdaptiveConfig) => void} callback
   */
  onChange(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;

      const updated = {};
      for (const [key, { newValue }] of Object.entries(changes)) {
        if (key in DEFAULT_CONFIG) {
          updated[key] = newValue;
        }
      }

      if (Object.keys(updated).length > 0) {
        ConfigManager.load().then(callback);
      }
    });
  },

  /**
   * Reset config to defaults.
   * @returns {Promise<void>}
   */
  async reset() {
    return ConfigManager.save({ ...DEFAULT_CONFIG });
  },

  /** @returns {AdaptiveConfig} */
  getDefaults() {
    return { ...DEFAULT_CONFIG };
  },
};
