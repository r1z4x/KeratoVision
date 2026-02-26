/**
 * KeratoVision Calibration Engine — i18n Support
 */
(function () {
    'use strict';

    const TOTAL_STEPS = 7;
    let currentStep = 0;

    const calibration = {
        rxPower: 1.75,
        rxAxis: 90,
        keratoLevel: 2,
        contrastChoice: 3,
        axisChoice: 90,
        fontSize: 20,
        brightness: 95,
        edgeEnhancement: true,
        readingGuide: false,
        chromaticCorrection: true,
    };

    const steps = document.querySelectorAll('.step');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const progressFill = document.getElementById('progressFill');
    const stepIndicator = document.getElementById('stepIndicator');

    // === i18n ===
    function applyTranslations() {
        // Standard data-i18n
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            el.textContent = I18N.t(key);
        });
        // HTML content (allows <strong> etc)
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = I18N.t(key);
        });
        // Parameterized
        document.querySelectorAll('[data-i18n-param]').forEach((el) => {
            const key = el.getAttribute('data-i18n-param');
            const param = el.getAttribute('data-param') || '';
            el.textContent = I18N.t(key, param);
        });
        // Update step indicator
        stepIndicator.textContent = I18N.t('stepOf', currentStep + 1, TOTAL_STEPS);
        // Update nav buttons
        nextBtn.textContent = currentStep === TOTAL_STEPS - 1
            ? I18N.t('complete')
            : I18N.t('next');
        backBtn.textContent = I18N.t('back');
    }

    // === Navigation ===
    function goToStep(index) {
        currentStep = Math.max(0, Math.min(TOTAL_STEPS - 1, index));

        steps.forEach((s, i) => s.classList.toggle('active', i === currentStep));
        backBtn.disabled = currentStep === 0;

        const pct = ((currentStep + 1) / TOTAL_STEPS * 100).toFixed(0);
        progressFill.style.width = `${pct}%`;

        applyTranslations();

        if (currentStep === 2) setupAxisTest();
        if (currentStep === 4) setupBrightnessTest();
        if (currentStep === 6) showResults();
    }

    nextBtn.addEventListener('click', () => {
        collectStepData(currentStep);
        if (currentStep < TOTAL_STEPS - 1) goToStep(currentStep + 1);
    });
    backBtn.addEventListener('click', () => goToStep(currentStep - 1));

    // === Data Collection ===
    function collectStepData(step) {
        switch (step) {
            case 0:
                calibration.rxPower = parseFloat(document.getElementById('rxPower').value) || 1.75;
                calibration.rxAxis = parseInt(document.getElementById('rxAxis').value) || 90;
                const kr = document.querySelector('input[name="kerato"]:checked');
                calibration.keratoLevel = kr ? parseInt(kr.value) : 2;
                break;
            case 1:
                const sc = document.querySelector('#contrastCards .test-card.selected');
                if (sc) calibration.contrastChoice = parseInt(sc.dataset.value);
                break;
            case 2:
                calibration.axisChoice = parseInt(document.getElementById('axisSlider').value);
                break;
            case 3:
                const sf = document.querySelector('#fontTestArea .font-sample.selected');
                if (sf) calibration.fontSize = parseInt(sf.dataset.size);
                break;
            case 4:
                calibration.brightness = parseInt(document.getElementById('brightnessSlider').value);
                break;
            case 5:
                document.querySelectorAll('.comparison-pair').forEach(pair => {
                    const sel = pair.querySelector('.comparison-card.selected');
                    if (sel) calibration[sel.dataset.feature] = sel.dataset.val === 'true';
                });
                break;
        }
    }

    // === Card Clicks ===
    document.querySelectorAll('#contrastCards .test-card').forEach(c => {
        c.addEventListener('click', () => {
            document.querySelectorAll('#contrastCards .test-card').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
        });
    });
    document.querySelectorAll('#fontTestArea .font-sample').forEach(c => {
        c.addEventListener('click', () => {
            document.querySelectorAll('#fontTestArea .font-sample').forEach(x => x.classList.remove('selected'));
            c.classList.add('selected');
        });
    });
    document.querySelectorAll('.comparison-pair').forEach(pair => {
        pair.querySelectorAll('.comparison-card').forEach(card => {
            card.addEventListener('click', () => {
                pair.querySelectorAll('.comparison-card').forEach(x => x.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    });

    // === Axis Test ===
    function setupAxisTest() {
        const slider = document.getElementById('axisSlider');
        const valueDisplay = document.getElementById('axisLiveValue');
        slider.value = calibration.rxAxis;
        update();
        slider.removeEventListener('input', update);
        slider.addEventListener('input', update);

        function update() {
            const axis = parseInt(slider.value);
            valueDisplay.textContent = `${axis}°`;
            const rad = ((axis + 90) * Math.PI) / 180;
            const power = calibration.rxPower;
            // Exaggerated for visual clarity in calibration
            const dist = power * 2.0;
            const x = (Math.cos(rad) * dist).toFixed(2);
            const y = (Math.sin(rad) * dist).toFixed(2);
            const blur = (dist * 0.8).toFixed(2);
            const opacity = Math.min(0.7, 0.15 + power * 0.12).toFixed(3);
            document.querySelector('.axis-sample-text').style.textShadow =
                `${x}px ${y}px ${blur}px rgba(0,0,0,${opacity}), ${(-y * 0.5).toFixed(2)}px ${(x * 0.5).toFixed(2)}px ${(blur * 0.6).toFixed(2)}px rgba(0,0,0,${(opacity * 0.5).toFixed(3)})`;
            const pct = (axis / 180) * 100;
            slider.style.background = `linear-gradient(to right, #6C63FF 0%, #48CFCB ${pct}%, #2a2a40 ${pct}%)`;
        }
    }

    // === Brightness Test ===
    function setupBrightnessTest() {
        const slider = document.getElementById('brightnessSlider');
        const valueDisplay = document.getElementById('brightnessLiveValue');
        slider.value = calibration.brightness;
        update();
        slider.removeEventListener('input', update);
        slider.addEventListener('input', update);

        function update() {
            const val = parseInt(slider.value);
            valueDisplay.textContent = `${val}%`;
            document.getElementById('brightnessPreview').style.filter = `brightness(${val / 100})`;
            const pct = ((val - 65) / 35) * 100;
            slider.style.background = `linear-gradient(to right, #6C63FF 0%, #48CFCB ${pct}%, #2a2a40 ${pct}%)`;
        }
    }

    // === Results ===
    function computeConfig() {
        const keratoMap = [0, 1.5, 2.5, 3.5, 4.5];
        const config = {
            enabled: true,
            astigmatAxis: calibration.axisChoice,
            astigmatPower: calibration.rxPower,
            fontSize: calibration.fontSize,
            luminanceClamp: calibration.brightness / 100,
            edgeEnhancement: calibration.edgeEnhancement,
            readingGuide: calibration.readingGuide,
            chromaticCorrection: calibration.chromaticCorrection,
            comaAngle: 0,
            comaIntensity: 0,
            keratoSeverity: keratoMap[calibration.keratoLevel] || 2,
            polarityReversed: calibration.contrastChoice === 4,
        };
        if (calibration.contrastChoice !== 4) {
            config.keratoSeverity = Math.max(config.keratoSeverity, calibration.contrastChoice * 1.2);
        }
        return config;
    }

    function showResults() {
        collectStepData(5);
        const config = computeConfig();
        const grid = document.getElementById('resultsGrid');

        const items = [
            { label: I18N.t('resultAxis'), value: `${config.astigmatAxis}°` },
            { label: I18N.t('resultPower'), value: `${config.astigmatPower} D` },
            { label: I18N.t('resultSeverity'), value: config.keratoSeverity.toFixed(1) },
            { label: I18N.t('resultFont'), value: `${config.fontSize}px` },
            { label: I18N.t('resultBright'), value: `${Math.round(config.luminanceClamp * 100)}%` },
            { label: I18N.t('resultPolarity'), value: config.polarityReversed ? `✅ ${I18N.t('enabled')}` : `❌ ${I18N.t('disabledLabel')}` },
            { label: I18N.t('resultEdge'), value: config.edgeEnhancement ? `✅ ${I18N.t('enabled')}` : `❌ ${I18N.t('disabledLabel')}` },
            { label: I18N.t('resultGuide'), value: config.readingGuide ? `✅ ${I18N.t('enabled')}` : `❌ ${I18N.t('disabledLabel')}` },
            { label: I18N.t('resultChrom'), value: config.chromaticCorrection ? `✅ ${I18N.t('enabled')}` : `❌ ${I18N.t('disabledLabel')}` },
            { label: I18N.t('resultComa'), value: I18N.t('automatic') },
        ];

        grid.innerHTML = items.map(i => `
            <div class="result-item">
                <div class="result-label">${i.label}</div>
                <div class="result-value">${i.value}</div>
            </div>
        `).join('');

        document.getElementById('applyBtn').onclick = () => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.set(config, () => {
                    const btn = document.getElementById('applyBtn');
                    btn.textContent = I18N.t('applied');
                    btn.style.background = 'linear-gradient(135deg, #00e676, #48CFCB)';
                    setTimeout(() => {
                        btn.textContent = I18N.t('applySettings');
                        btn.style.background = '';
                    }, 2500);
                });
            }
        };

        document.getElementById('retestBtn').onclick = () => goToStep(0);
    }

    // === Init ===
    async function init() {
        await I18N.loadLang();
        goToStep(0);
    }

    init();
})();
