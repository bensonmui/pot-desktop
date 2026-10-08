import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { appWindow } from '@tauri-apps/api/window';
import { NextUIProvider } from '@nextui-org/react';
import ReactDOM from 'react-dom/client';
import React from 'react';
import { message } from '@tauri-apps/api/dialog';
import { error } from 'tauri-plugin-log-api';

import { initStore } from './utils/store';
import { initEnv } from './utils/env';
import App from './App';

if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

initStore()
    .then(async () => {
        await initEnv();
        const rootElement = document.getElementById('root');
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <NextUIProvider>
                <NextThemesProvider attribute='class'>
                    <App />
                </NextThemesProvider>
            </NextUIProvider>
        );
    })
    .catch(async () => {
        await error('Application initialization failed; configuration defaults were not written').catch(() => {});
        await message(
            'Unable to load application configuration. Existing settings were not replaced with defaults. Please restart Pot or restore a valid configuration file.',
            {
                title: 'Pot',
                type: 'error',
            }
        );
    });
