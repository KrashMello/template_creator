use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use tokio_postgres::config::SslMode;
use tokio_postgres::{Config, SimpleQueryMessage};
use tokio_postgres_rustls::MakeRustlsConnect;

/** Mismo tope que tenía el endpoint: una consulta accidental no bloquea la app. */
const MAX_ROWS: usize = 1000;
const CONNECT_TIMEOUT: Duration = Duration::from_secs(8);
const QUERY_TIMEOUT: Duration = Duration::from_secs(15);
const STATEMENT_TIMEOUT_MS: u32 = 10_000;

#[derive(Debug, Deserialize)]
pub struct SqlRequest {
    host: String,
    #[serde(default)]
    port: u16,
    user: String,
    #[serde(default)]
    password: String,
    database: String,
    #[serde(default)]
    ssl: bool,
    query: String,
}

#[derive(Debug, Serialize)]
pub struct SqlResponse {
    rows: Vec<Value>,
    truncated: bool,
    limit: usize,
}

/**
 * Cliente Postgres de la app.
 *
 * `simple_query` usa el protocolo de texto: cada columna llega ya formateada
 * como string (o NULL), sin tabla de conversión por OID. Es justo lo que
 * necesita el documento, que solo pinta valores.
 *
 * `shortcut: los tipos se pierden (números y fechas llegan como texto). Si algún
 * día las plantillas necesitan comparar u operar con ellos, pasar a
 * `client.query` con decodificación por tipo.`
 *
 * `shortcut: `simple_query` acepta varias sentencias. Antes el endpoint era
 * público y lo impedía; aquí es la base de datos del propio usuario.`
 */
#[tauri::command]
pub async fn run_sql(request: SqlRequest) -> Result<SqlResponse, String> {
    if request.host.trim().is_empty() || request.user.trim().is_empty() || request.database.trim().is_empty() {
        return Err("Faltan host, usuario o base de datos".to_string());
    }
    if request.query.trim().is_empty() {
        return Err("Escribe una consulta".to_string());
    }
    if request.query.len() > 20_000 {
        return Err("La consulta es demasiado larga".to_string());
    }

    let mut config = Config::new();
    config
        .host(request.host.trim())
        .port(if request.port == 0 { 5432 } else { request.port })
        .user(request.user.trim())
        .dbname(request.database.trim())
        .application_name("template-creator")
        .connect_timeout(CONNECT_TIMEOUT)
        .options(format!("-c statement_timeout={STATEMENT_TIMEOUT_MS}"))
        .ssl_mode(if request.ssl { SslMode::Require } else { SslMode::Disable });
    if !request.password.is_empty() {
        config.password(&request.password);
    }

    // Con `SslMode::Disable` el conector TLS nunca se usa, así que el mismo
    // camino sirve para conexiones con y sin SSL.
    let (client, connection) = tokio::time::timeout(
        CONNECT_TIMEOUT,
        config.connect(MakeRustlsConnect::with_webpki_roots()),
    )
    .await
    .map_err(|_| "No se pudo conectar: tiempo de espera agotado".to_string())?
    .map_err(|e| e.to_string())?;

    tauri::async_runtime::spawn(async move {
        let _ = connection.await;
    });

    let messages = tokio::time::timeout(QUERY_TIMEOUT, client.simple_query(&request.query))
        .await
        .map_err(|_| "La consulta tardó demasiado".to_string())?
        .map_err(|e| e.to_string())?;

    let mut rows = Vec::new();
    let mut truncated = false;
    for message in messages {
        let SimpleQueryMessage::Row(row) = message else {
            continue;
        };
        if rows.len() >= MAX_ROWS {
            truncated = true;
            break;
        }
        let mut object = Map::new();
        for (index, column) in row.columns().iter().enumerate() {
            let value = match row.get(index) {
                Some(text) => Value::String(text.to_string()),
                None => Value::Null,
            };
            object.insert(column.name().to_string(), value);
        }
        rows.push(Value::Object(object));
    }

    Ok(SqlResponse {
        rows,
        truncated,
        limit: MAX_ROWS,
    })
}
