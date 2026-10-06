// In-memory translation cache. Keyed by service instance + languages + text.
// Helps when the same text is translated repeatedly (faster, saves API quota
// for services with daily limits such as Bing / MyMemory).

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 300;

const store = new Map();

function makeKey(serviceInstanceKey, text, from, to) {
    return `${serviceInstanceKey}\u0000${from}\u0000${to}\u0000${text}`;
}

export function cacheGet(serviceInstanceKey, text, from, to) {
    const k = makeKey(serviceInstanceKey, text, from, to);
    const hit = store.get(k);
    if (!hit) {
        return undefined;
    }
    if (Date.now() - hit.t > TTL_MS) {
        store.delete(k);
        return undefined;
    }
    return hit.v;
}

export function cacheSet(serviceInstanceKey, text, from, to, value) {
    if (value === undefined || value === null || value === '') {
        return;
    }
    const k = makeKey(serviceInstanceKey, text, from, to);
    store.set(k, { v: value, t: Date.now() });
    if (store.size > MAX_ENTRIES) {
        // Drop the oldest inserted entry.
        const oldest = store.keys().next().value;
        store.delete(oldest);
    }
}
