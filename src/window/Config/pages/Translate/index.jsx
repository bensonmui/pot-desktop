import { DropdownTrigger } from '@nextui-org/react';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@nextui-org/react';
import { Dropdown } from '@nextui-org/react';
import { Switch } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Card } from '@nextui-org/react';
import { Tooltip } from '@nextui-org/react';
import React from 'react';

import { languageList } from '../../../../utils/language';
import { useConfig } from '../../../../hooks/useConfig';
import { invoke } from '@tauri-apps/api';
import { BiInfoCircle } from 'react-icons/bi';

function Tip({ content }) {
    return (
        <Tooltip
            content={content}
            className='max-w-[280px]'
        >
            <span className='flex items-center'>
                <BiInfoCircle
                    className='text-default-400 hover:text-default-600 cursor-help'
                    size={16}
                />
            </span>
        </Tooltip>
    );
}

export default function Translate() {
    const [sourceLanguage, setSourceLanguage] = useConfig('translate_source_language', 'auto');
    const [targetLanguage, setTargetLanguage] = useConfig('translate_target_language', 'zh_cn');
    const [secondLanguage, setSecondLanguage] = useConfig('translate_second_language', 'en');
    const [detectEngine, setDetectEngine] = useConfig('translate_detect_engine', 'local');
    const [autoCopy, setAutoCopy] = useConfig('translate_auto_copy', 'disable');
    const [incrementalTranslate, setIncrementalTranslate] = useConfig('incremental_translate', false);
    const [historyDisable, setHistoryDisable] = useConfig('history_disable', false);
    const [dynamicTranslate, setDynamicTranslate] = useConfig('dynamic_translate', false);
    const [deleteNewline, setDeleteNewline] = useConfig('translate_delete_newline', false);
    const [translateCache, setTranslateCache] = useConfig('translate_cache', true);
    const [markdownRender, setMarkdownRender] = useConfig('translate_markdown', false);
    const [rememberLanguage, setRememberLanguage] = useConfig('translate_remember_language', false);
    // const [translateFontSize, setTranslateFontSize] = useConfig('translate_font_size', 16);
    const [windowPosition, setWindowPosition] = useConfig('translate_window_position', 'mouse');
    const [rememberWindowSize, setRememberWindowSize] = useConfig('translate_remember_window_size', false);
    const [hideSource, setHideSource] = useConfig('hide_source', false);
    const [hideLanguage, setHideLanguage] = useConfig('hide_language', false);
    const [hideWindow, setHideWindow] = useConfig('translate_hide_window', false);
    const [sideBySide, setSideBySide] = useConfig('translate_side_by_side', false);
    const [windowOpacity, setWindowOpacity] = useConfig('translate_window_opacity', 1);
    const [windowZoom, setWindowZoom] = useConfig('translate_window_zoom', 1);
    const [snapEdges, setSnapEdges] = useConfig('translate_snap_edges', false);
    const [uiGlass, setUiGlass] = useConfig('ui_glass', true);
    const [uiGlow, setUiGlow] = useConfig('ui_glow', true);
    const [uiSpotlight, setUiSpotlight] = useConfig('ui_spotlight', true);
    const [uiTechBg, setUiTechBg] = useConfig('ui_tech_bg', true);
    const [uiAnimations, setUiAnimations] = useConfig('ui_animations', true);
    const [uiShimmer, setUiShimmer] = useConfig('ui_shimmer', true);
    const [closeOnBlur, setCloseOnBlur] = useConfig('translate_close_on_blur', true);
    const [alwaysOnTop, setAlwaysOnTop] = useConfig('translate_always_on_top', false);
    const { t } = useTranslation();

    return (
        <>
            <Card className='mb-[10px]'>
                <CardBody>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.source_language')}</h3>
                        {sourceLanguage !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`languages.${sourceLanguage}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='source language'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setSourceLanguage(key);
                                    }}
                                >
                                    <DropdownItem key='auto'>{t('languages.auto')}</DropdownItem>
                                    {languageList.map((item) => {
                                        return <DropdownItem key={item}>{t(`languages.${item}`)}</DropdownItem>;
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.target_language')}</h3>
                        {targetLanguage !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`languages.${targetLanguage}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='target language'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setTargetLanguage(key);
                                    }}
                                >
                                    {languageList.map((item) => {
                                        return <DropdownItem key={item}>{t(`languages.${item}`)}</DropdownItem>;
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.second_language')}</h3>
                        {secondLanguage !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`languages.${secondLanguage}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='second language'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setSecondLanguage(key);
                                    }}
                                >
                                    {languageList.map((item) => {
                                        return <DropdownItem key={item}>{t(`languages.${item}`)}</DropdownItem>;
                                    })}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.detect_engine')}</h3>
                        {detectEngine !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`config.translate.${detectEngine}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='detect engine'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setDetectEngine(key);
                                    }}
                                >
                                    <DropdownItem key='baidu'>{t(`config.translate.baidu`)}</DropdownItem>
                                    <DropdownItem key='tencent'>{t(`config.translate.tencent`)}</DropdownItem>
                                    <DropdownItem key='niutrans'>{t(`config.translate.niutrans`)}</DropdownItem>
                                    <DropdownItem key='google'>{t(`config.translate.google`)}</DropdownItem>
                                    <DropdownItem key='bing'>{t(`config.translate.bing`)}</DropdownItem>
                                    <DropdownItem key='yandex'>{t(`config.translate.yandex`)}</DropdownItem>
                                    <DropdownItem key='local'>{t(`config.translate.local`)}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                </CardBody>
            </Card>
            <Card className='mb-[10px]'>
                <CardBody>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.auto_copy')}</h3>
                        {autoCopy !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`config.translate.${autoCopy}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='auto copy'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setAutoCopy(key);
                                        invoke('update_tray', { language: '', copyMode: key });
                                    }}
                                >
                                    <DropdownItem key='source'>{t('config.translate.source')}</DropdownItem>
                                    <DropdownItem key='target'>{t('config.translate.target')}</DropdownItem>
                                    <DropdownItem key='source_target'>
                                        {t('config.translate.source_target')}
                                    </DropdownItem>
                                    <DropdownItem key='disable'>{t('config.translate.disable')}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3>{t('config.translate.history_disable')}</h3>
                        {historyDisable !== null && (
                            <Switch
                                isSelected={historyDisable}
                                onValueChange={(v) => {
                                    setHistoryDisable(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.incremental_translate')}</h3>
                        {incrementalTranslate !== null && (
                            <div className='flex items-center gap-2'>
                                <Tip content={t('config.translate.incremental_translate_tip')} />
                                <Switch
                                    isSelected={incrementalTranslate}
                                    onValueChange={(v) => {
                                        setIncrementalTranslate(v);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.dynamic_translate')}</h3>
                        {dynamicTranslate !== null && (
                            <div className='flex items-center gap-2'>
                                <Tip content={t('config.translate.dynamic_translate_tip')} />
                                <Switch
                                    isSelected={dynamicTranslate}
                                    onValueChange={(v) => {
                                        setDynamicTranslate(v);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.delete_newline')}</h3>
                        {deleteNewline !== null && (
                            <div className='flex items-center gap-2'>
                                <Tip content={t('config.translate.delete_newline_tip')} />
                                <Switch
                                    isSelected={deleteNewline}
                                    onValueChange={(v) => {
                                        setDeleteNewline(v);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.translation_cache')}</h3>
                        {translateCache !== null && (
                            <div className='flex items-center gap-2'>
                                <Tip content={t('config.translate.translation_cache_tip')} />
                                <Switch
                                    isSelected={translateCache}
                                    onValueChange={(v) => {
                                        setTranslateCache(v);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.render_markdown')}</h3>
                        {markdownRender !== null && (
                            <div className='flex items-center gap-2'>
                                <Tip content={t('config.translate.render_markdown_tip')} />
                                <Switch
                                    isSelected={markdownRender}
                                    onValueChange={(v) => {
                                        setMarkdownRender(v);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.remember_language')}</h3>
                        {rememberLanguage !== null && (
                            <Switch
                                isSelected={rememberLanguage}
                                onValueChange={(v) => {
                                    setRememberLanguage(v);
                                }}
                            />
                        )}
                    </div>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    {/* <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.font_size.title')}</h3>
                        {translateFontSize !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>
                                        {t(`config.translate.font_size.${translateFontSize}`)}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='window position'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setTranslateFontSize(key);
                                    }}
                                >
                                    <DropdownItem key={10}>{t(`config.translate.font_size.10`)}</DropdownItem>
                                    <DropdownItem key={12}>{t(`config.translate.font_size.12`)}</DropdownItem>
                                    <DropdownItem key={14}>{t(`config.translate.font_size.14`)}</DropdownItem>
                                    <DropdownItem key={16}>{t(`config.translate.font_size.16`)}</DropdownItem>
                                    <DropdownItem key={18}>{t(`config.translate.font_size.18`)}</DropdownItem>
                                    <DropdownItem key={20}>{t(`config.translate.font_size.20`)}</DropdownItem>
                                    <DropdownItem key={24}>{t(`config.translate.font_size.24`)}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div> */}
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.window_position')}</h3>
                        {windowPosition !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{t(`config.translate.${windowPosition}`)}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='window position'
                                    className='max-h-[50vh] overflow-y-auto'
                                    onAction={(key) => {
                                        setWindowPosition(key);
                                    }}
                                >
                                    <DropdownItem key='mouse'>{t('config.translate.mouse')}</DropdownItem>
                                    <DropdownItem key='pre_state'>{t('config.translate.pre_state')}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.remember_window_size')}</h3>
                        {rememberWindowSize !== null && (
                            <Switch
                                isSelected={rememberWindowSize}
                                onValueChange={(v) => {
                                    setRememberWindowSize(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.close_on_blur')}</h3>
                        {closeOnBlur !== null && (
                            <Switch
                                isSelected={closeOnBlur}
                                onValueChange={(v) => {
                                    setCloseOnBlur(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.always_on_top')}</h3>
                        {alwaysOnTop !== null && (
                            <Switch
                                isSelected={alwaysOnTop}
                                onValueChange={(v) => {
                                    setAlwaysOnTop(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.hide_source')}</h3>
                        {hideSource !== null && (
                            <Switch
                                isSelected={hideSource}
                                onValueChange={(v) => {
                                    setHideSource(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.hide_language')}</h3>
                        {hideLanguage !== null && (
                            <Switch
                                isSelected={hideLanguage}
                                onValueChange={(v) => {
                                    setHideLanguage(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.hide_window')}</h3>
                        {hideWindow !== null && (
                            <Switch
                                isSelected={hideWindow}
                                onValueChange={(v) => {
                                    setHideWindow(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.side_by_side')}</h3>
                        {sideBySide !== null && (
                            <Switch
                                isSelected={sideBySide}
                                onValueChange={(v) => {
                                    setSideBySide(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.window_opacity')}</h3>
                        {windowOpacity !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{`${Math.round(windowOpacity * 100)}%`}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='window opacity'
                                    onAction={(key) => {
                                        setWindowOpacity(Number(key));
                                    }}
                                >
                                    {[1, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6].map((v) => (
                                        <DropdownItem key={v}>{`${Math.round(v * 100)}%`}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.window_zoom')}</h3>
                        {windowZoom !== null && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant='bordered'>{`${Math.round(windowZoom * 100)}%`}</Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label='window zoom'
                                    onAction={(key) => {
                                        setWindowZoom(Number(key));
                                    }}
                                >
                                    {[0.8, 0.9, 1, 1.1, 1.25, 1.5].map((v) => (
                                        <DropdownItem key={v}>{`${Math.round(v * 100)}%`}</DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.snap_edges')}</h3>
                        {snapEdges !== null && (
                            <Switch
                                isSelected={snapEdges}
                                onValueChange={(v) => {
                                    setSnapEdges(v);
                                }}
                            />
                        )}
                    </div>
                </CardBody>
            </Card>
            <Card className='mt-[10px]'>
                <CardBody>
                    <h3 className='my-auto mx-0 font-bold'>{t('config.translate.appearance')}</h3>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.ui_glass')}</h3>
                        {uiGlass !== null && (
                            <Switch
                                isSelected={uiGlass}
                                onValueChange={(v) => {
                                    setUiGlass(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.ui_glow')}</h3>
                        {uiGlow !== null && (
                            <Switch
                                isSelected={uiGlow}
                                onValueChange={(v) => {
                                    setUiGlow(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.ui_spotlight')}</h3>
                        {uiSpotlight !== null && (
                            <Switch
                                isSelected={uiSpotlight}
                                onValueChange={(v) => {
                                    setUiSpotlight(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.ui_tech_bg')}</h3>
                        {uiTechBg !== null && (
                            <Switch
                                isSelected={uiTechBg}
                                onValueChange={(v) => {
                                    setUiTechBg(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.ui_animations')}</h3>
                        {uiAnimations !== null && (
                            <Switch
                                isSelected={uiAnimations}
                                onValueChange={(v) => {
                                    setUiAnimations(v);
                                }}
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto mx-0'>{t('config.translate.ui_shimmer')}</h3>
                        {uiShimmer !== null && (
                            <Switch
                                isSelected={uiShimmer}
                                onValueChange={(v) => {
                                    setUiShimmer(v);
                                }}
                            />
                        )}
                    </div>
                </CardBody>
            </Card>
        </>
    );
}
