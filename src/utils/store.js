import { appConfigDir, join } from '@tauri-apps/api/path';
import { listen } from '@tauri-apps/api/event';
import { watch } from 'tauri-plugin-fs-watch-api';
import { invoke } from '@tauri-apps/api';
import { error } from 'tauri-plugin-log-api';

export let configSnapshot = {};
let configRevision = -1;
let snapshotReady = false;
const subscriptions = new Map();

function applySnapshot(snapshot) {
    if (
        !Number.isSafeInteger(snapshot.revision) ||
        !snapshot.values ||
        typeof snapshot.values !== 'object' ||
        Array.isArray(snapshot.values)
    ) {
        throw new Error('Invalid configuration snapshot');
    }
    if (snapshot.revision <= configRevision) return;
    const previous = configSnapshot;
    configSnapshot = { ...snapshot.values };
    configRevision = snapshot.revision;
    snapshotReady = true;
    for (const [key, callbacks] of subscriptions) {
        if (JSON.stringify(previous[key]) === JSON.stringify(configSnapshot[key])) continue;
        for (const callback of callbacks) callback(configSnapshot[key]);
    }
}

export function subscribeConfig(key, callback) {
    if (!subscriptions.has(key)) subscriptions.set(key, new Set());
    const callbacks = subscriptions.get(key);
    callbacks.add(callback);
    return () => {
        callbacks.delete(callback);
        if (callbacks.size === 0) subscriptions.delete(key);
    };
}

export function getConfigValue(key) {
    return Object.prototype.hasOwnProperty.call(configSnapshot, key) ? configSnapshot[key] : undefined;
}

class ConfigStore {
    async request(command, args = {}) {
        const snapshot = await invoke(command, args);
        applySnapshot(snapshot);
        return snapshot;
    }

    async get(key) {
        await this.request('get_config_snapshot');
        return getConfigValue(key) ?? null;
    }

    async has(key) {
        await this.request('get_config_snapshot');
        return Object.prototype.hasOwnProperty.call(configSnapshot, key);
    }

    async entries() {
        await this.request('get_config_snapshot');
        return Object.entries(configSnapshot);
    }

    set(key, value) {
        return this.write({ [key]: value });
    }

    delete(key) {
        return this.remove(key);
    }

    clear() {
        return this.replace({});
    }

    reset() {
        return this.clear();
    }

    load() {
        return this.request('reload_store');
    }

    save() {
        return this.request('get_config_snapshot');
    }

    write(values) {
        return this.request('write_config', { values });
    }

    replace(values) {
        if (!values || typeof values !== 'object' || Array.isArray(values)) {
            return Promise.reject(new Error('Configuration must be a JSON object'));
        }
        return this.request('replace_config', { values });
    }

    remove(key) {
        return this.request('delete_config', { key });
    }

    async initialize(key, defaultValue) {
        if (!snapshotReady) throw new Error('Configuration snapshot is unavailable');
        await this.request('initialize_config', { key, defaultValue: defaultValue ?? null });
        return getConfigValue(key);
    }
}

export const store = new ConfigStore();

export function initializeConfigValue(key, defaultValue) {
    return store.initialize(key, defaultValue);
}

export function saveConfigValues(values) {
    return store.write(values);
}

export function deleteConfigValue(key) {
    return store.remove(key);
}

export async function initStore() {
    const unlisten = await listen('config_updated', (event) => {
        try {
            applySnapshot(event.payload);
        } catch {
            void error('Failed to apply configuration update').catch(() => {});
        }
    });
    try {
        await store.request('get_config_snapshot');
        const appConfigDirectory = await appConfigDir();
        const appConfigPath = (await join(appConfigDirectory, 'config.json')).replaceAll('\\', '/');
        await watch(appConfigDirectory, async (events) => {
            if (!events.some((event) => event.path.replaceAll('\\', '/') === appConfigPath)) return;
            try {
                await store.load();
            } catch {
                await error('Failed to reload configuration; retaining the last valid snapshot').catch(() => {});
            }
        });
    } catch (failure) {
        unlisten();
        throw failure;
    }
}
