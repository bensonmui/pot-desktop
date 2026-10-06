import { Input, Button } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { INSTANCE_NAME_CONFIG_KEY } from '../../../utils/service_instance';

export function Config(props) {
    const { instanceKey, updateServiceList, onClose } = props;
    const { t } = useTranslation();

    const [config, setConfig] = useConfig(
        instanceKey,
        {
            [INSTANCE_NAME_CONFIG_KEY]: 'Lingva',
            requestPath: 'https://lingva.pot-app.com',
        },
        { sync: false }
    );

    return (
        config !== null && (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setConfig(config, true);
                    updateServiceList(instanceKey);
                    onClose();
                }}
            >
                <div className='config-item'>
                    <Input
                        label={t('services.instance_name')}
                        labelPlacement='outside-left'
                        value={config[INSTANCE_NAME_CONFIG_KEY]}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setConfig({ ...config, [INSTANCE_NAME_CONFIG_KEY]: value });
                        }}
                    />
                </div>
                <div className='config-item'>
                    <Input
                        label={t('config.svc_request_path')}
                        labelPlacement='outside-left'
                        value={config['requestPath']}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setConfig({ ...config, requestPath: value });
                        }}
                    />
                </div>
                <p className='text-[10px] text-default-700'>{t('config.svc_lingva_hint')}</p>
                <br />
                <Button
                    type='submit'
                    fullWidth
                    color='primary'
                >
                    {t('common.save')}
                </Button>
            </form>
        )
    );
}
