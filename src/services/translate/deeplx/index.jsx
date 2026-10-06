import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to, options = {}) {
    const { config } = options;

    let base = (config && config.requestPath) || 'http://localhost:1188';
    if (!/^https?:\/\//.test(base)) {
        base = 'http://' + base;
    }
    base = base.replace(/\/+$/, '');

    const headers = { 'Content-Type': 'application/json' };
    if (config && config.accessToken) {
        headers['Authorization'] = `Bearer ${config.accessToken}`;
    }

    const res = await fetch(`${base}/translate`, {
        method: 'POST',
        headers,
        body: Body.json({ text, source_lang: from, target_lang: to }),
    });

    if (res.ok) {
        const data = res.data;
        if (data && data.code === 200 && data.data) {
            return data.data;
        }
        throw JSON.stringify(data);
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
