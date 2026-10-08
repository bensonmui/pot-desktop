import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { appWindow, currentMonitor, LogicalSize, LogicalPosition } from '@tauri-apps/api/window';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { Spacer, Button } from '@nextui-org/react';
import { AiFillCloseCircle } from 'react-icons/ai';
import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { BsPinFill } from 'react-icons/bs';
import { motion } from 'framer-motion';

import LanguageArea from './components/LanguageArea';
import SourceArea from './components/SourceArea';
import TargetArea from './components/TargetArea';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import { store, saveConfigValues } from '../../utils/store';
import { info } from 'tauri-plugin-log-api';

let blurTimeout = null;
let resizeTimeout = null;
let moveTimeout = null;

const listenBlur = () => {
    return listen('tauri://blur', () => {
        if (appWindow.label === 'translate') {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            info('Blur');
            // 100ms后关闭窗口，因为在 windows 下拖动窗口时会先切换成 blur 再立即切换成 focus
            // 如果直接关闭将导致窗口无法拖动
            blurTimeout = setTimeout(async () => {
                info('Confirm Blur');
                await appWindow.close();
            }, 100);
        }
    });
};

let unlisten = listenBlur();
// 取消 blur 监听
const unlistenBlur = () => {
    unlisten.then((f) => {
        f();
    });
};

// 监听 focus 事件取消 blurTimeout 时间之内的关闭窗口
void listen('tauri://focus', () => {
    info('Focus');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});
// 监听 move 事件取消 blurTimeout 时间之内的关闭窗口
void listen('tauri://move', () => {
    info('Move');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});

