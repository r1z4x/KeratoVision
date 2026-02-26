/**
 * ContrastEngine
 *
 * Adaptive contrast management to minimize ghosting and halo effects.
 * - Remaps pure black/white to softer tones
 * - Spatial frequency-aware: smaller text gets MORE contrast
 * - Scatter/glare mitigation on interactive elements
 *
 * Evidence: "CS in keratoconus reduced across ALL spatial frequencies,
 * most prominently at medium-high (6-12 cpd)" — NIH, ARVO
 */

const ContrastEngine = {
  /**
   * Get the contrast filter value for combining with other html filters.
   * @param {import('./config-manager').AdaptiveConfig} config
   * @returns {number}
   */
  getContrastValue(config) {
    const severity = Math.max(0, Math.min(5, config.keratoSeverity));
    // Range: 1.0 (none) → 0.75 (max severity) — wide enough to see
    return 1.0 - severity * 0.05;
  },

  /**
   * Generate CSS rules for contrast adaptation.
   * @param {import('./config-manager').AdaptiveConfig} config
   * @returns {string} CSS string
   */
  generate(config) {
    const { keratoSeverity } = config;
    const severity = Math.max(0, Math.min(5, keratoSeverity));

    // Text color: move away from pure black
    // Severity 0 → #1a1a1e (almost black), Severity 5 → #3a3a45 (clearly grey)
    const darkFloor = Math.round(26 + severity * 6);  // 26 → 56
    const darkHex = darkFloor.toString(16).padStart(2, '0');
    const darkColor = `#${darkHex}${darkHex}${Math.min(255, Math.round(darkFloor * 1.1)).toString(16).padStart(2, '0')}`;

    // Background: move away from pure white
    // Severity 0 → #f5f5f0 (warm white), Severity 5 → #e0e0d8 (cream)
    const lightCeil = Math.round(245 - severity * 7);  // 245 → 210
    const lightHex = lightCeil.toString(16).padStart(2, '0');
    const lightColor = `#${lightHex}${lightHex}${Math.min(255, Math.round(lightCeil * 0.97)).toString(16).padStart(2, '0')}`;

    // For small text — even darker for high spatial freq readability
    const smallDark = Math.max(10, darkFloor - 10);
    const smallHex = smallDark.toString(16).padStart(2, '0');
    const smallColor = `#${smallHex}${smallHex}${Math.round(smallDark * 1.1).toString(16).padStart(2, '0')}`;

    return `
      /* KeratoVision: Contrast Engine — Severity ${severity} */

      /* Text color override */
      html body,
      html body div,
      html body span,
      html body p,
      html body a,
      html body li,
      html body td,
      html body th,
      html body label,
      html body h1, html body h2, html body h3,
      html body h4, html body h5, html body h6 {
        color: ${darkColor} !important;
      }

      /* High spatial freq — small text needs more contrast */
      html body small,
      html body sub,
      html body sup,
      html body figcaption,
      html body caption,
      html body footer a,
      html body nav a {
        color: ${smallColor} !important;
      }

      /* Background remap */
      html body {
        background-color: ${lightColor} !important;
      }

      html body main,
      html body article,
      html body section,
      html body header,
      html body footer,
      html body nav,
      html body div {
        background-color: ${lightColor} !important;
      }

      /* Scatter/Glare — selection, focus, hover */
      html body ::selection {
        background: rgba(108, 99, 255, 0.25) !important;
        color: ${darkColor} !important;
      }

      html body a:hover {
        text-decoration-color: ${darkColor} !important;
      }

      html body input:focus,
      html body textarea:focus,
      html body select:focus {
        outline: 2px solid rgba(108, 99, 255, 0.4) !important;
        box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15) !important;
      }
    `;
  },
};
