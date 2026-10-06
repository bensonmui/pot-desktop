import { translate as googleTranslate } from '../google';
import { translate as bingTranslate } from '../bing';
import { translate as mymemoryTranslate } from '../mymemory';

// Bing uses Microsoft language codes for Chinese.
function mapForBing(code) {
    if (!code || code === 'auto') {
        return 'auto';
    }
    if (code === 'zh-CN') {
        return 'zh-Hans';
    }
    if (code === 'zh-TW') {
        return 'zh-Hant';
    }
    return code;
}

const PROVIDERS = {
    google: { fn: googleTranslate, map: (code) => code },
    bing: { fn: bingTranslate, map: mapForBing },
    mymemory: { fn: mymemoryTranslate, map: (code) => code },
};

const DEFAULT_ORDER = 'google,bing,mymemory';

// Tries each provider in order and returns the first successful result, so a
// single rate-limited or broken service no longer fails the whole translation.
export async function translate(text, from, to, options = {}) {
    const { config } = options;
    const order = String((config && config.providers) || DEFAULT_ORDER)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => PROVIDERS[s]);

    const errors = [];
    for (const name of order) {
        const provider = PROVIDERS[name];
        try {
            const result = await provider.fn(text, provider.map(from), provider.map(to), { config: {} });
            if (result !== undefined && result !== null && result !== '') {
                return result;
            }
        } catch (e) {
            errors.push(`${name}: ${e}`);
        }
    }
    throw `All providers failed:\n${errors.join('\n')}`;
}

export * from './Config';
export * from './info';