export default function Translate() {
    const [closeOnBlur] = useConfig('translate_close_on_blur', true);
    const [alwaysOnTop] = useConfig('translate_always_on_top', false);
    const [windowPosition] = useConfig('translate_window_position', 'mouse');
    const [rememberWindowSize] = useConfig('translate_remember_window_size', false);
    const [translateServiceInstanceList, setTranslateServiceInstanceList] = useConfig('translate_service_list', [
        'deepl',
        'bing',
        'lingva',
        'yandex',
        'google',
        'ecdict',
    ]);
    const [recognizeServiceInstanceList] = useConfig('recognize_service_list', ['system', 'tesseract']);
    const [ttsServiceInstanceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [collectionServiceInstanceList] = useConfig('collection_service_list', []);
    const [hideLanguage] = useConfig('hide_language', false);
    const [sideBySide] = useConfig('translate_side_by_side', false);
    const [windowOpacity] = useConfig('translate_window_opacity', 1);
    const [windowZoom] = useConfig('translate_window_zoom', 1);
    const [snapEdges] = useConfig('translate_snap_edges', false);
    const [uiTechBg] = useConfig('ui_tech_bg', true);
    const [uiAnimations] = useConfig('ui_animations', true);
    const [pined, setPined] = useState(false);
    const [closing, setClosing] = useState(false);
    const [pluginList, setPluginList] = useState(null);
    const [serviceInstanceConfigMap, setServiceInstanceConfigMap] = useState(null);
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const items = reorder(translateServiceInstanceList, result.source.index, result.destination.index);
        setTranslateServiceInstanceList(items);
    };
    // 是否自动关闭窗口
    useEffect(() => {
        if (closeOnBlur !== null && !closeOnBlur) {
            unlistenBlur();
        }
    }, [closeOnBlur]);
    // 是否默认置顶
    useEffect(() => {
        if (alwaysOnTop !== null && alwaysOnTop) {
            appWindow.setAlwaysOnTop(true);
            unlistenBlur();
            setPined(true);
        }
    }, [alwaysOnTop]);
    // 並排時自動加寬視窗，避免兩欄過窄
    useEffect(() => {
        if (!sideBySide) {
            return;
        }
        (async () => {
            try {
                const monitor = await currentMonitor();
                const factor = monitor.scaleFactor;
                const size = (await appWindow.outerSize()).toLogical(factor);
                if (size.width < 720) {
                    await appWindow.setSize(new LogicalSize(720, size.height));
                }
            } catch {
                // ignore
            }
        })();
    }, [sideBySide]);
    // 貼齊螢幕邊緣（放開滑鼠停頓後吸附）
    useEffect(() => {
        if (!snapEdges) {
            return;
        }
        const SNAP = 18;
        let timeout = null;
        const unlistenMove = listen('tauri://move', () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(async () => {
                if (appWindow.label !== 'translate') {
                    return;
                }
                try {
                    const monitor = await currentMonitor();
                    if (!monitor) {
                        return;
                    }
                    const factor = monitor.scaleFactor;
                    const pos = (await appWindow.outerPosition()).toLogical(factor);
                    const size = (await appWindow.outerSize()).toLogical(factor);
                    const monPos = monitor.position.toLogical(factor);
                    const monSize = monitor.size.toLogical(factor);
                    let x = pos.x;
                    let y = pos.y;
                    if (Math.abs(x - monPos.x) <= SNAP) {
                        x = monPos.x;
                    }
                    if (Math.abs(monPos.x + monSize.width - (x + size.width)) <= SNAP) {
                        x = monPos.x + monSize.width - size.width;
                    }
                    if (Math.abs(y - monPos.y) <= SNAP) {
                        y = monPos.y;
                    }
                    if (Math.abs(monPos.y + monSize.height - (y + size.height)) <= SNAP) {
                        y = monPos.y + monSize.height - size.height;
                    }
                    if (x !== pos.x || y !== pos.y) {
                        await appWindow.setPosition(new LogicalPosition(x, y));
                    }
                } catch {
                    // ignore
                }
            }, 140);
        });
        return () => {
            unlistenMove.then((f) => {
                f();
            });
        };
    }, [snapEdges]);
    // 保存窗口位置
    useEffect(() => {
        if (windowPosition !== null && windowPosition === 'pre_state') {
            const unlistenMove = listen('tauri://move', async () => {
                if (moveTimeout) {
                    clearTimeout(moveTimeout);
                }
                moveTimeout = setTimeout(async () => {
                    if (appWindow.label === 'translate') {
                        let position = await appWindow.outerPosition();
                        const monitor = await currentMonitor();
                        const factor = monitor.scaleFactor;
                        position = position.toLogical(factor);
                        await saveConfigValues({
                            translate_window_position_x: parseInt(position.x),
                            translate_window_position_y: parseInt(position.y),
                        });
                    }
                }, 100);
            });
            return () => {
                unlistenMove.then((f) => {
                    f();
                });
            };
        }
    }, [windowPosition]);
    // 保存窗口大小
    useEffect(() => {
        if (rememberWindowSize !== null && rememberWindowSize) {
            const unlistenResize = listen('tauri://resize', async () => {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(async () => {
                    if (appWindow.label === 'translate') {
                        let size = await appWindow.outerSize();
                        const monitor = await currentMonitor();
                        const factor = monitor.scaleFactor;
                        size = size.toLogical(factor);
                        await saveConfigValues({
                            translate_window_height: parseInt(size.height),
                            translate_window_width: parseInt(size.width),
                        });
                    }
                }, 100);
            });
            return () => {
                unlistenResize.then((f) => {
                    f();
                });
            };
        }
    }, [rememberWindowSize]);

    const loadPluginList = async () => {
        const serviceTypeList = ['translate', 'tts', 'recognize', 'collection'];
        let temp = {};
        for (const serviceType of serviceTypeList) {
            temp[serviceType] = {};
            if (await exists(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig })) {
                const plugins = await readDir(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig });
                for (const plugin of plugins) {
                    const infoStr = await readTextFile(`plugins/${serviceType}/${plugin.name}/info.json`, {
                        dir: BaseDirectory.AppConfig,
                    });
                    let pluginInfo = JSON.parse(infoStr);
                    if ('icon' in pluginInfo) {
                        const appConfigDirPath = await appConfigDir();
                        const iconPath = await join(
                            appConfigDirPath,
                            `/plugins/${serviceType}/${plugin.name}/${pluginInfo.icon}`
                        );
                        pluginInfo.icon = convertFileSrc(iconPath);
                    }
                    temp[serviceType][plugin.name] = pluginInfo;
                }
            }
        }
        setPluginList({ ...temp });
    };

    useEffect(() => {
        loadPluginList();
        if (!unlisten) {
            unlisten = listen('reload_plugin_list', loadPluginList);
        }
    }, []);

    const loadServiceInstanceConfigMap = async () => {
        const config = {};
        for (const serviceInstanceKey of translateServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of recognizeServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of ttsServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        for (const serviceInstanceKey of collectionServiceInstanceList) {
            config[serviceInstanceKey] = (await store.get(serviceInstanceKey)) ?? {};
        }
        setServiceInstanceConfigMap({ ...config });
    };
    useEffect(() => {
        if (
            translateServiceInstanceList !== null &&
            recognizeServiceInstanceList !== null &&
            ttsServiceInstanceList !== null &&
            collectionServiceInstanceList !== null
        ) {
            loadServiceInstanceConfigMap();
        }
    }, [
        translateServiceInstanceList,
        recognizeServiceInstanceList,
        ttsServiceInstanceList,
        collectionServiceInstanceList,
    ]);

    const targetArea = (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
                droppableId='droppable'
                direction='vertical'
            >
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {translateServiceInstanceList !== null &&
                            serviceInstanceConfigMap !== null &&
                            translateServiceInstanceList.map((serviceInstanceKey, index) => {
                                const config = serviceInstanceConfigMap[serviceInstanceKey] ?? {};
                                const enable = config['enable'] ?? true;

                                return enable ? (
                                    <Draggable
                                        key={serviceInstanceKey}
                                        draggableId={serviceInstanceKey}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                            >
                                                <TargetArea
                                                    {...provided.dragHandleProps}
                                                    index={index}
                                                    name={serviceInstanceKey}
                                                    translateServiceInstanceList={translateServiceInstanceList}
                                                    pluginList={pluginList}
                                                    serviceInstanceConfigMap={serviceInstanceConfigMap}
                                                />
                                                <Spacer y={2} />
                                            </div>
                                        )}
                                    </Draggable>
                                ) : (
                                    <></>
                                );
                            })}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );

    const rootAnim = uiAnimations
        ? {
              initial: false,
              animate: { opacity: closing ? 0 : windowOpacity ?? 1 },
              transition: { duration: closing ? 0.15 : 0 },
          }
        : {
              initial: false,
              animate: { opacity: windowOpacity ?? 1 },
              transition: { duration: 0 },
          };

    return (
        pluginList && (
            <motion.div
                {...rootAnim}
                style={{ zoom: windowZoom ?? 1 }}
                className={`relative bg-background h-screen w-screen overflow-hidden ${
                    osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
                }`}
            >
                {uiTechBg && <div className='pointer-events-none absolute inset-0 z-0 tech-bg' />}
                {uiTechBg && <div className='pointer-events-none absolute inset-0 z-0 tech-noise' />}
                <div
                    className='fixed top-[5px] left-[5px] right-[5px] h-[30px]'
                    data-tauri-drag-region='true'
                />
                <div className={`h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        disableAnimation
                        className='my-auto bg-transparent'
                        onPress={() => {
                            if (pined) {
                                if (closeOnBlur) {
                                    unlisten = listenBlur();
                                }
                                appWindow.setAlwaysOnTop(false);
                            } else {
                                unlistenBlur();
                                appWindow.setAlwaysOnTop(true);
                            }
                            setPined(!pined);
                        }}
                    >
                        <BsPinFill className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`} />
                    </Button>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        disableAnimation
                        className={`my-auto ${osType === 'Darwin' && 'hidden'} bg-transparent`}
                        onPress={() => {
                            if (!uiAnimations) {
                                void appWindow.close();
                                return;
                            }
                            setClosing(true);
                            setTimeout(() => {
                                void appWindow.close();
                            }, 150);
                        }}
                    >
                        <AiFillCloseCircle className='text-[20px] text-default-400' />
                    </Button>
                </div>
                <div className={`relative z-10 ${osType === 'Linux' ? 'h-[calc(100vh-37px)]' : 'h-[calc(100vh-35px)]'} px-[8px]`}>
                    <div className={`h-full overflow-y-auto ${sideBySide ? 'flex flex-wrap items-start content-start' : ''}`}>
                        <div className={sideBySide ? 'w-1/2 min-w-0 order-2 sticky top-0 pr-3 border-r border-default-200' : ''}>
                            {serviceInstanceConfigMap !== null && (
                                <SourceArea
                                    pluginList={pluginList}
                                    serviceInstanceConfigMap={serviceInstanceConfigMap}
                                />
                            )}
                        </div>
                        <div
                            className={`sticky top-0 z-20 bg-background ${hideLanguage && 'hidden'} ${
                                sideBySide ? 'w-full order-1' : ''
                            }`}
                        >
                            <LanguageArea />
                            <Spacer y={2} />
                        </div>
                        <div className={sideBySide ? 'w-1/2 min-w-0 order-3 pl-3' : ''}>
                            {targetArea}
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    );
}
