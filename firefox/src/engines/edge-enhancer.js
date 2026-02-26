/**
 * EdgeEnhancer
 *
 * Gabor-patch-inspired text edge enhancement.
 * Applies text-stroke for clear character edges + chromatic aberration masking.
 *
 * Evidence: "Gabor Patches improve CS and VA in keratoconus" — RevitalVision, NIH
 *
 * Stroke width scaled for VISIBLE effect across all severity levels.
 */

const EdgeEnhancer = {
  /**
   * Generate CSS rules for edge enhancement.
   * @param {import('./config-manager').AdaptiveConfig} config
   * @returns {string} CSS string
   */
  generate(config) {
    if (!config.edgeEnhancement) {
      return '/* KeratoVision: Edge Enhancement — disabled */';
    }

    const { keratoSeverity, chromaticCorrection } = config;

    // Stroke width: 0.3px (min) → 1.0px (max severity) — clearly visible
    const strokeWidth = (0.3 + keratoSeverity * 0.14).toFixed(2);

    // Neutral dark stroke — prevents chromatic fringing at edges
    const strokeColor = chromaticCorrection
      ? 'rgba(25, 25, 45, 0.65)'
      : 'rgba(0, 0, 0, 0.35)';

    const chromaticCSS = chromaticCorrection ? `
      /* Chromatic Aberration Reduction — anti-aliasing + subpixel rendering */
      html body p,
      html body span,
      html body a,
      html body li,
      html body h1, html body h2, html body h3,
      html body h4, html body h5, html body h6 {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
      }
    ` : '';

    return `
      /* KeratoVision: Edge Enhancement — Stroke ${strokeWidth}px */

      html body p,
      html body span,
      html body a,
      html body li,
      html body td,
      html body th,
      html body label,
      html body div,
      html body button,
      html body input,
      html body textarea,
      html body h1, html body h2, html body h3,
      html body h4, html body h5, html body h6 {
        -webkit-text-stroke: ${strokeWidth}px ${strokeColor} !important;
        paint-order: stroke fill !important;
      }

      ${chromaticCSS}
    `;
  },
};
