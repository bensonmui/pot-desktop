use crate::config::set;
use crate::window::text_translate;
use std::sync::Mutex;
use tauri::{ClipboardManager, Manager};

pub struct ClipboardMonitorEnableWrapper(pub Mutex<String>);

pub fn start_clipboard_monitor(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut pre_text = "".to_string();
        loop {
            let handle = app_handle.app_handle();
            let state = handle.state::<ClipboardMonitorEnableWrapper>();
            if let Ok(clipboard_monitor) = state.0.try_lock() {
                if clipboard_monitor.contains("true") {
                    if let Ok(result) = app_handle.clipboard_manager().read_text() {
                        match result {
                            Some(v) => {
                                if v != pre_text {
                                    text_translate(v.clone());
                                    pre_text = v;
                                }
                            }
                            None => {}
                        }
                    }
                } else {
                    break;
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

// Toggle clipboard monitoring from the settings UI (the tray menu can also toggle it).
#[tauri::command]
pub fn set_clipboard_monitor(app_handle: tauri::AppHandle, enabled: bool) {
    set("clipboard_monitor", enabled);
    let state = app_handle.state::<ClipboardMonitorEnableWrapper>();
    let was_enabled = {
        let s = state.0.lock().unwrap();
        s.contains("true")
    };
    {
        let mut s = state.0.lock().unwrap();
        s.replace_range(.., if enabled { "true" } else { "false" });
    }
    if enabled && !was_enabled {
        start_clipboard_monitor(app_handle.clone());
    }
}
