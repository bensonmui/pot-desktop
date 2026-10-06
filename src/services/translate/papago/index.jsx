import { fetch } from '@tauri-apps/api/http';

// Naver Papago OpenAPI allows up to 5000 characters per request.
const MAX_CHUNK = 4000;

function chunkText(text, limit = MAX_CHUNK) {
    if (text.length <= limit) {
        return [text];
    }
    const boundaries = '\n.!?。！？；;';
    const chunks = [];
    let remaining = text;
    const min = Math.floor(limit * 0.6);
    while (remaining.length > limit) {
        let cut = -1;
        for (let i = limit; i > min; i--) {
            if (boundaries.includes(remaining[i - 1])) {
                cut = i;
                break;
            }
        }
        if (cut === -1) {
            for (let i = limit; i > min; i--) {
                if (/\s/.test(remaining[i - 1])) {
                    cut = i;
                    break;
                }
            }
        }
        if (cut === -1) {
            cut = limit;
        }
        chunks.push(remaining.slice(0, cut));
        remaining = remaining.slice(cut);
    }
    if (remaining) {
        chunks.push(remaining);
    }
    return chunks;
}

export async function translate(text, from, to, options = {}) {
    const { config } = options;
    const clientId = (config && config.clientId) || '';
    const clientSecret = (config && config.clientSecret) || '';

    if (!clientId || !clientSecret) {
        throw 'Papago requires a Client ID and Client Secret (free from Naver Developers).';
    }

    const chunks = chunkText(text, MAX_CHUNK);
    let out = '';
    for (const chunk of chunks) {
        const params = new URLSearchParams();
        params.set('source', from);
        params.set('target', to);
        params.set('text', chunk);

        const res = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
            body: { type: 'Text', payload: params.toString() },
        });

        if (res.ok) {
            const translated =
                res.data && res.data.message && res.data.message.result && res.data.message.result.translatedText;
            if (translated) {
                out += translated;
            } else {
                throw JSON.stringify(res.data);
            }
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
    return out.trim();
}

export * from './Config';
export * from './info';
