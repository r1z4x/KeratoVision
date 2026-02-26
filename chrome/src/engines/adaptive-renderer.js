/**
 * AdaptiveRenderer
 *
 * Orchestrator module that coordinates all engine modules and manages
 * the injected <style> element(s) in the page.
 *
 * - Combines html-level filters from ContrastEngine + LuminanceController into ONE rule
 * - Handles polarity reversal filter separately (it uses invert+hue-rotate)
 * - Collects CSS output from each engine
 * - Manages ReadingGuide DOM overlay
 * - Supports apply, remove, and update operations
 * - Wrapped in PerformanceGuard for safety
 *
 * Engine execution order matters:
 * 1. PolarityEngine (invert mode — must come before other filters)
 * 2. Combined HTML filter (contrast + brightness + saturation)
 * 3. ContrastEngine (text/bg color overrides)
 * 4. ShadowVectorCalculator (astigmat shadows)
 * 5. ComaCompensator (coma shadows — merged with astigmat)
 * 6. FontEngine (typography)
 * 7. LuminanceController (media dampening)
 * 8. EdgeEnhancer (text-stroke + chromatic)
 * 9. ReadingGuide (overlay CSS + DOM)
 */

const STYLE_ID = 'keratovision-adaptive';

const AdaptiveRenderer = {
    /**
     * Build the combined html filter rule.
     * When polarity is reversed, use invert+hue-rotate instead.
     * Otherwise combine contrast + brightness + saturation.
     * @param {import('./config-manager').AdaptiveConfig} config
     * @returns {string} CSS string
     */
    buildHtmlFilter(config) {
        // If polarity is reversed, PolarityEngine handles the html filter
        if (config.polarityReversed) {
            return '/* HTML filter handled by PolarityEngine */';
        }

        const contrastValue = ContrastEngine.getContrastValue(config);
        const { brightness, saturation } = LuminanceController.getFilterValues(config);

        return `
      /* KeratoVision: Combined HTML Filter */
      html {
        filter: contrast(${contrastValue.toFixed(3)}) brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)}) !important;
      }
    `;
    },

    /**
     * Merge astigmat and coma text-shadows into a single rule.
     * Both engines target the same elements, so we combine their shadows.
     * @param {import('./config-manager').AdaptiveConfig} config
     * @returns {string} CSS string
     */
    buildCombinedShadows(config) {
        // Collect individual shadow parts
        const shadows = [];

        // Astigmat shadows
        if (config.astigmatPower > 0) {
            const { x, y, blur, opacity } = ShadowVectorCalculator.calculateVector(
                config.astigmatAxis,
                config.astigmatPower
            );
            // Primary
            shadows.push(`${x}px ${y}px ${blur}px rgba(0, 0, 0, ${opacity})`);
            // Perpendicular stabilizer
            const perpX = parseFloat((-y * 0.4).toFixed(2));
            const perpY = parseFloat((x * 0.4).toFixed(2));
            const perpBlur = parseFloat((blur * 0.5).toFixed(2));
            const perpOpacity = parseFloat((opacity * 0.5).toFixed(3));
            shadows.push(`${perpX}px ${perpY}px ${perpBlur}px rgba(0, 0, 0, ${perpOpacity})`);
        }

        // Coma shadows
        const comaIntensity = config.comaIntensity > 0
            ? config.comaIntensity
            : config.keratoSeverity * 0.6;

        if (comaIntensity > 0) {
            const layers = ComaCompensator.calculateLayers(config.comaAngle, comaIntensity);
            for (const l of layers) {
                shadows.push(`${l.x}px ${l.y}px ${l.blur}px rgba(0, 0, 0, ${l.opacity})`);
            }
        }

        if (shadows.length === 0) {
            return '/* KeratoVision: No shadow compensation active */';
        }

        return `
      /* KeratoVision: Combined Shadow Compensation */
      /* Astigmat: Axis ${config.astigmatAxis}° Power ${config.astigmatPower}D */
      /* Coma: Angle ${config.comaAngle}° Intensity ${comaIntensity.toFixed(1)} */

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
        text-shadow: ${shadows.join(',\n          ')} !important;
      }
    `;
    },

    /**
     * Apply all adaptive CSS based on the given config.
     * @param {import('./config-manager').AdaptiveConfig} config
     */
    apply(config) {
        if (!config.enabled) {
            AdaptiveRenderer.remove();
            return;
        }

        PerformanceGuard.guard('AdaptiveRenderer.apply', () => {
            const cssBlocks = [
                // Polarity (must be first — it inverts everything)
                PolarityEngine.generate(config),
                // Combined HTML filter (only when polarity is off)
                AdaptiveRenderer.buildHtmlFilter(config),
                // Color overrides
                ContrastEngine.generate(config),
                // Combined text shadows (astigmat + coma)
                AdaptiveRenderer.buildCombinedShadows(config),
                // Typography
                FontEngine.generate(config),
                // Media luminance
                LuminanceController.generate(config),
                // Edge enhancement + chromatic correction
                EdgeEnhancer.generate(config),
                // Reading guide CSS
                ReadingGuide.generate(config),
            ];

            const fullCSS = cssBlocks.join('\n');

            // Find or create the style element
            let styleEl = document.getElementById(STYLE_ID);
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = STYLE_ID;
                styleEl.setAttribute('data-keratovision', 'true');
                document.head.appendChild(styleEl);
            }

            styleEl.textContent = fullCSS;

            // Manage reading guide DOM
            ReadingGuide.activate(config);
        });
    },

    /**
     * Remove all injected styles and overlays.
     */
    remove() {
        const styleEl = document.getElementById(STYLE_ID);
        if (styleEl) {
            styleEl.remove();
        }
        ReadingGuide.deactivate();
    },

    /**
     * Check if the adaptive styles are currently applied.
     * @returns {boolean}
     */
    isActive() {
        return !!document.getElementById(STYLE_ID);
    },
};
