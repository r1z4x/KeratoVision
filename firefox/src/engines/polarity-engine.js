/**
 * PolarityEngine
 *
 * Reverse contrast mode (light text on dark background).
 *
 * Evidence: "Some low vision patients, particularly those with severe
 * contrast sensitivity loss or glare sensitivity, find reverse contrast
 * significantly more effective" — W3C Low Vision Task Force, OEPF
 *
 * Uses filter: invert(1) hue-rotate(180deg) on html,
 * then re-inverts media elements so images/videos appear normal.
 */

const PolarityEngine = {
    /**
     * Generate CSS rules for polarity reversal.
     * @param {import('./config-manager').AdaptiveConfig} config
     * @returns {string} CSS string
     */
    generate(config) {
        if (!config.polarityReversed) {
            return '/* KeratoVision: Polarity — normal mode */';
        }

        return `
      /* KeratoVision: Polarity Reversal (Reverse Contrast) */
      /* Source: W3C Low Vision Task Force — glare sensitivity mitigation */

      html {
        filter: invert(1) hue-rotate(180deg) !important;
        background-color: #000 !important;
      }

      /* Re-invert media elements to preserve original appearance */
      html body img,
      html body video,
      html body canvas,
      html body svg,
      html body picture,
      html body [style*="background-image"],
      html body iframe {
        filter: invert(1) hue-rotate(180deg) !important;
      }

      /* Ensure embedded objects also re-inverted */
      html body object,
      html body embed {
        filter: invert(1) hue-rotate(180deg) !important;
      }

      /* Fix selection visibility in inverted mode */
      ::selection {
        background: rgba(80, 120, 255, 0.4) !important;
        color: #fff !important;
      }
    `;
    },

    /**
     * Get the filter adjustments needed when polarity is active.
     * Other engines need to know if polarity is on to adjust their filters.
     * @param {import('./config-manager').AdaptiveConfig} config
     * @returns {{ active: boolean }}
     */
    getState(config) {
        return { active: !!config.polarityReversed };
    },
};
