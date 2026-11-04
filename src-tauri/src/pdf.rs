use std::path::PathBuf;
use std::time::Duration;

use serde_json::Value;
use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::DialogExt;

/**
 * Tope de la exportación completa (sidecar + Chromium + impresión). El sidecar
 * ya acota cada paso; esto evita que un proceso colgado deje la app esperando.
 */
const RENDER_TIMEOUT: Duration = Duration::from_secs(120);

/**
 * Directorio de los artefactos que `scripts/prepare-desktop.mjs` deja en
 * `src-tauri/resources` (bundle del sidecar, Chromium y Tailwind).
 *
 * En el paquete instalado es el `resource_dir` de Tauri; en `tauri dev` ese
 * directorio todavía no existe, así que se usa el del repositorio.
 */
fn resources_dir(app: &AppHandle) -> PathBuf {
    if let Ok(dir) = app.path().resource_dir() {
        if dir.join("pdf-render.cjs").exists() {
            return dir;
        }
    }
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources")
}

/**
 * Ruta del binario Node que hace de sidecar. El bundler lo coloca junto al
 * ejecutable principal; en desarrollo está en `src-tauri/binaries` con el
 * sufijo del triple destino.
 */
fn sidecar_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut candidates = Vec::new();
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            candidates.push(dir.join("pdf-render"));
        }
    }
    if let Ok(dir) = app.path().resource_dir() {
        candidates.push(dir.join("pdf-render"));
    }
    candidates.push(
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("binaries")
            .join(format!("pdf-render-{}", env!("TARGET_TRIPLE"))),
    );

    candidates
        .into_iter()
        .find(|path| path.exists())
        .ok_or_else(|| {
            "Falta el binario del PDF. Ejecuta `pnpm desktop:prepare`.".to_string()
        })
}

/**
 * Genera el PDF en un temporal (sidecar) y luego pregunta dónde guardarlo con
 * el diálogo nativo. Devuelve la ruta guardada o `None` si se cancela.
 */
#[tauri::command]
pub async fn export_pdf(app: AppHandle, payload: Value) -> Result<Option<String>, String> {
    let resources = resources_dir(&app);
    let sidecar = sidecar_path(&app)?;

    let stamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or_default();
    let temp = std::env::temp_dir();
    let payload_path = temp.join(format!("tc-pdf-{stamp}.json"));
    let out_path = temp.join(format!("tc-pdf-{stamp}.pdf"));

    let json = serde_json::to_vec(&payload).map_err(|e| e.to_string())?;
    std::fs::write(&payload_path, json).map_err(|e| format!("No se pudo escribir el temporal: {e}"))?;

    let script = resources.join("pdf-render.cjs").to_string_lossy().to_string();
    let chromium = resources.join("chromium").to_string_lossy().to_string();
    let tailwind = resources.join("tailwind.js").to_string_lossy().to_string();
    let payload_arg = payload_path.to_string_lossy().to_string();
    let out_arg = out_path.to_string_lossy().to_string();

    let mut command = tokio::process::Command::new(sidecar);
    command
        .args([&script, &payload_arg, &out_arg, &chromium, &tailwind])
        .kill_on_drop(true);
    let output = tokio::time::timeout(RENDER_TIMEOUT, command.output())
        .await
        .map_err(|_| "La generación del PDF tardó demasiado".to_string())?
        .map_err(|e| format!("No se pudo lanzar el generador de PDF: {e}"))?;

    std::fs::remove_file(&payload_path).ok();

    if !output.status.success() {
        std::fs::remove_file(&out_path).ok();
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Error generando el PDF: {}", stderr.trim()));
    }

    let bytes = std::fs::read(&out_path).map_err(|e| format!("No se pudo leer el PDF: {e}"))?;
    std::fs::remove_file(&out_path).ok();

    let (tx, rx) = tokio::sync::oneshot::channel();
    app.dialog()
        .file()
        .set_file_name("documento.pdf")
        .add_filter("PDF", &["pdf"])
        .save_file(move |path| {
            let _ = tx.send(path);
        });

    let Some(chosen) = rx.await.map_err(|e| e.to_string())? else {
        return Ok(None);
    };
    let destination = chosen.into_path().map_err(|e| e.to_string())?;
    std::fs::write(&destination, bytes)
        .map_err(|e| format!("No se pudo guardar el PDF: {e}"))?;

    Ok(Some(destination.display().to_string()))
}
