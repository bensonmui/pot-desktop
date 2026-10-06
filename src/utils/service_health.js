// 服務健康狀態（存在 localStorage，供「服務設定」顯示上次測試結果）
const KEY = 'pot_service_health';

export function getServiceHealth() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
        return {};
    }
}

export function getServiceHealthOf(instanceKey) {
    return getServiceHealth()[instanceKey];
}

export function setServiceHealth(instanceKey, value) {
    try {
        const all = getServiceHealth();
        all[instanceKey] = value;
        localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
        // ignore
    }
}

export function clearServiceHealth() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // ignore
    }
}
