/**
 * ReadingGuide
 *
 * Mouse-following reading line overlay to help users track lines of text.
 *
 * Evidence: "Vision rehabilitation services help individuals optimize
 * remaining vision and use adaptive equipment" — AAO, Optometry Times
 *
 * Keratoconus and astigmatism cause distortion that makes line-tracking
 * difficult. This overlay highlights the current reading line and
 * dims surrounding areas, reducing visual confusion.
 *
 * Unlike other engines, this module injects both CSS AND a DOM element
 * (an overlay div that follows the mouse Y position). The overlay is
 * a transparent strip with darkened regions above and below.
 */

const GUIDE_ID = 'keratovision-reading-guide';
const GUIDE_ACTIVE_CLASS = 'kv-guide-active';

const ReadingGuide = {
    /** @type {HTMLElement|null} */
    _guideEl: null,

    /** @type {((e: MouseEvent) => void)|null} */
    _moveHandler: null,

    /**
     * Generate CSS rules for the reading guide.
     * @param {import('./config-manager').AdaptiveConfig} config
     * @returns {string} CSS string
     */
    generate(config) {
        if (!config.readingGuide) {
            return '/* KeratoVision: Reading Guide — disabled */';
        }

        // Guide strip height scales with font size
        const stripHeight = Math.max(32, config.fontSize * 2.2);

        return `
      /* KeratoVision: Reading Guide Overlay */
      #${GUIDE_ID} {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 2147483646 !important;
        transition: none !important;
      }

      #${GUIDE_ID} .kv-guide-top,
      #${GUIDE_ID} .kv-guide-bottom {
        position: absolute !important;
        left: 0 !important;
        width: 100% !important;
        background: rgba(0, 0, 0, 0.35) !important;
        transition: height 0.05s linear !important;
        pointer-events: none !important;
      }

      #${GUIDE_ID} .kv-guide-top {
        top: 0 !important;
      }

      #${GUIDE_ID} .kv-guide-bottom {
        bottom: 0 !important;
      }

      #${GUIDE_ID} .kv-guide-strip {
        position: absolute !important;
        left: 0 !important;
        width: 100% !important;
        height: ${stripHeight}px !important;
        border-top: 1.5px solid rgba(108, 99, 255, 0.4) !important;
        border-bottom: 1.5px solid rgba(108, 99, 255, 0.4) !important;
        background: transparent !important;
        pointer-events: none !important;
        transition: top 0.05s linear !important;
      }
    `;
    },

    /**
     * Activate the reading guide DOM overlay.
     * @param {import('./config-manager').AdaptiveConfig} config
     */
    activate(config) {
        if (!config.readingGuide) {
            ReadingGuide.deactivate();
            return;
        }

        // Create guide element if it doesn't exist
        if (!ReadingGuide._guideEl) {
            const guide = document.createElement('div');
            guide.id = GUIDE_ID;
            guide.innerHTML = `
                <div class="kv-guide-top"></div>
                <div class="kv-guide-strip"></div>
                <div class="kv-guide-bottom"></div>
            `;
            document.body.appendChild(guide);
            ReadingGuide._guideEl = guide;
        }

        const stripHeight = Math.max(32, config.fontSize * 2.2);
        const halfStrip = stripHeight / 2;

        // Mouse move handler
        if (ReadingGuide._moveHandler) {
            document.removeEventListener('mousemove', ReadingGuide._moveHandler);
        }

        ReadingGuide._moveHandler = (e) => {
            const guide = ReadingGuide._guideEl;
            if (!guide) return;

            const y = e.clientY;
            const vh = window.innerHeight;

            const topEl = guide.querySelector('.kv-guide-top');
            const stripEl = guide.querySelector('.kv-guide-strip');
            const bottomEl = guide.querySelector('.kv-guide-bottom');

            const topHeight = Math.max(0, y - halfStrip);
            const bottomHeight = Math.max(0, vh - y - halfStrip);

            topEl.style.height = `${topHeight}px`;
            stripEl.style.top = `${topHeight}px`;
            bottomEl.style.height = `${bottomHeight}px`;
        };

        document.addEventListener('mousemove', ReadingGuide._moveHandler, { passive: true });
    },

    /**
     * Remove the reading guide DOM overlay.
     */
    deactivate() {
        if (ReadingGuide._moveHandler) {
            document.removeEventListener('mousemove', ReadingGuide._moveHandler);
            ReadingGuide._moveHandler = null;
        }

        if (ReadingGuide._guideEl) {
            ReadingGuide._guideEl.remove();
            ReadingGuide._guideEl = null;
        }
    },
};
