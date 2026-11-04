mod pdf;
mod sql;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // `tokio-postgres-rustls` usa el proveedor criptográfico por defecto del
    // proceso; si ya está instalado, el error no importa.
    let _ = rustls::crypto::ring::default_provider().install_default();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![pdf::export_pdf, sql::run_sql])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
