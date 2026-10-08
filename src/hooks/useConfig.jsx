import { useCallback, useEffect, useRef } from 'react';
import { useGetState } from './useGetState';
import {
    getConfigValue,
    initializeConfigValue,
    subscribeConfig,
    saveConfigValues,
    deleteConfigValue,
} from '../utils/store';
import { error } from 'tauri-plugin-log-api';

export const useConfig = (key, defaultValue, options = {}) => {
    const cached = getConfigValue(key);
    const [property, setPropertyState, getProperty] = useGetState(cached !== undefined ? cached : defaultValue);
    const { sync = true } = options;
    const changeRevision = useRef(0);
    const localEditRevision = useRef(0);
    const defaultValueRef = useRef(defaultValue);
    defaultValueRef.current = defaultValue;

    const syncToStore = useCallback(
        async (value) => {
            try {
                await saveConfigValues({ [key]: value });
            } catch {
                await error(`Failed to save configuration key: ${key}`).catch(() => {});
            }
        },
        [key]
    );

    const setProperty = useCallback(
        (value, forceSync = false) => {
            changeRevision.current += 1;
            localEditRevision.current += 1;
            setPropertyState(value);
            if (forceSync || sync) syncToStore(value);
        },
        [sync, syncToStore]
    );

    useEffect(() => {
        let active = true;
        let initializing = true;
        const initialRevision = changeRevision.current;
        const initialLocalEditRevision = localEditRevision.current;
        const unsubscribe = subscribeConfig(key, (value) => {
            if (!active) return;
            const preserveDraft = initializing && localEditRevision.current !== initialLocalEditRevision;
            changeRevision.current += 1;
            if (preserveDraft) return;
            setPropertyState(value === undefined ? defaultValueRef.current : value);
        });
        initializeConfigValue(key, defaultValueRef.current)
            .then((value) => {
                if (active && changeRevision.current === initialRevision) setPropertyState(value);
            })
            .catch(() => error(`Failed to initialize configuration key: ${key}`).catch(() => {}))
            .finally(() => {
                initializing = false;
            });
        return () => {
            active = false;
            unsubscribe();
        };
    }, [key]);

    return [property, setProperty, getProperty];
};

export const deleteKey = deleteConfigValue;
