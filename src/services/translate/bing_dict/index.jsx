import { fetch } from '@tauri-apps/api/http';

// 舊版 /api/v6/dictionarywords/search?appid=... 已停用（403 Access disabled），
// 改用 bing.com 網頁版 tlookupv3 + params_AbusePreventionHelper token。
// 單詞 -> 回傳詞典卡片；句子/查不到 -> 自動回退為一般翻譯（回傳字串）。
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

function detectSource(text, from) {
    if (from && from !== 'auto' && from !== 'auto-detect') return from;
    if (/^[\u4e00-\u9fff]/.test(text)) return 'zh-Hans';
    return 'en';
}

function isSingleWord(text) {
    const t = (text || '').trim();
    if (!t) return false;
    if (/[\s,，。.!！?？;；:：\n\r\t]/.test(t)) return false;
    return t.length <= 30;
}

function buildDict(data, text) {
    const target = { pronunciations: [], explanations: [], associations: [], sentence: [] };
    const explanationMap = {};
    const assocMap = {};

    for (const entry of data) {
        const trs = entry.translations || [];
        for (const tr of trs) {
            const trait = (tr.posTag || '').toLowerCase();
            if (!explanationMap[trait]) {
                explanationMap[trait] = { trait, explains: [] };
                target.explanations.push(explanationMap[trait]);
            }
            if (tr.displayTarget && !explanationMap[trait].explains.includes(tr.displayTarget)) {
                explanationMap[trait].explains.push(tr.displayTarget);
            }
        }
        // 聯想詞只取信心度最高的義項，避免其他義項帶進不相關的回譯
        const top = trs.slice().sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
        for (const back of (top && top.backTranslations) || []) {
            const w = back.displayText;
            if (!w || w.toLowerCase() === text.toLowerCase()) continue;
            const freq = back.frequencyCount || 0;
            if (!(w in assocMap) || freq > assocMap[w]) assocMap[w] = freq;
        }
    }
    target.associations = Object.entries(assocMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map((x) => x[0]);
    return target;
}

async function translateText(auth, text, from, to) {
    const params = new URLSearchParams();
    params.set('fromLang', from);
    params.set('text', text);
    params.set('to', to);
    params.set('token', auth.token);
    params.set('key', auth.key);
    const res = await fetch(`${auth.host}/ttranslatev3?isVertical=1&IG=${auth.ig}&IID=${auth.iid}`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'User-Agent': BING_UA },
        body: { type: 'Text', payload: params.toString() },
    });
    if (res.ok && Array.isArray(res.data) && res.data[0] && res.data[0].translations && res.data[0].translations[0]) {
        return res.data[0].translations[0].text.trim();
    }
    throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
}

async function lookupDict(auth, text, from, to) {
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('text', text);
    params.set('to', to);
    params.set('token', auth.token);
    params.set('key', auth.key);
    const res = await fetch(`${auth.host}/tlookupv3?isVertical=1&IG=${auth.ig}&IID=${auth.iid}`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'User-Agent': BING_UA },
        body: { type: 'Text', payload: params.toString() },
    });
    if (res.ok && Array.isArray(res.data)) {
        const target = buildDict(res.data, text);
        if (target.explanations.length > 0) return target;
    }
    return null;
}

export async function translate(text, from, to) {
    const fromLang = detectSource(text, from);
    if (fromLang === to) {
        return text;
    }

    const auth = await getBingAuth();

    if (isSingleWord(text)) {
        try {
            const dict = await lookupDict(auth, text, fromLang, to);
            if (dict) return dict;
        } catch (e) {
            // ignore, fall back to translate
        }
    }

    return await translateText(auth, text, fromLang, to);
}

export * from './Config';
export * from './info';
