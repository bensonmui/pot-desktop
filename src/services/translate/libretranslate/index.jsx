import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    let base = (config && config.requestPath) || 'https://libretranslate.com';
    if (!/^https?:\/\//.test(base)) {
        base = 'https://' + base;
    }
    base = base.replace(/\/+$/, '');

    const body = { q: text, source: from, target: to, format: 'text' };
    if (config && config.apiKey) {
        body.api_key = config.apiKey;
    }

    const res = await fetch(`${base}/translate`, {
        method: 'POST',
        body: Body.json(body),
    });

    if (res.ok) {
        const { translatedText } = res.data;
        if (translatedText) {
            return translatedText;
        }
        throw JSON.stringify(res.data);
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
