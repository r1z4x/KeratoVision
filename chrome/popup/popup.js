/**
 * KeratoVision Popup Script v2.3 — Inline Calibration
 */

(function () {
    'use strict';

    // =============================================
    //  CONSTANTS
    // =============================================
    const DEFAULT_CONFIG = {
        astigmatAxis: 90,
        astigmatPower: 1.5,
        keratoSeverity: 2,
        fontSize: 18,
        luminanceClamp: 0.95,
        enabled: true,
        polarityReversed: false,
        edgeEnhancement: true,
        readingGuide: false,
        comaAngle: 0,
        comaIntensity: 0,
        chromaticCorrection: true,
    };

    const CONTENT_SCRIPTS = [
        'src/engines/config-manager.js',
        'src/engines/performance-guard.js',
        'src/engines/contrast-engine.js',
        'src/engines/shadow-vector-calculator.js',
        'src/engines/font-engine.js',
        'src/engines/luminance-controller.js',
        'src/engines/coma-compensator.js',
        'src/engines/polarity-engine.js',
        'src/engines/edge-enhancer.js',
        'src/engines/reading-guide.js',
        'src/engines/adaptive-renderer.js',
        'src/content.js',
    ];

    let currentConfig = { ...DEFAULT_CONFIG };
    let saveTimer = null;
    let activeTabId = null;

    const SLIDER_MAP = {
        astigmatAxis: { valueEl: 'axisValue', format: (v) => `${v}°` },
        astigmatPower: { valueEl: 'powerValue', format: (v) => `${parseFloat(v).toFixed(2)} D` },
        keratoSeverity: { valueEl: 'severityValue', format: (v) => `${parseFloat(v).toFixed(1)}` },
        fontSize: { valueEl: 'fontSizeValue', format: (v) => `${v}px` },
        luminanceClamp: { valueEl: 'luminanceValue', format: (v) => `${parseFloat(v).toFixed(2)}` },
        comaAngle: { valueEl: 'comaAngleValue', format: (v) => `${v}°` },
        comaIntensity: { valueEl: 'comaIntensityValue', format: (v) => parseFloat(v) === 0 ? I18N.t('auto') : `${parseFloat(v).toFixed(1)}` },
    };

    const TOGGLE_MAP = ['polarityReversed', 'edgeEnhancement', 'chromaticCorrection', 'readingGuide'];

    // =============================================
    //  DOM REFS
    // =============================================
    const enabledToggle = document.getElementById('enabledToggle');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const resetBtn = document.getElementById('resetBtn');
    const langSelect = document.getElementById('langSelect');

    const viewSettings = document.getElementById('viewSettings');
    const viewCalibration = document.getElementById('viewCalibration');

    // =============================================
    //  i18n
    // =============================================
    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = I18N.t(el.getAttribute('data-i18n'));
        });
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            el.innerHTML = I18N.t(el.getAttribute('data-i18n-html'));
        });
        document.querySelectorAll('[data-i18n-param]').forEach((el) => {
            el.textContent = I18N.t(el.getAttribute('data-i18n-param'), el.getAttribute('data-param') || '');
        });
        statusText.textContent = currentConfig.enabled ? I18N.t('active') : I18N.t('disabled');
    }

    // =============================================
    //  VISUAL FEEDBACK
    // =============================================
    function flashStatus(msg, color) {
        statusText.textContent = msg;
        statusText.style.color = color || '#48CFCB';
        setTimeout(() => {
            statusText.style.color = '';
            statusText.textContent = currentConfig.enabled ? I18N.t('active') : I18N.t('disabled');
        }, 800);
    }

    // =============================================
    //  HELPERS
    // =============================================
    function updateSliderDisplay(key, value) {
        const info = SLIDER_MAP[key];
        if (!info) return;
        const el = document.getElementById(info.valueEl);
        if (el) el.textContent = info.format(value);
    }

    function updateSliderTrack(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.background = `linear-gradient(to right, #6C63FF 0%, #48CFCB ${pct}%, #2a2a40 ${pct}%)`;
    }

    function setEnabledState(enabled) {
        if (enabled) {
            document.body.classList.remove('disabled');
            statusDot.classList.add('active');
            statusText.textContent = I18N.t('active');
        } else {
            document.body.classList.add('disabled');
            statusDot.classList.remove('active');
            statusText.textContent = I18N.t('disabled');
        }
    }

    // =============================================
    //  CONTENT SCRIPT INJECTION
    // =============================================
    async function ensureContentScripts(tabId) {
        try {
            const response = await new Promise((resolve) => {
                chrome.tabs.sendMessage(tabId, { type: 'GET_STATUS' }, (res) => {
                    if (chrome.runtime.lastError) resolve(null);
                    else resolve(res);
                });
            });
            if (response && response.version) return true;

            await chrome.scripting.executeScript({
                target: { tabId },
                files: CONTENT_SCRIPTS,
            });
            await new Promise((r) => setTimeout(r, 200));
            return true;
        } catch (err) {
            console.warn('[KeratoVision] Cannot inject:', err.message);
            return false;
        }
    }

    // =============================================
    //  PUSH CONFIG
    // =============================================
    function pushUpdate() {
        if (activeTabId) {
            chrome.tabs.sendMessage(
                activeTabId,
                { type: 'LIVE_UPDATE', config: { ...currentConfig } },
                (res) => {
                    if (chrome.runtime.lastError) {
                        ensureContentScripts(activeTabId).then(() => {
                            chrome.tabs.sendMessage(activeTabId,
                                { type: 'LIVE_UPDATE', config: { ...currentConfig } },
                                () => { if (chrome.runtime.lastError) { /* ok */ } });
                        });
                    }
                }
            );
        }
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => chrome.storage.sync.set({ ...currentConfig }), 50);
    }

    function populateUI(config) {
        currentConfig = { ...config };
        enabledToggle.checked = config.enabled;
        setEnabledState(config.enabled);

        for (const key of Object.keys(SLIDER_MAP)) {
            const slider = document.getElementById(key);
            if (slider && config[key] !== undefined) {
                slider.value = config[key];
                updateSliderDisplay(key, config[key]);
                updateSliderTrack(slider);
            }
        }
        for (const key of TOGGLE_MAP) {
            const el = document.getElementById(key);
            if (el) el.checked = !!config[key];
        }
    }

    // =============================================
    //  INIT
    // =============================================
    async function init() {
        await I18N.loadLang();
        langSelect.value = I18N.getLang();
        applyTranslations();

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
            activeTabId = tabs[0].id;
            await ensureContentScripts(activeTabId);
        }

        chrome.storage.sync.get(DEFAULT_CONFIG, (config) => {
            populateUI(config);
            if (activeTabId) pushUpdate();
        });
    }

    init();

    // =============================================
    //  SETTINGS EVENT LISTENERS
    // =============================================
    langSelect.addEventListener('change', () => {
        I18N.setLang(langSelect.value);
        applyTranslations();
    });

    enabledToggle.addEventListener('change', () => {
        currentConfig.enabled = enabledToggle.checked;
        setEnabledState(currentConfig.enabled);
        pushUpdate();
        flashStatus(currentConfig.enabled ? '✓ ON' : '✗ OFF',
            currentConfig.enabled ? '#48CFCB' : '#ff6b6b');
    });

    for (const key of Object.keys(SLIDER_MAP)) {
        const slider = document.getElementById(key);
        if (!slider) continue;
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            currentConfig[key] = value;
            updateSliderDisplay(key, value);
            updateSliderTrack(slider);
            pushUpdate();
        });
    }

    for (const key of TOGGLE_MAP) {
        const el = document.getElementById(key);
        if (!el) continue;
        el.addEventListener('change', () => {
            currentConfig[key] = el.checked;
            pushUpdate();
            const label = el.closest('.toggle-row')?.querySelector('.toggle-label')?.textContent || key;
            flashStatus(`✓ ${label}: ${el.checked ? 'ON' : 'OFF'}`, '#48CFCB');
        });
    }

    resetBtn.addEventListener('click', () => {
        currentConfig = { ...DEFAULT_CONFIG };
        populateUI(DEFAULT_CONFIG);
        pushUpdate();
        flashStatus('✓ Reset', '#48CFCB');
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        chrome.storage.sync.get(DEFAULT_CONFIG, (config) => populateUI(config));
    });

    // =============================================
    //  VIEW SWITCHING
    // =============================================
    function showCalibration() {
        viewSettings.classList.add('hidden');
        viewCalibration.classList.remove('hidden');
        document.body.classList.add('cal-mode');
        calGoToStep(0);
        applyTranslations();
    }

    function showSettings() {
        viewCalibration.classList.add('hidden');
        viewSettings.classList.remove('hidden');
        document.body.classList.remove('cal-mode');
    }

    document.getElementById('calibrateBtn').addEventListener('click', showCalibration);
    document.getElementById('calBackToSettings').addEventListener('click', showSettings);

    // =============================================
    //  CALIBRATION WIZARD
    // =============================================
    const CAL_TOTAL = 7;
    let calStep = 0;

    const cal = {
        rxPower: 1.75, rxAxis: 90, keratoLevel: 2,
        contrastChoice: 3, axisChoice: 90,
        fontSize: 20, brightness: 95,
        edgeEnhancement: true, readingGuide: false, chromaticCorrection: true,
    };

    const calSteps = document.querySelectorAll('.cal-step');
    const calNextBtn = document.getElementById('calNextBtn');
    const calPrevBtn = document.getElementById('calPrevBtn');
    const calProgressFill = document.getElementById('calProgressFill');
    const calStepIndicator = document.getElementById('calStepIndicator');

    function calGoToStep(idx) {
        calStep = Math.max(0, Math.min(CAL_TOTAL - 1, idx));
        calSteps.forEach((s, i) => s.classList.toggle('active', i === calStep));
        calPrevBtn.disabled = calStep === 0;
        calNextBtn.textContent = calStep === CAL_TOTAL - 1 ? I18N.t('complete') : I18N.t('next');
        calProgressFill.style.width = `${((calStep + 1) / CAL_TOTAL * 100).toFixed(0)}%`;
        calStepIndicator.textContent = I18N.t('stepOf', calStep + 1, CAL_TOTAL);

        if (calStep === 2) calSetupAxis();
        if (calStep === 4) calSetupBrightness();
        if (calStep === 6) calShowResults();
    }

    calNextBtn.addEventListener('click', () => {
        calCollect(calStep);
        if (calStep < CAL_TOTAL - 1) calGoToStep(calStep + 1);
    });
    calPrevBtn.addEventListener('click', () => calGoToStep(calStep - 1));

    // --- Data collection ---
    function calCollect(step) {
        switch (step) {
            case 0:
                cal.rxPower = parseFloat(document.getElementById('rxPower').value) || 1.75;
                cal.rxAxis = parseInt(document.getElementById('rxAxis').value) || 90;
                const kr = document.querySelector('input[name="kerato"]:checked');
                cal.keratoLevel = kr ? parseInt(kr.value) : 2;
                break;
            case 1:
                const sc = document.querySelector('#calContrastCards .cal-card.selected');
                if (sc) cal.contrastChoice = parseInt(sc.dataset.value);
                break;
            case 2:
                cal.axisChoice = parseInt(document.getElementById('calAxisSlider').value);
                break;
            case 3:
                const sf = document.querySelector('#calFontGrid .cal-font-card.selected');
                if (sf) cal.fontSize = parseInt(sf.dataset.size);
                break;
            case 4:
                cal.brightness = parseInt(document.getElementById('calBrightSlider').value);
                break;
            case 5:
                document.querySelectorAll('.cal-compare-pair').forEach(pair => {
                    const sel = pair.querySelector('.cal-compare-card.selected');
                    if (sel) cal[sel.dataset.feature] = sel.dataset.val === 'true';
                });
                break;
        }
    }

    // --- Card clicks ---
    document.querySelectorAll('#calContrastCards .cal-card').forEach(c => {
        c.addEventListener('click', () => {
            document.querySelectorAll('#calContrastCards .cal-card').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
        });
    });
    document.querySelectorAll('#calFontGrid .cal-font-card').forEach(c => {
        c.addEventListener('click', () => {
            document.querySelectorAll('#calFontGrid .cal-font-card').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
        });
    });
    document.querySelectorAll('.cal-compare-pair').forEach(pair => {
        pair.querySelectorAll('.cal-compare-card').forEach(card => {
            card.addEventListener('click', () => {
                pair.querySelectorAll('.cal-compare-card').forEach(x => x.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    });

    // --- Axis test ---
    function calSetupAxis() {
        const slider = document.getElementById('calAxisSlider');
        const display = document.getElementById('calAxisValue');
        slider.value = cal.rxAxis;
        update();
        slider.removeEventListener('input', update);
        slider.addEventListener('input', update);

        function update() {
            const axis = parseInt(slider.value);
            display.textContent = `${axis}°`;
            const rad = ((axis + 90) * Math.PI) / 180;
            const power = cal.rxPower;
            const dist = power * 2.0;
            const x = (Math.cos(rad) * dist).toFixed(2);
            const y = (Math.sin(rad) * dist).toFixed(2);
            const blur = (dist * 0.8).toFixed(2);
            const opacity = Math.min(0.7, 0.15 + power * 0.12).toFixed(3);
            document.querySelector('.cal-axis-text').style.textShadow =
                `${x}px ${y}px ${blur}px rgba(0,0,0,${opacity}), ${(-y * 0.5).toFixed(2)}px ${(x * 0.5).toFixed(2)}px ${(blur * 0.6).toFixed(2)}px rgba(0,0,0,${(opacity * 0.5).toFixed(3)})`;
            const pct = (axis / 180) * 100;
            slider.style.background = `linear-gradient(to right, #6C63FF 0%, #48CFCB ${pct}%, #2a2a40 ${pct}%)`;
        }
    }

    // --- Brightness test ---
    function calSetupBrightness() {
        const slider = document.getElementById('calBrightSlider');
        const display = document.getElementById('calBrightValue');
        slider.value = cal.brightness;
        update();
        slider.removeEventListener('input', update);
        slider.addEventListener('input', update);

        function update() {
            const val = parseInt(slider.value);
            display.textContent = `${val}%`;
            document.getElementById('calBrightPreview').style.filter = `brightness(${val / 100})`;
            const pct = ((val - 65) / 35) * 100;
            slider.style.background = `linear-gradient(to right, #6C63FF 0%, #48CFCB ${pct}%, #2a2a40 ${pct}%)`;
        }
    }

    // --- Results ---
    function calComputeConfig() {
        const keratoMap = [0, 1.5, 2.5, 3.5, 4.5];
        const config = {
            enabled: true,
            astigmatAxis: cal.axisChoice,
            astigmatPower: cal.rxPower,
            fontSize: cal.fontSize,
            luminanceClamp: cal.brightness / 100,
            edgeEnhancement: cal.edgeEnhancement,
            readingGuide: cal.readingGuide,
            chromaticCorrection: cal.chromaticCorrection,
            comaAngle: 0, comaIntensity: 0,
            keratoSeverity: keratoMap[cal.keratoLevel] || 2,
            polarityReversed: cal.contrastChoice === 4,
        };
        if (cal.contrastChoice !== 4) {
            config.keratoSeverity = Math.max(config.keratoSeverity, cal.contrastChoice * 1.2);
        }
        return config;
    }

    function calShowResults() {
        calCollect(5);
        const config = calComputeConfig();
        const grid = document.getElementById('calResults');

        const items = [
            { l: I18N.t('resultAxis'), v: `${config.astigmatAxis}°` },
            { l: I18N.t('resultPower'), v: `${config.astigmatPower} D` },
            { l: I18N.t('resultSeverity'), v: config.keratoSeverity.toFixed(1) },
            { l: I18N.t('resultFont'), v: `${config.fontSize}px` },
            { l: I18N.t('resultBright'), v: `${Math.round(config.luminanceClamp * 100)}%` },
            { l: I18N.t('resultPolarity'), v: config.polarityReversed ? '✅' : '❌' },
            { l: I18N.t('resultEdge'), v: config.edgeEnhancement ? '✅' : '❌' },
            { l: I18N.t('resultGuide'), v: config.readingGuide ? '✅' : '❌' },
            { l: I18N.t('resultChrom'), v: config.chromaticCorrection ? '✅' : '❌' },
            { l: I18N.t('resultComa'), v: I18N.t('automatic') },
        ];

        grid.innerHTML = items.map(i => `
            <div class="cal-result-item">
                <div class="cal-result-label">${i.l}</div>
                <div class="cal-result-val">${i.v}</div>
            </div>
        `).join('');

        document.getElementById('calApplyBtn').onclick = () => {
            currentConfig = { ...config };
            populateUI(config);
            pushUpdate();
            const btn = document.getElementById('calApplyBtn');
            btn.textContent = I18N.t('applied');
            btn.style.background = 'linear-gradient(135deg, #00e676, #48CFCB)';
            setTimeout(() => {
                showSettings();
                btn.textContent = I18N.t('applySettings');
                btn.style.background = '';
            }, 1200);
        };
    }
})();
