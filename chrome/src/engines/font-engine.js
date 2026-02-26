/**
 * FontEngine
 *
 * Typography overrides for keratoconus/astigmatism readability.
 * - Sans-serif enforcement
 * - Clear minimum font-size (direct px, no invalid CSS)
 * - Visible letter-spacing and line-height increases
 * - Controlled font-weight
 *
 * Evidence: "16-18px body, 1.5-1.75× line-height" — Harvard, Smashing Magazine
 * Ranges widened for perceptible difference at each severity level.
 */

const FontEngine = {
  /**
   * Generate CSS rules for font adaptation.
   * @param {import('./config-manager').AdaptiveConfig} config
   * @returns {string} CSS string
   */
  generate(config) {
    const { fontSize, keratoSeverity } = config;

    const baseFontSize = Math.max(16, Math.min(30, fontSize));

    // Letter spacing: 0.03em (mild) → 0.10em (severe) — clearly visible
    const letterSpacing = (0.03 + keratoSeverity * 0.014).toFixed(3);

    // Line height: 1.55 (mild) → 1.95 (severe) — noticeable gap increase
    const lineHeight = (1.55 + keratoSeverity * 0.08).toFixed(2);

    // Word spacing: 1px (mild) → 4px (severe)
    const wordSpacing = (1.0 + keratoSeverity * 0.6).toFixed(1);

    return `
      /* KeratoVision: Font Engine — Size ${baseFontSize}px, Spacing ${letterSpacing}em */

      /* Font family override */
      html body,
      html body *:not(i[class*="icon"]):not(span[class*="icon"]):not([class*="fa-"]):not([class*="material-icon"]) {
        font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      }

      /* Font size — body text */
      html body p,
      html body span,
      html body a,
      html body li,
      html body td,
      html body th,
      html body label,
      html body div,
      html body input,
      html body textarea,
      html body select,
      html body button {
        font-size: ${baseFontSize}px !important;
      }

      /* Headings — scaled proportionally */
      html body h1 { font-size: ${Math.round(baseFontSize * 2.0)}px !important; }
      html body h2 { font-size: ${Math.round(baseFontSize * 1.65)}px !important; }
      html body h3 { font-size: ${Math.round(baseFontSize * 1.4)}px !important; }
      html body h4 { font-size: ${Math.round(baseFontSize * 1.2)}px !important; }
      html body h5 { font-size: ${Math.round(baseFontSize * 1.1)}px !important; }
      html body h6 { font-size: ${baseFontSize}px !important; }

      /* Spacing — applied broadly for visible effect */
      html body,
      html body p,
      html body span,
      html body li,
      html body td,
      html body th,
      html body label,
      html body a,
      html body div,
      html body h1, html body h2, html body h3,
      html body h4, html body h5, html body h6 {
        letter-spacing: ${letterSpacing}em !important;
        line-height: ${lineHeight} !important;
        word-spacing: ${wordSpacing}px !important;
      }

      /* Font weight — medium for body, semi-bold for headings */
      html body *:not(h1):not(h2):not(h3):not(b):not(strong) {
        font-weight: 400 !important;
      }

      html body h1, html body h2, html body h3,
      html body b, html body strong {
        font-weight: 500 !important;
      }

      /* Disable italic — harder to read with astigmatism */
      html body *:not(em):not(i):not(cite) {
        font-style: normal !important;
      }
    `;
  },
};
