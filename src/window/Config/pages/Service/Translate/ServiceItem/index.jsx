import { RxDragHandleHorizontal } from 'react-icons/rx';
import { Spacer, Button, Switch, Tooltip } from '@nextui-org/react';
import { MdDeleteOutline } from 'react-icons/md';
import { TbBolt } from 'react-icons/tb';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BiSolidEdit } from 'react-icons/bi';
import React, { useState } from 'react';

import * as builtinServices from '../../../../../../services/translate';
import { useConfig, useToastStyle } from '../../../../../../hooks';
import { invoke_plugin } from '../../../../../../utils/invoke_plugin';
import { INSTANCE_NAME_CONFIG_KEY, ServiceSourceType, getDisplayInstanceName, getServiceName, getServiceSouceType } from '../../../../../../utils/service_instance';

export default function ServiceItem(props) {
    const { serviceInstanceKey, pluginList, deleteServiceInstance, setCurrentConfigKey, onConfigOpen, ...drag } = props;
    const { t } = useTranslation();
    const [serviceInstanceConfig, setServiceInstanceConfig] = useConfig(serviceInstanceKey, {});
    const [testing, setTesting] = useState(false);
    const toastStyle = useToastStyle();

    const serviceSourceType = getServiceSouceType(serviceInstanceKey)
    const serviceName = getServiceName(serviceInstanceKey)

    const runTest = async () => {
        if (testing) {
            return;
        }
        setTesting(true);
        const started = Date.now();
        try {
            let result;
            if (serviceSourceType === ServiceSourceType.PLUGIN) {
                const [func, utils] = await invoke_plugin('translate', serviceName);
                result = await func('hello', 'en', 'zh', { config: serviceInstanceConfig, utils });
            } else {
                const LanguageEnum = builtinServices[serviceName].Language || {};
                const from = LanguageEnum.en ?? LanguageEnum.auto;
                const to = LanguageEnum.zh_cn ?? LanguageEnum.zh_tw ?? LanguageEnum.en ?? LanguageEnum.auto;
                result = await builtinServices[serviceName].translate('hello', from, to, {
                    config: serviceInstanceConfig,
                });
            }
            const ms = Date.now() - started;
            const preview = String(result ?? '').replace(/\s+/g, ' ').slice(0, 40);
            toast.success(`${t('config.service.test_success')} · ${ms}ms · ${preview}`, { style: toastStyle });
        } catch (e) {
            toast.error(`${t('config.service.test_failed')}: ${String(e).slice(0, 140)}`, { style: toastStyle });
        } finally {
            setTesting(false);
        }
    };

    return serviceSourceType === ServiceSourceType.PLUGIN && !(serviceName in pluginList) ? (
        <></>
    ) : (
        serviceInstanceConfig !== null && (
            <div className='bg-content2 rounded-md px-[10px] py-[20px] flex justify-between'>
                <div className='flex'>
                    <div
                        {...drag}
                        className='text-2xl my-auto'
                    >
                        <RxDragHandleHorizontal />
                    </div>

                    <Spacer x={2} />
                    {serviceSourceType === ServiceSourceType.BUILDIN && (
                        <>
                            <img
                                src={`${builtinServices[serviceName].info.icon}`}
                                className='h-[24px] w-[24px] my-auto'
                                draggable={false}
                            />
                            <Spacer x={2} />
                            <h2 className='my-auto'>{getDisplayInstanceName(serviceInstanceConfig[INSTANCE_NAME_CONFIG_KEY], () => t(`services.translate.${serviceName}.title`))}</h2>
                        </>
                    )}
                    {serviceSourceType === ServiceSourceType.PLUGIN && (
                        <>
                            <img
                                src={pluginList[serviceName].icon}
                                className='h-[24px] w-[24px] my-auto'
                                draggable={false}
                            />
                            <Spacer x={2} />
                            <h2 className='my-auto'>{getDisplayInstanceName(serviceInstanceConfig[INSTANCE_NAME_CONFIG_KEY], () => pluginList[serviceName].display) +  `[${t('common.plugin')}]`}</h2>
                        </>
                    )}
                </div>
                <div className='flex'>
                    <Tooltip content={t('config.service.test')}>
                        <Button
                            isIconOnly
                            size='sm'
                            variant='light'
                            isLoading={testing}
                            onPress={runTest}
                        >
                            <TbBolt className='text-2xl' />
                        </Button>
                    </Tooltip>
                    <Switch
                        size='sm'
                        isSelected={serviceInstanceConfig['enable'] ?? true}
                        onValueChange={(v) => {
                            setServiceInstanceConfig({ ...serviceInstanceConfig, enable: v });
                        }}
                    />
                    <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        onPress={() => {
                            setCurrentConfigKey(serviceInstanceKey);
                            onConfigOpen();
                        }}
                    >
                        <BiSolidEdit className='text-2xl' />
                    </Button>
                    <Spacer x={2} />
                    <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        color='danger'
                        onPress={() => {
                            deleteServiceInstance(serviceInstanceKey);
                        }}
                    >
                        <MdDeleteOutline className='text-2xl' />
                    </Button>
                </div>
            </div>
        )
    );
}
