/**
 * ShadowVectorCalculator
 *
 * Axis-based directional shadow compensation for astigmatism.
 * - Converts astigmatAxis (0–180°) to a directional offset vector
 * - Generates text-shadow CSS with intensity proportional to astigmatPower
 * - Multi-layer shadows for edge stabilization
 * - Values tuned to be clearly visible for user feedback
 */

const ShadowVectorCalculator = {
  /**
   * Calculate the compensation shadow vector from astigmat axis.
   * The shadow is placed OPPOSITE to the axis of distortion
   * to counteract perceived ghosting.
   *
   * @param {number} axisDeg - Astigmat axis in degrees (0–180)
   * @param {number} power   - Astigmat power (0–6 diopters)
   * @returns {{ x: number, y: number, blur: number, opacity: number }}
   */
  calculateVector(axisDeg, power) {
    const axis = ((axisDeg % 180) + 180) % 180;
    const radians = ((axis + 90) * Math.PI) / 180;

    // Shadow distance: power 1.0 → 0.8px, power 3.0 → 2.4px, power 6.0 → 4.8px
    const distance = power * 0.8;

    const x = parseFloat((Math.cos(radians) * distance).toFixed(2));
    const y = parseFloat((Math.sin(radians) * distance).toFixed(2));

    // Blur: proportional to distance
    const blur = parseFloat((distance * 0.6).toFixed(2));

    // Opacity: clearly visible — 0.15 at power 1, up to 0.5 at power 6
    const opacity = parseFloat((Math.min(0.5, 0.08 + power * 0.07)).toFixed(3));

    return { x, y, blur, opacity };
  },

  /**
   * Generate CSS rules for shadow compensation.
   * @param {import('./config-manager').AdaptiveConfig} config
   * @returns {string} CSS string
   */
  generate(config) {
    const { astigmatAxis, astigmatPower } = config;

    if (astigmatPower <= 0) return '/* KeratoVision: Shadow — disabled (power=0) */';

    const { x, y, blur, opacity } = ShadowVectorCalculator.calculateVector(
      astigmatAxis,
      astigmatPower
    );

    // Layer 2: perpendicular stabilizer at reduced intensity
    const perpX = parseFloat((-y * 0.4).toFixed(2));
    const perpY = parseFloat((x * 0.4).toFixed(2));
    const perpBlur = parseFloat((blur * 0.5).toFixed(2));
    const perpOpacity = parseFloat((opacity * 0.5).toFixed(3));

    // Layer 3: opposite direction micro-shadow for balance
    const antiX = parseFloat((-x * 0.2).toFixed(2));
    const antiY = parseFloat((-y * 0.2).toFixed(2));
    const antiBlur = parseFloat((blur * 0.3).toFixed(2));
    const antiOpacity = parseFloat((opacity * 0.25).toFixed(3));

    return `
      /* KeratoVision: Shadow Vector Compensation */
      /* Axis: ${astigmatAxis}° | Power: ${astigmatPower}D */
      /* Offset: ${x}px, ${y}px | Blur: ${blur}px | Opacity: ${opacity} */

      html body p,
      html body span,
      html body a,
      html body li,
      html body td,
      html body th,
      html body label,
      html body div,
      html body h1, html body h2, html body h3,
      html body h4, html body h5, html body h6,
      html body button,
      html body input,
      html body textarea {
        text-shadow:
          ${x}px ${y}px ${blur}px rgba(0, 0, 0, ${opacity}),
          ${perpX}px ${perpY}px ${perpBlur}px rgba(0, 0, 0, ${perpOpacity}),
          ${antiX}px ${antiY}px ${antiBlur}px rgba(0, 0, 0, ${antiOpacity}) !important;
      }
    `;
  },
};
