import { Card, Button, CardFooter, Dropdown, DropdownMenu, DropdownTrigger, DropdownItem } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { BiTransferAlt } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';

import { languageList } from '../../../../utils/language';
import { detectLanguageAtom } from '../SourceArea';
import { useConfig } from '../../../../hooks';

export const sourceLanguageAtom = atom();
export const targetLanguageAtom = atom();

export default function LanguageArea() {
    const [rememberLanguage] = useConfig('translate_remember_language', false);
    const [translateSourceLanguage, setTranslateSourceLanguage] = useConfig('translate_source_language', 'auto');
    const [translateTargetLanguage, setTranslateTargetLanguage] = useConfig('translate_target_language', 'zh_cn');
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');
    const [uiGlass] = useConfig('ui_glass', true);

    const [sourceLanguage, setSourceLanguage] = useAtom(sourceLanguageAtom);
    const [targetLanguage, setTargetLanguage] = useAtom(targetLanguageAtom);
    const detectLanguage = useAtomValue(detectLanguageAtom);
    const { t } = useTranslation();
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (translateSourceLanguage) {
            setSourceLanguage(translateSourceLanguage);
        }
        if (translateTargetLanguage) {
            setTargetLanguage(translateTargetLanguage);
        }
    }, [translateSourceLanguage, translateTargetLanguage]);

    useEffect(() => {
        if (rememberLanguage !== null && rememberLanguage) {
            setTranslateSourceLanguage(sourceLanguage);
            setTranslateTargetLanguage(targetLanguage);
        }
    }, [sourceLanguage, targetLanguage, rememberLanguage]);

    return (
        <Card
            shadow='none'
            className={`${uiGlass ? 'bg-content2/60 glass' : 'bg-content2'} h-[35px] rounded-[10px]`}
        >
            <CardFooter className={`${uiGlass ? 'bg-content2/60' : 'bg-content2'} flex justify-between p-0 rounded-[10px]`}>
                <div className='flex'>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                radius='sm'
                                variant='light'
                            >
                                <AnimatePresence
                                    mode='wait'
                                    initial={false}
                                >
                                    <motion.span
                                        key={sourceLanguage}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.14 }}
                                    >
                                        {t(`languages.${sourceLanguage}`)}
                                    </motion.span>
                                </AnimatePresence>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='Source Language'
                            className='max-h-[50vh] overflow-y-auto'
                            onAction={(key) => {
                                setSourceLanguage(key);
                            }}
                        >
                            <DropdownItem key='auto'>{t('languages.auto')}</DropdownItem>
                            {languageList.map((x) => {
                                return <DropdownItem key={x}>{t(`languages.${x}`)}</DropdownItem>;
                            })}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className='flex'>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='light'
                        className='text-[20px]'
                        onPress={async () => {
                            setRotation((r) => r + 180);
                            if (sourceLanguage !== 'auto') {
                                const oldSourceLanguage = sourceLanguage;
                                setSourceLanguage(targetLanguage);
                                setTargetLanguage(oldSourceLanguage);
                            } else {
                                if (detectLanguage !== '') {
                                    if (targetLanguage === translateTargetLanguage) {
                                        setTargetLanguage(detectLanguage);
                                    } else {
                                        setTargetLanguage(translateTargetLanguage);
                                    }
                                } else {
                                    if (targetLanguage === translateSecondLanguage) {
                                        setTargetLanguage(translateTargetLanguage);
                                    } else {
                                        setTargetLanguage(secondLanguage);
                                    }
                                }
                            }
                        }}
                    >
                        <motion.span
                            animate={{ rotate: rotation }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                            className='flex'
                        >
                            <BiTransferAlt />
                        </motion.span>
                    </Button>
                </div>
                <div className='flex'>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                radius='sm'
                                variant='light'
                            >
                                <AnimatePresence
                                    mode='wait'
                                    initial={false}
                                >
                                    <motion.span
                                        key={targetLanguage}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.14 }}
                                    >
                                        {t(`languages.${targetLanguage}`)}
                                    </motion.span>
                                </AnimatePresence>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='Target Language'
                            className='max-h-[50vh] overflow-y-auto'
                            onAction={(key) => {
                                setTargetLanguage(key);
                            }}
                        >
                            {languageList.map((x) => {
                                return <DropdownItem key={x}>{t(`languages.${x}`)}</DropdownItem>;
                            })}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </CardFooter>
        </Card>
    );
}
