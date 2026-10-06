import { fetch } from '@tauri-apps/api/http';

export async function translate(text, from, to, options = {}) {
    const { config } = options;
    let base = (config && config.requestPath) || 'https://lingva.pot-app.com';
    if (!/^https?:\/\//.test(base)) {
        base = 'https://' + base;
    }
    base = base.replace(/\/+$/, '');

    let plain_text = text.replaceAll('/', '@@');
    let encode_text = encodeURIComponent(plain_text);
    const res = await fetch(`${base}/api/v1/${from}/${to}/${encode_text}`, {
        method: 'GET',
    });

    if (res.ok) {
        let result = res.data;
        const { translation } = result;
        if (translation) {
            return translation.replaceAll('@@', '/');
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
