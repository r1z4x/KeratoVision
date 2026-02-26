/**
 * KeratoVision i18n — Internationalization Module
 *
 * Runtime language switching for popup + calibration.
 * Supported: en, tr, ru, es
 * Language preference stored in browser.storage.sync (Firefox)
 */

const I18N = {
    _currentLang: 'en',

    // =========================================
    //  TRANSLATION DICTIONARY
    // =========================================
    translations: {
        // ----- ENGLISH -----
        en: {
            // Popup
            appTitle: 'KeratoVision',
            appSubtitle: 'Adaptive Rendering Engine',
            active: 'Active',
            disabled: 'Disabled',
            astigmatism: 'Astigmatism',
            axis: 'Axis',
            power: 'Power',
            keratoconus: 'Keratoconus',
            severity: 'Severity',
            mild: 'Mild',
            severe: 'Severe',
            comaAberration: 'Coma Aberration',
            direction: 'Direction',
            intensity: 'Intensity',
            auto: 'Auto',
            max: 'Max',
            comaHint: '0 = auto (kerato severity × 0.6)',
            display: 'Display',
            fontSize: 'Font Size',
            luminance: 'Luminance',
            dim: 'Dim',
            full: 'Full',
            advanced: 'Advanced',
            reverseContrast: 'Reverse Contrast',
            reverseContrastDesc: 'Dark mode for glare sensitivity',
            edgeEnhancement: 'Edge Enhancement',
            edgeEnhancementDesc: 'Gabor-inspired text-stroke',
            chromaticCorrection: 'Chromatic Correction',
            chromaticCorrectionDesc: 'Color fringing reduction',
            readingGuide: 'Reading Guide',
            readingGuideDesc: 'Line-tracking overlay',
            resetDefaults: 'Reset Defaults',
            calibration: '🎯 Calibration',
            language: 'Language',

            // Calibration
            calTitle: 'KeratoVision Calibration',
            stepOf: 'Step {0} / {1}',
            next: 'Next →',
            back: '← Back',
            complete: 'Complete',

            calStep1Title: '📋 Your Prescription',
            calStep1Desc: 'Enter your astigmatism and keratoconus details from your eye prescription. These values will be the starting point for auto-calibration.',
            cylPower: 'Cylinder (Astigmatism) Power',
            cylAxis: 'Cylinder Axis',
            diopter: 'D (Diopter)',
            degree: '° (Degrees)',
            keratoDiagnosis: 'Keratoconus Diagnosis',
            keratoNone: 'None',
            keratoMild: 'Mild',
            keratoModerate: 'Moderate',
            keratoAdvanced: 'Advanced',
            keratoSevere: 'Severe',

            calStep2Title: '🔲 Contrast Comfort',
            calStep2Desc: 'Select the card that is <strong>most comfortable to read</strong>.',
            contrastMax: 'Maximum Contrast',
            contrastSoft: 'Slightly Soft',
            contrastMedium: 'Medium Soft',
            contrastLow: 'Low Contrast',
            contrastReverse: 'Reverse Contrast (Dark)',
            sampleText: 'The quick brown fox jumps over the lazy dog.',

            calStep3Title: '🎯 Ghosting Alignment',
            calStep3Desc: 'Rotate to find the angle that minimizes ghosting. Stop when the text looks sharpest.',

            calStep4Title: '🔤 Font Readability',
            calStep4Desc: 'Select the <strong>smallest size</strong> you can comfortably read.',
            fontSample: 'Can you comfortably read this text at {0} pixels?',

            calStep5Title: '💡 Brightness & Glare Test',
            calStep5Desc: 'Slide to find the brightness level that doesn\'t strain your eyes.',
            brightPreview1: 'This area simulates the selected brightness level.',
            brightPreview2: 'If white areas on web pages bother you, reduce brightness.',
            brightWhite: 'Bright White Area',
            darkLabel: 'Dark (65%)',
            fullBright: 'Full Brightness (100%)',

            calStep6Title: '⚡ Edge Clarity & Features',
            calStep6Desc: 'Select which option looks better in each comparison.',
            edgeTitle: 'Edge Enhancement (Text-Stroke)',
            edgeOff: 'Normal letters, no edge effect',
            edgeOn: 'Enhanced edges, sharper',
            off: 'Off',
            on: 'On',
            guideTitle: 'Reading Guide (Line Tracking)',
            guideOff: 'Standard reading experience',
            guideOn: 'Mouse line tracking active',
            chromTitle: 'Chromatic Correction',
            chromOff: 'Standard color processing',
            chromOn: 'Anti-aliased, reduced color fringing',

            calStep7Title: '✅ Calibration Results',
            calStep7Desc: 'Your optimal settings based on the tests. Click "Apply" to activate them.',
            applySettings: '🚀 Apply Settings',
            retest: '🔄 Retest',
            applied: '✅ Applied!',
            resultAxis: 'Astigmat Axis',
            resultPower: 'Astigmat Power',
            resultSeverity: 'Kerato Severity',
            resultFont: 'Font Size',
            resultBright: 'Brightness',
            resultPolarity: 'Reverse Contrast',
            resultEdge: 'Edge Enhancement',
            resultGuide: 'Reading Guide',
            resultChrom: 'Chromatic Correction',
            resultComa: 'Coma',
            automatic: 'Automatic',
            enabled: 'On',
            disabledLabel: 'Off',
        },

        // ----- TURKISH -----
        tr: {
            appTitle: 'KeratoVision',
            appSubtitle: 'Adaptif Görüntü Motoru',
            active: 'Aktif',
            disabled: 'Devre Dışı',
            astigmatism: 'Astigmatizm',
            axis: 'Eksen',
            power: 'Güç',
            keratoconus: 'Keratokonus',
            severity: 'Şiddet',
            mild: 'Hafif',
            severe: 'Şiddetli',
            comaAberration: 'Koma Aberasyonu',
            direction: 'Yön',
            intensity: 'Yoğunluk',
            auto: 'Otomatik',
            max: 'Maks',
            comaHint: '0 = otomatik (kerato şiddeti × 0.6)',
            display: 'Görünüm',
            fontSize: 'Yazı Boyutu',
            luminance: 'Parlaklık',
            dim: 'Loş',
            full: 'Tam',
            advanced: 'Gelişmiş',
            reverseContrast: 'Ters Kontrast',
            reverseContrastDesc: 'Parlama hassasiyeti için koyu mod',
            edgeEnhancement: 'Kenar Güçlendirme',
            edgeEnhancementDesc: 'Gabor tarzı kenar çizgisi',
            chromaticCorrection: 'Kromatik Düzeltme',
            chromaticCorrectionDesc: 'Renk saçaklanması azaltma',
            readingGuide: 'Okuma Kılavuzu',
            readingGuideDesc: 'Satır takip katmanı',
            resetDefaults: 'Varsayılana Dön',
            calibration: '🎯 Kalibrasyon',
            language: 'Dil',

            calTitle: 'KeratoVision Kalibrasyon',
            stepOf: 'Adım {0} / {1}',
            next: 'İleri →',
            back: '← Geri',
            complete: 'Tamamla',

            calStep1Title: '📋 Reçete Bilgileriniz',
            calStep1Desc: 'Göz reçetenizden astigmatizm ve keratokonus bilgilerinizi girin. Bu değerler otomatik kalibrasyon için başlangıç noktası olacak.',
            cylPower: 'Silendirik (Astigmat) Gücü',
            cylAxis: 'Silendirik Ekseni (Aks)',
            diopter: 'D (Dioptri)',
            degree: '° (Derece)',
            keratoDiagnosis: 'Keratokonus Tanısı',
            keratoNone: 'Yok',
            keratoMild: 'Hafif',
            keratoModerate: 'Orta',
            keratoAdvanced: 'İleri',
            keratoSevere: 'Şiddetli',

            calStep2Title: '🔲 Kontrast Konforu',
            calStep2Desc: '<strong>En rahat okuduğunuz</strong> kartı seçin.',
            contrastMax: 'Maksimum Kontrast',
            contrastSoft: 'Hafif Yumuşak',
            contrastMedium: 'Orta Yumuşak',
            contrastLow: 'Düşük Kontrast',
            contrastReverse: 'Ters Kontrast (Koyu)',
            sampleText: 'Hızlı kahverengi tilki tembel köpeğin üzerinden atlar.',

            calStep3Title: '🎯 Hayalet Görüntü Hizalama',
            calStep3Desc: 'Metni döndürerek hayalet görüntüyü en aza indiren açıyı bulun.',

            calStep4Title: '🔤 Yazı Tipi Okunabilirliği',
            calStep4Desc: 'Rahatça okuyabileceğiniz <strong>en küçük boyutu</strong> seçin.',
            fontSample: 'Bu metin {0} piksel boyutunda. Rahatça okuyabiliyor musunuz?',

            calStep5Title: '💡 Parlaklık & Parlama Testi',
            calStep5Desc: 'Gözlerinizi rahatsız etmeyen parlaklık seviyesini bulun.',
            brightPreview1: 'Bu alan, seçtiğiniz parlaklık seviyesini simüle eder.',
            brightPreview2: 'Web sayfalarında beyaz alanlar sizi rahatsız ediyorsa parlaklığı düşürün.',
            brightWhite: 'Parlak Beyaz Alan',
            darkLabel: 'Karanlık (65%)',
            fullBright: 'Tam Parlaklık (100%)',

            calStep6Title: '⚡ Kenar Netliği & Özellikler',
            calStep6Desc: 'Her karşılaştırmada hangisinin daha iyi göründüğünü seçin.',
            edgeTitle: 'Kenar Güçlendirme (Text-Stroke)',
            edgeOff: 'Normal harfler, kenar efekti yok',
            edgeOn: 'Güçlendirilmiş kenarlar, daha net',
            off: 'Kapalı',
            on: 'Açık',
            guideTitle: 'Okuma Kılavuzu (Satır Takibi)',
            guideOff: 'Standart okuma deneyimi',
            guideOn: 'Fare ile satır takibi aktif',
            chromTitle: 'Kromatik Düzeltme',
            chromOff: 'Standart renk işleme',
            chromOn: 'Anti-aliased, renk saçaklanması azaltılmış',

            calStep7Title: '✅ Kalibrasyon Sonuçları',
            calStep7Desc: 'Testlerinize göre hesaplanan optimal ayarlarınız. "Uygula" ile aktif edin.',
            applySettings: '🚀 Ayarları Uygula',
            retest: '🔄 Tekrar Test Et',
            applied: '✅ Uygulandı!',
            resultAxis: 'Astigmat Ekseni',
            resultPower: 'Astigmat Gücü',
            resultSeverity: 'Kerato Şiddeti',
            resultFont: 'Font Boyutu',
            resultBright: 'Parlaklık',
            resultPolarity: 'Ters Kontrast',
            resultEdge: 'Kenar Güçlendirme',
            resultGuide: 'Okuma Kılavuzu',
            resultChrom: 'Kromatik Düzeltme',
            resultComa: 'Koma',
            automatic: 'Otomatik',
            enabled: 'Açık',
            disabledLabel: 'Kapalı',
        },

        // ----- RUSSIAN -----
        ru: {
            appTitle: 'KeratoVision',
            appSubtitle: 'Адаптивный движок рендеринга',
            active: 'Активно',
            disabled: 'Отключено',
            astigmatism: 'Астигматизм',
            axis: 'Ось',
            power: 'Сила',
            keratoconus: 'Кератоконус',
            severity: 'Степень',
            mild: 'Лёгкая',
            severe: 'Тяжёлая',
            comaAberration: 'Кома-аберрация',
            direction: 'Направление',
            intensity: 'Интенсивность',
            auto: 'Авто',
            max: 'Макс',
            comaHint: '0 = авто (степень кератоконуса × 0.6)',
            display: 'Экран',
            fontSize: 'Размер шрифта',
            luminance: 'Яркость',
            dim: 'Тусклый',
            full: 'Полный',
            advanced: 'Расширенные',
            reverseContrast: 'Обратный контраст',
            reverseContrastDesc: 'Тёмный режим от бликов',
            edgeEnhancement: 'Усиление краёв',
            edgeEnhancementDesc: 'Обводка текста (Габор)',
            chromaticCorrection: 'Хроматическая коррекция',
            chromaticCorrectionDesc: 'Снижение цветовых ореолов',
            readingGuide: 'Направляющая чтения',
            readingGuideDesc: 'Отслеживание строки',
            resetDefaults: 'Сбросить',
            calibration: '🎯 Калибровка',
            language: 'Язык',

            calTitle: 'KeratoVision Калибровка',
            stepOf: 'Шаг {0} / {1}',
            next: 'Далее →',
            back: '← Назад',
            complete: 'Завершить',

            calStep1Title: '📋 Ваш рецепт',
            calStep1Desc: 'Введите данные астигматизма и кератоконуса из рецепта на очки.',
            cylPower: 'Цилиндрическая сила (Астигматизм)',
            cylAxis: 'Ось цилиндра',
            diopter: 'Д (Диоптрии)',
            degree: '° (Градусы)',
            keratoDiagnosis: 'Диагноз кератоконуса',
            keratoNone: 'Нет',
            keratoMild: 'Лёгкий',
            keratoModerate: 'Средний',
            keratoAdvanced: 'Продвинутый',
            keratoSevere: 'Тяжёлый',

            calStep2Title: '🔲 Комфорт контраста',
            calStep2Desc: 'Выберите карточку, которую <strong>удобнее всего читать</strong>.',
            contrastMax: 'Максимальный контраст',
            contrastSoft: 'Слегка мягкий',
            contrastMedium: 'Средне мягкий',
            contrastLow: 'Низкий контраст',
            contrastReverse: 'Обратный контраст (Тёмный)',
            sampleText: 'Быстрая коричневая лиса прыгает через ленивую собаку.',

            calStep3Title: '🎯 Выравнивание двоения',
            calStep3Desc: 'Вращайте, чтобы найти угол, при котором двоение минимально.',

            calStep4Title: '🔤 Читаемость шрифта',
            calStep4Desc: 'Выберите <strong>наименьший размер</strong>, который удобно читать.',
            fontSample: 'Удобно ли вам читать текст размером {0} пикселей?',

            calStep5Title: '💡 Яркость и блики',
            calStep5Desc: 'Найдите уровень яркости, не напрягающий глаза.',
            brightPreview1: 'Эта область имитирует выбранную яркость.',
            brightPreview2: 'Если белые области на сайтах вас беспокоят, снизьте яркость.',
            brightWhite: 'Яркая белая область',
            darkLabel: 'Тёмный (65%)',
            fullBright: 'Полная яркость (100%)',

            calStep6Title: '⚡ Чёткость краёв и функции',
            calStep6Desc: 'Выберите лучший вариант в каждом сравнении.',
            edgeTitle: 'Усиление краёв (обводка)',
            edgeOff: 'Обычные буквы, без эффекта',
            edgeOn: 'Усиленные края, чётче',
            off: 'Выкл',
            on: 'Вкл',
            guideTitle: 'Направляющая чтения',
            guideOff: 'Стандартный режим чтения',
            guideOn: 'Отслеживание строки мышью',
            chromTitle: 'Хроматическая коррекция',
            chromOff: 'Стандартная обработка цвета',
            chromOn: 'Сглаживание, уменьшение ореолов',

            calStep7Title: '✅ Результаты калибровки',
            calStep7Desc: 'Оптимальные настройки по результатам тестов. Нажмите "Применить".',
            applySettings: '🚀 Применить настройки',
            retest: '🔄 Перетестировать',
            applied: '✅ Применено!',
            resultAxis: 'Ось астигматизма',
            resultPower: 'Сила астигматизма',
            resultSeverity: 'Степень кератоконуса',
            resultFont: 'Размер шрифта',
            resultBright: 'Яркость',
            resultPolarity: 'Обратный контраст',
            resultEdge: 'Усиление краёв',
            resultGuide: 'Направляющая',
            resultChrom: 'Хроматическая коррекция',
            resultComa: 'Кома',
            automatic: 'Автоматически',
            enabled: 'Вкл',
            disabledLabel: 'Выкл',
        },

        // ----- SPANISH -----
        es: {
            appTitle: 'KeratoVision',
            appSubtitle: 'Motor de Renderizado Adaptativo',
            active: 'Activo',
            disabled: 'Desactivado',
            astigmatism: 'Astigmatismo',
            axis: 'Eje',
            power: 'Potencia',
            keratoconus: 'Queratocono',
            severity: 'Severidad',
            mild: 'Leve',
            severe: 'Severo',
            comaAberration: 'Aberración de Coma',
            direction: 'Dirección',
            intensity: 'Intensidad',
            auto: 'Auto',
            max: 'Máx',
            comaHint: '0 = auto (severidad kerato × 0.6)',
            display: 'Pantalla',
            fontSize: 'Tamaño de Fuente',
            luminance: 'Luminancia',
            dim: 'Tenue',
            full: 'Pleno',
            advanced: 'Avanzado',
            reverseContrast: 'Contraste Inverso',
            reverseContrastDesc: 'Modo oscuro para sensibilidad al brillo',
            edgeEnhancement: 'Mejora de Bordes',
            edgeEnhancementDesc: 'Trazo de texto inspirado en Gabor',
            chromaticCorrection: 'Corrección Cromática',
            chromaticCorrectionDesc: 'Reducción de aberración cromática',
            readingGuide: 'Guía de Lectura',
            readingGuideDesc: 'Seguimiento de línea',
            resetDefaults: 'Restablecer',
            calibration: '🎯 Calibración',
            language: 'Idioma',

            calTitle: 'KeratoVision Calibración',
            stepOf: 'Paso {0} / {1}',
            next: 'Siguiente →',
            back: '← Atrás',
            complete: 'Completar',

            calStep1Title: '📋 Su Receta',
            calStep1Desc: 'Ingrese los datos de astigmatismo y queratocono de su receta óptica.',
            cylPower: 'Potencia Cilíndrica (Astigmatismo)',
            cylAxis: 'Eje del Cilindro',
            diopter: 'D (Dioptrías)',
            degree: '° (Grados)',
            keratoDiagnosis: 'Diagnóstico de Queratocono',
            keratoNone: 'Ninguno',
            keratoMild: 'Leve',
            keratoModerate: 'Moderado',
            keratoAdvanced: 'Avanzado',
            keratoSevere: 'Severo',

            calStep2Title: '🔲 Comodidad de Contraste',
            calStep2Desc: 'Seleccione la tarjeta que sea <strong>más cómoda de leer</strong>.',
            contrastMax: 'Contraste Máximo',
            contrastSoft: 'Ligeramente Suave',
            contrastMedium: 'Medio Suave',
            contrastLow: 'Contraste Bajo',
            contrastReverse: 'Contraste Inverso (Oscuro)',
            sampleText: 'El rápido zorro marrón salta sobre el perro perezoso.',

            calStep3Title: '🎯 Alineación de Imágenes Fantasma',
            calStep3Desc: 'Gire para encontrar el ángulo que minimiza las imágenes fantasma.',

            calStep4Title: '🔤 Legibilidad de Fuente',
            calStep4Desc: 'Seleccione el <strong>tamaño más pequeño</strong> que pueda leer cómodamente.',
            fontSample: '¿Puede leer este texto cómodamente a {0} píxeles?',

            calStep5Title: '💡 Prueba de Brillo y Deslumbramiento',
            calStep5Desc: 'Deslice para encontrar el nivel de brillo que no canse sus ojos.',
            brightPreview1: 'Esta área simula el nivel de brillo seleccionado.',
            brightPreview2: 'Si las áreas blancas en las páginas web le molestan, reduzca el brillo.',
            brightWhite: 'Área Blanca Brillante',
            darkLabel: 'Oscuro (65%)',
            fullBright: 'Brillo Completo (100%)',

            calStep6Title: '⚡ Claridad de Bordes y Funciones',
            calStep6Desc: 'Seleccione la mejor opción en cada comparación.',
            edgeTitle: 'Mejora de Bordes (Trazo)',
            edgeOff: 'Letras normales, sin efecto',
            edgeOn: 'Bordes mejorados, más nítidos',
            off: 'Apagado',
            on: 'Encendido',
            guideTitle: 'Guía de Lectura (Seguimiento)',
            guideOff: 'Experiencia de lectura estándar',
            guideOn: 'Seguimiento de línea con ratón',
            chromTitle: 'Corrección Cromática',
            chromOff: 'Procesamiento de color estándar',
            chromOn: 'Suavizado, aberración cromática reducida',

            calStep7Title: '✅ Resultados de Calibración',
            calStep7Desc: 'Sus ajustes óptimos basados en las pruebas. Haga clic en "Aplicar".',
            applySettings: '🚀 Aplicar Ajustes',
            retest: '🔄 Repetir Prueba',
            applied: '✅ ¡Aplicado!',
            resultAxis: 'Eje Astigmático',
            resultPower: 'Potencia Astigmática',
            resultSeverity: 'Severidad Kerato',
            resultFont: 'Tamaño de Fuente',
            resultBright: 'Brillo',
            resultPolarity: 'Contraste Inverso',
            resultEdge: 'Mejora de Bordes',
            resultGuide: 'Guía de Lectura',
            resultChrom: 'Corrección Cromática',
            resultComa: 'Coma',
            automatic: 'Automático',
            enabled: 'Sí',
            disabledLabel: 'No',
        },
    },

    /**
     * Get translated string. Supports {0}, {1} placeholders.
     * @param {string} key
     * @param  {...any} args
     * @returns {string}
     */
    t(key, ...args) {
        const dict = I18N.translations[I18N._currentLang] || I18N.translations.en;
        let str = dict[key] || I18N.translations.en[key] || key;
        args.forEach((arg, i) => {
            str = str.replace(`{${i}}`, arg);
        });
        return str;
    },

    /**
     * Set current language and persist.
     * @param {string} lang - 'en' | 'tr' | 'ru' | 'es'
     */
    setLang(lang) {
        if (I18N.translations[lang]) {
            I18N._currentLang = lang;
            if (typeof browser !== 'undefined' && browser.storage) {
                browser.storage.sync.set({ language: lang });
            }
        }
    },

    /**
     * Load saved language preference.
     * @returns {Promise<string>}
     */
    async loadLang() {
        try {
            if (typeof browser !== 'undefined' && browser.storage) {
                const result = await browser.storage.sync.get({ language: 'en' });
                I18N._currentLang = result.language || 'en';
                return I18N._currentLang;
            }
        } catch (e) {
            console.warn('[KeratoVision] i18n load fallback:', e);
        }
        return 'en';
    },

    /** @returns {string} */
    getLang() {
        return I18N._currentLang;
    },

    /** Available languages with labels */
    available: [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
    ],
};
