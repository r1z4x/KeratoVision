/**
 * KeratoVision — Theme Engine
 *
 * Computes VS Code color customizations from a base palette + user settings.
 * All color manipulation is HSL-based for perceptual accuracy.
 */

import { Palette, palettes } from './palettes';

export interface ThemeSettings {
    preset: string;
    contrast: number;     // 50–100
    brightness: number;   // 60–100
    saturation: number;   // 30–100
    warmth: number;       // 0–100
    severity: number;     // 0–5
}

// ============================================
//  HSL Utilities
// ============================================

function hexToHSL(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));

    const sN = s / 100;
    const lN = l / 100;
    const c = (1 - Math.abs(2 * lN - 1)) * sN;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lN - c / 2;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    const toHex = (v: number) => {
        const hex = Math.round((v + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjust a hex color based on settings.
 */
function adjust(
    hex: string,
    opts: {
        satMul?: number;    // multiplier for saturation (0.3–1.0)
        brightMul?: number; // multiplier for lightness
        warmShift?: number; // hue shift toward warm (+) or cool (-)
        contrastMul?: number; // contrast multiplier applied to lightness distance from mid
    }
): string {
    let [h, s, l] = hexToHSL(hex);

    // Saturation
    if (opts.satMul !== undefined) {
        s = s * opts.satMul;
    }

    // Warmth: shift hue toward amber (30°) or toward blue (220°)
    if (opts.warmShift !== undefined && opts.warmShift !== 0) {
        h = h + opts.warmShift;
    }

    // Brightness: scale lightness
    if (opts.brightMul !== undefined) {
        l = l * opts.brightMul;
    }

    // Contrast: push lightness away from or toward midpoint
    if (opts.contrastMul !== undefined) {
        const mid = 50;
        const dist = l - mid;
        l = mid + dist * opts.contrastMul;
    }

    return hslToHex(h, s, l);
}

// ============================================
//  Compute Multipliers from Settings
// ============================================

function computeMultipliers(settings: ThemeSettings) {
    const satMul = settings.saturation / 100;
    const brightMul = settings.brightness / 100;
    const contrastMul = settings.contrast / 100;

    // Warmth: -5 to +5 degree hue shift
    const warmShift = (settings.warmth - 50) * 0.1;

    // Severity reduces contrast and saturation further
    const severityFactor = 1 - (settings.severity * 0.06); // 0→1.0, 5→0.7

    return {
        satMul: satMul * severityFactor,
        brightMul,
        contrastMul: contrastMul * severityFactor,
        warmShift,
    };
}

// ============================================
//  Color Customizations Generator
// ============================================

export function computeColors(settings: ThemeSettings): Record<string, string> {
    const p: Palette = palettes[settings.preset] || palettes.dark;
    const m = computeMultipliers(settings);

    const bg = (hex: string) => adjust(hex, { brightMul: m.brightMul, warmShift: m.warmShift });
    const fg = (hex: string) => adjust(hex, { contrastMul: m.contrastMul, warmShift: m.warmShift });
    const syn = (hex: string) => adjust(hex, { satMul: m.satMul, contrastMul: m.contrastMul, warmShift: m.warmShift });
    const alpha = (hex: string, a: string) => hex + a;

    return {
        'editor.background': bg(p.bg1),
        'editor.foreground': fg(p.fg),
        'editor.lineHighlightBackground': alpha(bg(p.bg2), '66'),
        'editor.selectionBackground': alpha(syn(p.accent1), '33'),
        'editor.selectionHighlightBackground': alpha(syn(p.accent2), '22'),
        'editor.findMatchBackground': alpha(syn(p.accent2), '33'),
        'editor.findMatchHighlightBackground': alpha(syn(p.accent2), '1a'),
        'editorCursor.foreground': syn(p.accent2),
        'editorIndentGuide.background': bg(p.border),
        'editorIndentGuide.activeBackground': bg(p.bg3),
        'editorLineNumber.foreground': fg(p.fgDim),
        'editorLineNumber.activeForeground': fg(p.fgMuted),
        'editorBracketMatch.background': alpha(syn(p.accent1), '22'),
        'editorBracketMatch.border': alpha(syn(p.accent1), '55'),
        'editorGutter.background': bg(p.bg1),
        'editorOverviewRuler.border': bg(p.bg3),

        'sideBar.background': bg(p.bg0),
        'sideBar.foreground': fg(p.fgMuted),
        'sideBar.border': bg(p.border),
        'sideBarTitle.foreground': fg(p.fg),

        'activityBar.background': bg(p.bg0),
        'activityBar.foreground': fg(p.fgMuted),
        'activityBar.inactiveForeground': fg(p.fgDim),
        'activityBar.border': bg(p.border),
        'activityBarBadge.background': syn(p.accent1),
        'activityBarBadge.foreground': '#ffffff',

        'titleBar.activeBackground': bg(p.bg0),
        'titleBar.activeForeground': fg(p.fg),
        'titleBar.inactiveBackground': bg(p.bg0),
        'titleBar.inactiveForeground': fg(p.fgDim),
        'titleBar.border': bg(p.border),

        'statusBar.background': bg(p.bg0),
        'statusBar.foreground': fg(p.fgMuted),
        'statusBar.border': bg(p.border),
        'statusBar.debuggingBackground': syn(p.accent1),

        'tab.activeBackground': bg(p.bg2),
        'tab.activeForeground': fg(p.fg),
        'tab.inactiveBackground': bg(p.bg1),
        'tab.inactiveForeground': fg(p.fgDim),
        'tab.border': bg(p.bg1),
        'tab.activeBorderTop': syn(p.accent1),
        'tab.hoverBackground': bg(p.bg3),

        'editorGroupHeader.tabsBackground': bg(p.bg0),
        'editorGroupHeader.tabsBorder': bg(p.border),

        'panel.background': bg(p.bg0),
        'panel.border': bg(p.border),
        'panelTitle.activeBorder': syn(p.accent1),
        'panelTitle.activeForeground': fg(p.fg),
        'panelTitle.inactiveForeground': fg(p.fgDim),

        'terminal.background': bg(p.bg0),
        'terminal.foreground': fg(p.fg),
        'terminal.ansiRed': syn(p.ansiRed),
        'terminal.ansiGreen': syn(p.ansiGreen),
        'terminal.ansiYellow': syn(p.ansiYellow),
        'terminal.ansiBlue': syn(p.ansiBlue),
        'terminal.ansiMagenta': syn(p.ansiMagenta),
        'terminal.ansiCyan': syn(p.ansiCyan),

        'input.background': bg(p.bg2),
        'input.foreground': fg(p.fg),
        'input.border': bg(p.border),
        'input.placeholderForeground': fg(p.fgDim),
        'inputOption.activeBorder': syn(p.accent1),

        'dropdown.background': bg(p.bg2),
        'dropdown.border': bg(p.border),
        'dropdown.foreground': fg(p.fg),

        'button.background': syn(p.accent1),
        'button.foreground': '#ffffff',

        'badge.background': syn(p.accent1),
        'badge.foreground': '#ffffff',

        'scrollbarSlider.background': alpha(syn(p.accent1), '33'),
        'scrollbarSlider.hoverBackground': alpha(syn(p.accent1), '55'),
        'scrollbarSlider.activeBackground': alpha(syn(p.accent1), '77'),

        'list.activeSelectionBackground': alpha(syn(p.accent1), '33'),
        'list.activeSelectionForeground': fg(p.fg),
        'list.hoverBackground': bg(p.bg3),
        'list.highlightForeground': syn(p.accent2),

        'gitDecoration.modifiedResourceForeground': syn(p.warning),
        'gitDecoration.deletedResourceForeground': syn(p.error),
        'gitDecoration.untrackedResourceForeground': syn(p.success),
        'gitDecoration.ignoredResourceForeground': fg(p.fgDim),

        'editorError.foreground': syn(p.error),
        'editorWarning.foreground': syn(p.warning),
        'editorInfo.foreground': syn(p.info),

        'focusBorder': alpha(syn(p.accent1), '88'),
        'foreground': fg(p.fg),
        'descriptionForeground': fg(p.fgMuted),
        'icon.foreground': fg(p.fgMuted),
    };
}

// ============================================
//  Token Color Customizations Generator
// ============================================

export function computeTokenColors(settings: ThemeSettings): object {
    const p: Palette = palettes[settings.preset] || palettes.dark;
    const m = computeMultipliers(settings);
    const syn = (hex: string) => adjust(hex, { satMul: m.satMul, contrastMul: m.contrastMul, warmShift: m.warmShift });

    return {
        comments: syn(p.comment),
        keywords: syn(p.keyword),
        functions: syn(p.function_),
        strings: syn(p.string_),
        numbers: syn(p.number),
        types: syn(p.typeColor),
        variables: syn(p.fg),

        textMateRules: [
            { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: syn(p.comment), fontStyle: 'italic' } },
            { scope: ['string', 'string.quoted'], settings: { foreground: syn(p.string_) } },
            { scope: ['string.template'], settings: { foreground: syn(p.string_) } },
            { scope: ['constant.numeric'], settings: { foreground: syn(p.number) } },
            { scope: ['constant.language'], settings: { foreground: syn(p.constant) } },
            { scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'], settings: { foreground: syn(p.keyword) } },
            { scope: ['keyword.operator'], settings: { foreground: syn(p.operator) } },
            { scope: ['entity.name.function', 'meta.function-call', 'support.function'], settings: { foreground: syn(p.function_) } },
            { scope: ['variable.parameter'], settings: { foreground: syn(p.attribute), fontStyle: 'italic' } },
            { scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type'], settings: { foreground: syn(p.typeColor) } },
            { scope: ['entity.name.type.interface'], settings: { foreground: syn(p.typeColor), fontStyle: 'italic' } },
            { scope: ['variable', 'variable.other'], settings: { foreground: syn(p.fg) } },
            { scope: ['variable.other.constant'], settings: { foreground: syn(p.number) } },
            { scope: ['variable.other.property'], settings: { foreground: syn(p.property) } },
            { scope: ['entity.name.tag'], settings: { foreground: syn(p.tag) } },
            { scope: ['entity.other.attribute-name'], settings: { foreground: syn(p.attribute), fontStyle: 'italic' } },
            { scope: ['entity.name.tag.css', 'entity.other.attribute-name.class.css'], settings: { foreground: syn(p.typeColor) } },
            { scope: ['support.type.property-name.css'], settings: { foreground: syn(p.function_) } },
            { scope: ['string.regexp'], settings: { foreground: syn(p.regex) } },
            { scope: ['constant.character.escape'], settings: { foreground: syn(p.accent2) } },
            { scope: ['punctuation.definition.block', 'meta.brace'], settings: { foreground: syn(p.fgMuted) } },
            { scope: ['markup.heading'], settings: { foreground: syn(p.accent1), fontStyle: 'bold' } },
            { scope: ['markup.bold'], settings: { foreground: syn(p.number), fontStyle: 'bold' } },
            { scope: ['markup.italic'], settings: { foreground: syn(p.keyword), fontStyle: 'italic' } },
            { scope: ['markup.underline.link'], settings: { foreground: syn(p.accent2) } },
            { scope: ['markup.inline.raw'], settings: { foreground: syn(p.string_) } },
            { scope: ['support.type.property-name.json'], settings: { foreground: syn(p.function_) } },
            { scope: ['entity.name.tag.yaml'], settings: { foreground: syn(p.typeColor) } },
        ],
    };
}
