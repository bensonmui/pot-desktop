import { appWindow } from '@tauri-apps/api/window';
import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { warn } from 'tauri-plugin-log-api';
import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { invoke } from '@tauri-apps/api/tauri';
import Screenshot from './window/Screenshot';
import Translate from './window/Translate';
import Recognize from './window/Recognize';
import Updater from './window/Updater';
import Config from './window/Config';
import { useConfig } from './hooks';
import './style.css';
import './i18n';

const windowMap = {
    translate: <Translate />,
    screenshot: <Screenshot />,
    recognize: <Recognize />,
    config: <Config />,
    updater: <Updater />,
};

export default function App() {
    const [devMode] = useConfig('dev_mode', false);
    const [appTheme] = useConfig('app_theme', 'system');
    const [appLanguage] = useConfig('app_language', 'en');
    const [appFont] = useConfig('app_font', 'default');
    const [appFallbackFont] = useConfig('app_fallback_font', 'default');
    const [appFontSize] = useConfig('app_font_size', 16);
    const [appAccent] = useConfig('app_accent', 'default');
    const [appRadius] = useConfig('app_radius', 'default');
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    useEffect(() => {
        if (devMode !== null && devMode) {
            document.addEventListener('keydown', async (e) => {
                let allowKeys = ['c', 'v', 'x', 'a', 'z', 'y'];
                if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                }
                if (e.key === 'F12') {
                    await invoke('open_devtools');
                }
                if (e.key.startsWith('F') && e.key.length > 1) {
                    e.preventDefault();
                }
                if (e.key === 'Escape') {
                    await appWindow.close();
                }
            });
        } else {
            document.addEventListener('keydown', async (e) => {
                let allowKeys = ['c', 'v', 'x', 'a', 'z', 'y'];
                if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                }
                if (e.key.startsWith('F') && e.key.length > 1) {
                    e.preventDefault();
                }
                if (e.key === 'Escape') {
                    await appWindow.close();
                }
            });
        }
    }, [devMode]);

    useEffect(() => {
        if (appTheme !== null) {
            if (appTheme !== 'system') {
                setTheme(appTheme);
            } else {
                try {
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        setTheme('dark');
                    } else {
                        setTheme('light');
                    }
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                        if (e.matches) {
                            setTheme('dark');
                        } else {
                            setTheme('light');
                        }
                    });
                } catch {
                    warn("Can't detect system theme.");
                }
            }
        }
    }, [appTheme]);

    useEffect(() => {
        if (appLanguage !== null) {
            i18n.changeLanguage(appLanguage);
        }
    }, [appLanguage]);

    useEffect(() => {
        if (appFont !== null && appFallbackFont !== null) {
            document.documentElement.style.fontFamily = `"${appFont === 'default' ? 'sans-serif' : appFont}","${
                appFallbackFont === 'default' ? 'sans-serif' : appFallbackFont
            }"`;
        }
        if (appFontSize !== null) {
            document.documentElement.style.fontSize = `${appFontSize}px`;
        }
    }, [appFont, appFallbackFont, appFontSize]);

    // 強調色（覆寫 NextUI primary 的 CSS 變數；'default' 用主題原色）
    useEffect(() => {
        const root = document.documentElement;
        const presets = {
            blue: [212, 100],
            green: [142, 71],
            purple: [270, 76],
            pink: [330, 81],
            orange: [25, 95],
            red: [0, 84],
        };
        const shades = { 50: 97, 100: 94, 200: 86, 300: 76, 400: 66, 500: 56, 600: 48, 700: 41, 800: 35, 900: 30 };
        if (appAccent && appAccent !== 'default' && presets[appAccent]) {
            const [h, s] = presets[appAccent];
            for (const [k, l] of Object.entries(shades)) {
                root.style.setProperty(`--nextui-primary-${k}`, `${h} ${s}% ${l}%`);
            }
            root.style.setProperty('--nextui-primary', `${h} ${s}% ${shades[500]}%`);
            root.style.setProperty('--nextui-primary-foreground', '0 0% 100%');
        } else {
            for (const k of Object.keys(shades)) {
                root.style.removeProperty(`--nextui-primary-${k}`);
            }
            root.style.removeProperty('--nextui-primary');
            root.style.removeProperty('--nextui-primary-foreground');
        }
    }, [appAccent]);

    // 圓角（覆寫 NextUI radius 的 CSS 變數）
    useEffect(() => {
        const root = document.documentElement;
        const radii = {
            sm: { small: '4px', medium: '6px', large: '8px' },
            md: { small: '6px', medium: '12px', large: '16px' },
            lg: { small: '10px', medium: '16px', large: '22px' },
        };
        if (appRadius && appRadius !== 'default' && radii[appRadius]) {
            const r = radii[appRadius];
            root.style.setProperty('--nextui-radius-small', r.small);
            root.style.setProperty('--nextui-radius-medium', r.medium);
            root.style.setProperty('--nextui-radius-large', r.large);
        } else {
            root.style.removeProperty('--nextui-radius-small');
            root.style.removeProperty('--nextui-radius-medium');
            root.style.removeProperty('--nextui-radius-large');
        }
    }, [appRadius]);

    return <BrowserRouter>{windowMap[appWindow.label]}</BrowserRouter>;
}
