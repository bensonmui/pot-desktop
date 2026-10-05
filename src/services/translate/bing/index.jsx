import { fetch } from '@tauri-apps/api/http';

// 舊版 edge.microsoft.com/translate/auth 已下線（404），改用 bing.com 網頁版
// ttranslatev3 + params_AbusePreventionHelper token。
const BING_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const BING_HOSTS = ['https://www.bing.com', 'https://cn.bing.com'];

async function getBingAuth() {
    let lastErr = '';
    for (const host of BING_HOSTS) {
        try {
            const page = await fetch(`${host}/translator`, {
                method: 'GET',
                responseType: 2, // Text
                headers: { 'User-Agent': BING_UA },
            });
            if (!page.ok) {
                lastErr = `GET ${host}/translator -> ${page.status}`;
                continue;
            }
            const html = typeof page.data === 'string' ? page.data : '';
            const ig = (html.match(/IG:"([^"]+)"/) || [])[1];
            const iid = (html.match(/data-iid="([^"]+)"/) || [])[1];
            const helper = html.match(/params_AbusePreventionHelper\s*=\s*\[([^\]]+)\]/);
            if (!ig || !iid || !helper) {
                lastErr = `parse auth failed on ${host}`;
                continue;
            }
            const arr = helper[1].replace(/"/g, '').split(',');
            if (!arr[0] || !arr[1]) {
                lastErr = `empty key/token on ${host}`;
                continue;
            }
            return { host, ig, iid, key: arr[0], token: arr[1] };
        } catch (e) {
            lastErr = `${host}: ${e}`;
        }
    }
    throw `Get Token Failed: ${lastErr}`;
}

export async function translate(text, from, to) {
    const fromLang = from === '' || from === 'auto' ? 'auto-detect' : from;

    const auth = await getBingAuth();

    const params = new URLSearchParams();
    params.set('fromLang', fromLang);
    params.set('text', text);
    params.set('to', to);
    params.set('token', auth.token);
    params.set('key', auth.key);

    const res = await fetch(
        `${auth.host}/ttranslatev3?isVertical=1&IG=${auth.ig}&IID=${auth.iid}`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'User-Agent': BING_UA,
            },
            body: { type: 'Text', payload: params.toString() },
        }
    );

    if (res.ok) {
        const result = res.data;
        if (
            Array.isArray(result) &&
            result[0] &&
            result[0].translations &&
            result[0].translations[0] &&
            result[0].translations[0].text
        ) {
            return result[0].translations[0].text.trim();
        }
        throw JSON.stringify(result);
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
