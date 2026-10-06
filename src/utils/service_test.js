// 測試單一翻譯服務是否可用（送一句 "hello"）。回傳 { ok, ms, preview } 或丟出錯誤。
import * as builtinServices from '../services/translate';
import { invoke_plugin } from './invoke_plugin';
import { ServiceSourceType, getServiceName, getServiceSouceType } from './service_instance';

export async function testTranslateService(serviceInstanceKey, config) {
    const started = Date.now();
    const sourceType = getServiceSouceType(serviceInstanceKey);
    const serviceName = getServiceName(serviceInstanceKey);

    let result;
    if (sourceType === ServiceSourceType.PLUGIN) {
        const [func, utils] = await invoke_plugin('translate', serviceName);
        result = await func('hello', 'en', 'zh', { config, utils });
    } else {
        const LanguageEnum = builtinServices[serviceName].Language || {};
        const from = LanguageEnum.en ?? LanguageEnum.auto;
        const to = LanguageEnum.zh_cn ?? LanguageEnum.zh_tw ?? LanguageEnum.en ?? LanguageEnum.auto;
        result = await builtinServices[serviceName].translate('hello', from, to, { config });
    }

    return {
        ok: true,
        ms: Date.now() - started,
        preview: String(result ?? '')
            .replace(/\s+/g, ' ')
            .slice(0, 40),
    };
}
