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
import { getServiceHealthOf, setServiceHealth } from '../../../../../../utils/service_health';
import { testTranslateService } from '../../../../../../utils/service_test';
import { INSTANCE_NAME_CONFIG_KEY, ServiceSourceType, getDisplayInstanceName, getServiceName, getServiceSouceType } from '../../../../../../utils/service_instance';

export default function ServiceItem(props) {
    const { serviceInstanceKey, pluginList, deleteServiceInstance, setCurrentConfigKey, onConfigOpen, ...drag } = props;
    const { t } = useTranslation();
    const [serviceInstanceConfig, setServiceInstanceConfig] = useConfig(serviceInstanceKey, {});
    const [testing, setTesting] = useState(false);
    const [health, setHealth] = useState(() => getServiceHealthOf(serviceInstanceKey));
    const toastStyle = useToastStyle();

    const serviceSourceType = getServiceSouceType(serviceInstanceKey)
    const serviceName = getServiceName(serviceInstanceKey)

    const runTest = async () => {
        if (testing) {
            return;
        }
        setTesting(true);
        try {
            const r = await testTranslateService(serviceInstanceKey, serviceInstanceConfig);
            const value = { ok: true, ms: r.ms, preview: r.preview, ts: Date.now() };
            setHealth(value);
            setServiceHealth(serviceInstanceKey, value);
            toast.success(`${t('config.service.test_success')} · ${r.ms}ms · ${r.preview}`, { style: toastStyle });
        } catch (e) {
            const value = { ok: false, msg: String(e).slice(0, 140), ts: Date.now() };
            setHealth(value);
            setServiceHealth(serviceInstanceKey, value);
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
                    {health && (
                        <Tooltip
                            content={
                                health.ok
                                    ? `${t('config.service.health_ok')} · ${health.ms}ms · ${health.preview ?? ''}`
                                    : `${t('config.service.health_fail')}: ${health.msg ?? ''}`
                            }
                        >
                            <span
                                className={`my-auto mr-2 h-[8px] w-[8px] rounded-full ${
                                    health.ok ? 'bg-success' : 'bg-danger'
                                }`}
                            />
                        </Tooltip>
                    )}
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
