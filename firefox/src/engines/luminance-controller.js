/**
 * LuminanceController
 *
 * Brightness and luminance management to prevent glare and bloom.
 * - Provides combined filter values (brightness + saturation)
 * - Media element dampening
 * - Wider luminance range for visible effect (0.65–1.0)
 *
 * Evidence: "Keratoconus patients experience increased glare and halos" — Mayo Clinic
 */

const LuminanceController = {
  /**
   * Get brightness/saturation filter values for html.
   * @param {import('./config-manager').AdaptiveConfig} config
   * @returns {{ brightness: number, saturation: number }}
   */
  getFilterValues(config) {
    // Wider range: 0.65–1.0 (was 0.90–1.0)
    const clamp = Math.max(0.65, Math.min(1.0, config.luminanceClamp));
    // Saturation: 0.70–1.0 based on severity
    const saturation = Math.max(0.70, 1.0 - config.keratoSeverity * 0.06);
    return { brightness: clamp, saturation };
  },

  /**
   * Generate CSS rules for luminance control.
   * @param {import('./config-manager').AdaptiveConfig} config
   * @returns {string} CSS string
   */
  generate(config) {
    const { luminanceClamp, keratoSeverity } = config;
    const clamp = Math.max(0.65, Math.min(1.0, luminanceClamp));

    // Media dampening — images/videos dimmed more than page
    const mediaDampening = Math.max(0.60, clamp - keratoSeverity * 0.04).toFixed(3);
    const brightness = clamp.toFixed(3);

    return `
      /* KeratoVision: Luminance Controller — Brightness ${brightness} */

      /* Media element dampening */
      html body img,
      html body video,
      html body canvas,
      html body svg,
      html body picture {
        filter: brightness(${mediaDampening}) !important;
      }

      /* Background image dampening */
      html body [style*="background-image"],
      html body [style*="background: url"] {
        filter: brightness(${mediaDampening}) !important;
      }

      /* Bright inline style taming */
      html body [style*="background-color: #fff"],
      html body [style*="background-color: #FFF"],
      html body [style*="background-color: white"],
      html body [style*="background-color: rgb(255"],
      html body [style*="background: #fff"],
      html body [style*="background: #FFF"],
      html body [style*="background: white"] {
        filter: brightness(${brightness}) !important;
      }

      /* Scrollbar */
      ::-webkit-scrollbar-track {
        background: rgba(180, 180, 190, 0.25) !important;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(90, 90, 110, 0.5) !important;
      }
    `;
  },
};
