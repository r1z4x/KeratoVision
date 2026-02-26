/**
 * KeratoVision — VS Code Extension
 *
 * Dynamic theme that reacts to user settings in real-time.
 * Adjusts editor colors via workbench.colorCustomizations
 * and syntax colors via editor.tokenColorCustomizations.
 */

import * as vscode from 'vscode';
import { computeColors, computeTokenColors, ThemeSettings } from './themeEngine';

const CONFIG_SECTION = 'keratovision';

const DEFAULTS: ThemeSettings = {
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

function readSettings(): ThemeSettings & { enabled: boolean } {
    const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
        preset: cfg.get<string>('preset', DEFAULTS.preset),
        contrast: cfg.get<number>('contrast', DEFAULTS.contrast),
        brightness: cfg.get<number>('brightness', DEFAULTS.brightness),
        saturation: cfg.get<number>('saturation', DEFAULTS.saturation),
        warmth: cfg.get<number>('warmth', DEFAULTS.warmth),
        severity: cfg.get<number>('severity', DEFAULTS.severity),
        enabled: cfg.get<boolean>('enabled', true),
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

    const uiColors = computeColors(settings);
    const tokenColors = computeTokenColors(settings);

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

export function activate(context: vscode.ExtensionContext) {
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

export async function deactivate() {
    console.log('[KeratoVision] Extension deactivating — clearing all customizations');
    try {
        // Clear color customizations
        const wcfg = vscode.workspace.getConfiguration('workbench');
        const ecfg = vscode.workspace.getConfiguration('editor');
        await wcfg.update('colorCustomizations', undefined, vscode.ConfigurationTarget.Global);
        await ecfg.update('tokenColorCustomizations', undefined, vscode.ConfigurationTarget.Global);

        // Clear keratovision.* config keys
        const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
        const keysToReset = ['preset', 'contrast', 'brightness', 'saturation', 'warmth', 'severity', 'enabled'];
        for (const key of keysToReset) {
            await cfg.update(key, undefined, vscode.ConfigurationTarget.Global);
        }

        console.log('[KeratoVision] All customizations cleared successfully');
    } catch (err) {
        console.error('[KeratoVision] Failed to clear customizations:', err);
    }
}
