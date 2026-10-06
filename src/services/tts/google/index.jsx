import { fetch, ResponseType } from '@tauri-apps/api/http';

// Google TTS rejects very long `q`, so split into small chunks first.
const MAX_CHARS = 180;

function chunkText(text, max = MAX_CHARS) {
    const chunks = [];
    let rest = text;
    while (rest.length > max) {
        let cut = -1;
        for (const sep of ['\n', '。', '！', '？', '. ', '! ', '? ', '；', ';', '，', ',', ' ']) {
            const i = rest.lastIndexOf(sep, max);
            if (i > cut) {
                cut = i + sep.length;
            }
        }
        if (cut <= 0) {
            cut = max;
        }
        chunks.push(rest.slice(0, cut));
        rest = rest.slice(cut);
    }
    if (rest) {
        chunks.push(rest);
    }
    return chunks;
}

export async function tts(text, lang, options = {}) {
    const chunks = chunkText(text);
    const buffers = [];
    for (const chunk of chunks) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
            lang
        )}&q=${encodeURIComponent(chunk)}`;
        const res = await fetch(url, {
            method: 'GET',
            responseType: ResponseType.Binary,
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (!res.ok) {
            throw `Http Request Error\nHttp Status: ${res.status}`;
        }
        buffers.push(new Uint8Array(res.data));
    }
    const total = buffers.reduce((n, b) => n + b.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const b of buffers) {
        out.set(b, offset);
        offset += b.length;
    }
    return out;
}

export * from './Config';
export * from './info';
