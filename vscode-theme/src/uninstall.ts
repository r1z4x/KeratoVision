/**
 * KeratoVision — Uninstall Hook
 *
 * This script runs OUTSIDE the VS Code extension host (no vscode API).
 * It is invoked by VS Code after the extension is uninstalled and VS Code restarts.
 *
 * Cleans up:
 *  - workbench.colorCustomizations
 *  - editor.tokenColorCustomizations
 *  - All keratovision.* settings
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ============================================
//  Locate settings.json
// ============================================

function getSettingsPath(): string {
    const home = os.homedir();

    switch (process.platform) {
        case 'darwin':
            return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'settings.json');
        case 'linux':
            return path.join(home, '.config', 'Code', 'User', 'settings.json');
        case 'win32':
            return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Code', 'User', 'settings.json');
        default:
            return path.join(home, '.config', 'Code', 'User', 'settings.json');
    }
}

// ============================================
//  Strip JSON comments (// and /* */)
// ============================================

function stripJsonComments(text: string): string {
    // Remove single-line comments
    let result = text.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove trailing commas before } or ]
    result = result.replace(/,\s*([\]}])/g, '$1');
    return result;
}

// ============================================
//  Cleanup
// ============================================

function cleanup(): void {
    const settingsPath = getSettingsPath();

    if (!fs.existsSync(settingsPath)) {
        console.log('[KeratoVision Uninstall] settings.json not found, nothing to clean.');
        return;
    }

    try {
        const raw = fs.readFileSync(settingsPath, 'utf-8');
        const cleaned = stripJsonComments(raw);
        const settings: Record<string, unknown> = JSON.parse(cleaned);

        let changed = false;

        // Remove keratovision.* keys
        for (const key of Object.keys(settings)) {
            if (key.startsWith('keratovision.')) {
                delete settings[key];
                changed = true;
            }
        }

        // Remove colorCustomizations set by extension
        if (settings['workbench.colorCustomizations'] !== undefined) {
            delete settings['workbench.colorCustomizations'];
            changed = true;
        }

        // Remove tokenColorCustomizations set by extension
        if (settings['editor.tokenColorCustomizations'] !== undefined) {
            delete settings['editor.tokenColorCustomizations'];
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf-8');
            console.log('[KeratoVision Uninstall] Cleaned up settings.json successfully.');
        } else {
            console.log('[KeratoVision Uninstall] No KeratoVision settings found to clean.');
        }
    } catch (err) {
        console.error('[KeratoVision Uninstall] Failed to clean settings.json:', err);
    }
}

cleanup();
