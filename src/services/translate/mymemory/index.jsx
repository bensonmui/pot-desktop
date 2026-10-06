import { fetch } from '@tauri-apps/api/http';

// MyMemory's `q` parameter is limited to ~500 bytes per request, so long text
// must be split first.
const MAX_BYTES = 480;

function utf8Length(str) {
    let n = 0;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c < 0x80) {
            n += 1;
        } else if (c < 0x800) {
            n += 2;
        } else if (c >= 0xd800 && c <= 0xdbff) {
            n += 4;
            i++;
        } else {
            n += 3;
        }
    }
    return n;
}

function chunkText(text, maxBytes = MAX_BYTES) {
    if (utf8Length(text) <= maxBytes) {
        return [text];
    }
    const boundaries = '\n.!?。！？；;';
    const chunks = [];
    let cur = '';
    let curBytes = 0;
    let lastBoundary = -1;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const b = utf8Length(ch);
        if (curBytes + b > maxBytes && cur.length > 0) {
            if (lastBoundary > 0 && lastBoundary < cur.length) {
                chunks.push(cur.slice(0, lastBoundary));
                cur = cur.slice(lastBoundary);
                curBytes = utf8Length(cur);
            } else {
                chunks.push(cur);
                cur = '';
                curBytes = 0;
            }
            lastBoundary = -1;
        }
        cur += ch;
        curBytes += b;
        if (boundaries.includes(ch)) {
            lastBoundary = cur.length;
        }
    }
    if (cur) {
        chunks.push(cur);
    }
    return chunks;
}

// MyMemory has no auto-detect, so guess the source language from the text.
function resolveSource(from, text) {
    if (from && from !== 'auto') {
        return from;
    }
    if (/[\u3040-\u30ff]/.test(text)) {
        return 'ja';
    }
    if (/[\uac00-\ud7af]/.test(text)) {
        return 'ko';
    }
    if (/[\u4e00-\u9fff]/.test(text)) {
        return 'zh-CN';
    }
    return 'en';
}

export async function translate(text, from, to, options = {}) {
    const { config } = options;
    const email = (config && config.email) || '';
    const source = resolveSource(from, text);

    const chunks = chunkText(text, MAX_BYTES);
    let out = '';
    for (const chunk of chunks) {
        const query = { q: chunk, langpair: `${source}|${to}` };
        if (email) {
            query['de'] = email;
        }
        const res = await fetch('https://api.mymemory.translated.net/get', {
            method: 'GET',
            query,
        });
        if (!res.ok) {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
        const data = res.data;
        const translated = data && data.responseData && data.responseData.translatedText;
        if (!translated) {
            throw JSON.stringify(data);
        }
        const result = String(translated);
        const upper = result.toUpperCase();
        if (upper.includes('MYMEMORY WARNING') || upper.includes('QUERY LENGTH LIMIT')) {
            throw result;
        }
        out += result;
    }
    return out.trim();
}

export * from './Config';
export * from './info';
