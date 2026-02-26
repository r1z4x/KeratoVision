/**
 * ComaCompensator
 *
 * Coma aberration is the DOMINANT higher-order aberration in keratoconus,
 * causing images to develop a "comet-like tail" in one direction.
 * HOAs are 5-6× greater than in healthy eyes (ARVO Journals, NIH).
 *
 * This engine generates directional text-shadow compensation opposite
 * to the coma direction, with multi-layer shadows that progressively
 * fade to counteract the tail effect.
 *
 * Unlike astigmatism (which is axis-symmetric), coma is directional
 * across the full 360° range.
 */

const ComaCompensator = {
    /**
     * Calculate coma compensation vectors.
     * Coma creates a fan-shaped light spread — we counteract with
     * multiple shadow layers in the opposite direction.
     *
     * @param {number} angleDeg - Coma direction in degrees (0–360)
     * @param {number} intensity - Coma severity (0–5)
     * @returns {Array<{x: number, y: number, blur: number, opacity: number}>}
     */
    calculateLayers(angleDeg, intensity) {
        if (intensity <= 0) return [];

        // Reverse direction for compensation
        const reverseRad = ((angleDeg + 180) * Math.PI) / 180;

        const layers = [];
        const layerCount = 4; // Multiple layers simulate the coma tail

        for (let i = 1; i <= layerCount; i++) {
            // Each layer is further from center, with decreasing opacity
            const factor = i / layerCount;
            const distance = intensity * 0.5 * factor; // max ~2.5px at intensity 5

            layers.push({
                x: parseFloat((Math.cos(reverseRad) * distance).toFixed(2)),
                y: parseFloat((Math.sin(reverseRad) * distance).toFixed(2)),
                blur: parseFloat((distance * 0.7 + 0.2).toFixed(2)),
                opacity: parseFloat((0.15 * (1 - factor * 0.6) * (intensity / 5)).toFixed(3)),
            });
        }

        return layers;
    },

    /**
     * Generate CSS rules for coma aberration compensation.
     * @param {import('./config-manager').AdaptiveConfig} config
     * @returns {string} CSS string
     */
    generate(config) {
        const { comaAngle, comaIntensity, keratoSeverity } = config;

        // Auto-estimate coma from keratoSeverity if comaIntensity not explicitly set
        const effectiveIntensity = comaIntensity > 0
            ? comaIntensity
            : keratoSeverity * 0.6; // Keratoconus correlates with coma

        if (effectiveIntensity <= 0) {
            return '/* KeratoVision: Coma — disabled (intensity=0) */';
        }

        const layers = ComaCompensator.calculateLayers(comaAngle, effectiveIntensity);

        if (layers.length === 0) {
            return '/* KeratoVision: Coma — no layers generated */';
        }

        // Build multi-layer text-shadow
        const shadowParts = layers.map(
            (l) => `${l.x}px ${l.y}px ${l.blur}px rgba(0, 0, 0, ${l.opacity})`
        );

        return `
      /* KeratoVision: Coma Aberration Compensation */
      /* Angle: ${comaAngle}° | Intensity: ${effectiveIntensity.toFixed(1)} */

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
      html body button {
        text-shadow: ${shadowParts.join(',\n          ')} !important;
      }
    `;
    },
};
