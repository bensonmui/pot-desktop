import { fetch } from '@tauri-apps/api/http';

function resolveCustomUrl(custom_url) {
    if (custom_url === undefined || custom_url === '') {
        custom_url = 'https://translate.google.com';
    }
    if (!custom_url.startsWith('http')) {
        custom_url = 'https://' + custom_url;
    }
    return custom_url;
}

// Primary endpoint (rich result: word dictionary + translation).
async function translateViaSingle(custom_url, text, from, to) {
    const res = await fetch(
        `${custom_url}/translate_a/single?dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t`,
        {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
            query: {
                client: 'gtx',
                sl: from,
                tl: to,
                hl: to,
                ie: 'UTF-8',
                oe: 'UTF-8',
                otf: '1',
                ssel: '0',
                tsel: '0',
                kc: '7',
                q: text,
            },
        }
    );

    if (!res.ok) {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }

    let result = res.data;
    // 词典模式
    if (result[1]) {
        let target = { pronunciations: [], explanations: [], associations: [], sentence: [] };
        // 发音
        if (result[0][1][3]) {
            target.pronunciations.push({ symbol: result[0][1][3], voice: '' });
        }
        // 释义
        for (let i of result[1]) {
            target.explanations.push({
                trait: i[0],
                explains: i[2].map((x) => {
                    return x[0];
                }),
            });
        }
        // 例句
        if (result[13]) {
            for (let i of result[13][0]) {
                target.sentence.push({ source: i[0] });
            }
        }
        return target;
    } else {
        // 翻译模式
        let target = '';
        for (let r of result[0]) {
            if (r[0]) {
                target = target + r[0];
            }
        }
        return target.trim();
    }
}

// Fallback endpoint. `translate.google.com` is frequently rate-limited (HTTP 429,
// "your computer or network may be sending automated queries"). This Chrome
// dictionary endpoint keeps working and returns the translation as text.
async function translateViaClients5(text, from, to) {
    const res = await fetch('https://clients5.google.com/translate_a/t', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        query: {
            client: 'dict-chrome-ex',
            sl: from,
            tl: to,
            q: text,
        },
    });

    if (!res.ok) {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }

    const data = res.data;
    if (!Array.isArray(data) || data[0] === undefined) {
        throw JSON.stringify(data);
    }

    const first = data[0];
    if (typeof first === 'string') {
        return first.trim();
    }
    if (Array.isArray(first)) {
        let segments = first.slice();
        // When sl=auto, the detected source language is appended as the last element.
        if (from === 'auto' && segments.length > 1) {
            const last = segments[segments.length - 1];
            if (typeof last === 'string' && /^[a-z]{2}(-[A-Za-z]{2,})?$/.test(last)) {
                segments = segments.slice(0, -1);
            }
        }
        return segments.join('').trim();
    }
    throw JSON.stringify(data);
}

// translate.google.com tends to rate-limit (HTTP 429) for a whole session, so once
// the primary endpoint fails we stop trying it and use the fallback directly.
let primaryUnavailable = false;

export async function translate(text, from, to, options = {}) {
    const { config } = options;
    const custom_url = resolveCustomUrl(config.custom_url);

    if (!primaryUnavailable) {
        try {
            return await translateViaSingle(custom_url, text, from, to);
        } catch (e) {
            primaryUnavailable = true;
        }
    }
    return await translateViaClients5(text, from, to);
}

export * from './Config';
export * from './info';
