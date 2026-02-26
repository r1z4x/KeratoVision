"use strict";
/**
 * KeratoVision — VS Code Extension
 *
 * Dynamic theme that reacts to user settings in real-time.
 * Adjusts editor colors via workbench.colorCustomizations
 * and syntax colors via editor.tokenColorCustomizations.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const themeEngine_1 = require("./themeEngine");
const CONFIG_SECTION = 'keratovision';
const DEFAULTS = {
    preset: 'dark',
    contrast: 85,
    brightness: 95,
    saturation: 80,
    warmth: 50,
    severity: 2,
};
// ============================================
//  Settings Reader
// ============================================
function readSettings() {
    const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
        preset: cfg.get('preset', DEFAULTS.preset),
        contrast: cfg.get('contrast', DEFAULTS.contrast),
        brightness: cfg.get('brightness', DEFAULTS.brightness),
        saturation: cfg.get('saturation', DEFAULTS.saturation),
        warmth: cfg.get('warmth', DEFAULTS.warmth),
        severity: cfg.get('severity', DEFAULTS.severity),
        enabled: cfg.get('enabled', true),
    };
}
// ============================================
//  Apply Theme
// ============================================
async function applyTheme() {
    const settings = readSettings();
    if (!settings.enabled) {
        // Clear customizations when disabled
        const wcfg = vscode.workspace.getConfiguration('workbench');
        const ecfg = vscode.workspace.getConfiguration('editor');
        await wcfg.update('colorCustomizations', undefined, vscode.ConfigurationTarget.Global);
        await ecfg.update('tokenColorCustomizations', undefined, vscode.ConfigurationTarget.Global);
        return;
    }
    const uiColors = (0, themeEngine_1.computeColors)(settings);
    const tokenColors = (0, themeEngine_1.computeTokenColors)(settings);
    // Merge with existing user customizations (don't overwrite non-KeratoVision keys)
    const wcfg = vscode.workspace.getConfiguration('workbench');
    const ecfg = vscode.workspace.getConfiguration('editor');
    await wcfg.update('colorCustomizations', uiColors, vscode.ConfigurationTarget.Global);
    await ecfg.update('tokenColorCustomizations', tokenColors, vscode.ConfigurationTarget.Global);
}
// ============================================
//  Commands
// ============================================
async function switchPreset() {
    const presets = [
        { label: '🌙 Dark', description: 'Default — reduced contrast, muted palette', value: 'dark' },
        { label: '☁️ Soft', description: 'Maximum comfort — warmer, lower saturation', value: 'soft' },
        { label: '☀️ Light', description: 'Warm cream background, earthy tones', value: 'light' },
    ];
    const pick = await vscode.window.showQuickPick(presets, {
        placeHolder: 'Select a KeratoVision preset',
    });
    if (pick) {
        const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
        await cfg.update('preset', pick.value, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`KeratoVision: Switched to ${pick.label}`);
    }
}
async function resetDefaults() {
    const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
    for (const [key, value] of Object.entries(DEFAULTS)) {
        await cfg.update(key, value, vscode.ConfigurationTarget.Global);
    }
    vscode.window.showInformationMessage('KeratoVision: Reset to defaults');
}
// ============================================
//  Activation
// ============================================
function activate(context) {
    console.log('[KeratoVision] Extension activated');
    // Apply theme on startup
    applyTheme();
    // Watch for settings changes
    const watcher = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(CONFIG_SECTION)) {
            applyTheme();
        }
    });
    // Register commands
    const switchCmd = vscode.commands.registerCommand('keratovision.switchPreset', switchPreset);
    const resetCmd = vscode.commands.registerCommand('keratovision.reset', resetDefaults);
    context.subscriptions.push(watcher, switchCmd, resetCmd);
}
function deactivate() {
    // Optionally clear customizations on deactivate
    console.log('[KeratoVision] Extension deactivated');
}
//# sourceMappingURL=extension.js.map