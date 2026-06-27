use axum::{
    routing::{get, post},
    Router,
    Json,
    extract::State,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize, Deserialize, Clone)]
struct Breach {
    name: String,
    title: String,
    domain: String,
    breach_date: String,
    pwn_count: i64,
    description: String,
    data_classes: Vec<String>,
}

#[derive(Deserialize)]
struct CheckRequest {
    email: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct EmailCheckResult {
    email: String,
    breached: bool,
    breach_count: i32,
    breaches: Vec<Breach>,
    checked_at: String,
}

#[derive(Clone)]
struct AppState {
    history: Arc<Mutex<HashMap<String, EmailCheckResult>>>,
}

fn mock_breaches(email: &str) -> Vec<Breach> {
    let mut breaches = Vec::new();

    if email.contains("test") || email.contains("admin") {
        breaches.push(Breach {
            name: "Adobe".to_string(),
            title: "Adobe".to_string(),
            domain: "adobe.com".to_string(),
            breach_date: "2013-10-04".to_string(),
            pwn_count: 152445165,
            description: "In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text.".to_string(),
            data_classes: vec!["Email addresses".to_string(), "Password hints".to_string(), "Passwords".to_string(), "Usernames".to_string()],
        });
    }

    if email.contains("user") || email.contains("john") {
        breaches.push(Breach {
            name: "LinkedIn".to_string(),
            title: "LinkedIn".to_string(),
            domain: "linkedin.com".to_string(),
            breach_date: "2012-05-05".to_string(),
            pwn_count: 164611595,
            description: "In May 2012, LinkedIn was breached and close to 6.5 million passwords were hashed with unsalted SHA-1.".to_string(),
            data_classes: vec!["Email addresses".to_string(), "Passwords".to_string()],
        });
        breaches.push(Breach {
            name: "Dropbox".to_string(),
            title: "Dropbox".to_string(),
            domain: "dropbox.com".to_string(),
            breach_date: "2012-08-01".to_string(),
            pwn_count: 68648008,
            description: "In August 2012, Dropbox suffered a data breach which exposed the stored user accounts of over 68 million users.".to_string(),
            data_classes: vec!["Email addresses".to_string(), "Passwords".to_string()],
        });
    }

    if email.contains("demo") {
        breaches.push(Breach {
            name: "Canva".to_string(),
            title: "Canva".to_string(),
            domain: "canva.com".to_string(),
            breach_date: "2019-05-24".to_string(),
            pwn_count: 137462781,
            description: "In May 2019, the graphic design tool Canva suffered a data breach that impacted 137 million users.".to_string(),
            data_classes: vec!["Email addresses".to_string(), "Geographic locations".to_string(), "Names".to_string(), "Passwords".to_string()],
        });
    }

    breaches
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "haveibeenpwned-checker".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn check_email(
    State(state): State<AppState>,
    Json(req): Json<CheckRequest>,
) -> impl IntoResponse {
    if req.email.is_empty() || !req.email.contains('@') {
        return Json(ApiResponse {
            success: false,
            data: None,
            error: Some("Valid email address required".to_string()),
        });
    }

    let breaches = mock_breaches(&req.email);
    let now = chrono::Utc::now().to_rfc3339();

    let result = EmailCheckResult {
        email: req.email.clone(),
        breached: !breaches.is_empty(),
        breach_count: breaches.len() as i32,
        breaches,
        checked_at: now,
    };

    let mut history = state.history.lock().unwrap();
    history.insert(req.email.clone(), result.clone());

    Json(ApiResponse {
        success: true,
        data: Some(result),
        error: None,
    })
}

async fn get_history(State(state): State<AppState>) -> impl IntoResponse {
    let history = state.history.lock().unwrap();
    let results: Vec<EmailCheckResult> = history.values().cloned().collect();
    Json(ApiResponse {
        success: true,
        data: Some(results),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = AppState {
        history: Arc::new(Mutex::new(HashMap::new())),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/check", post(check_email))
        .route("/api/history", get(get_history))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("haveibeenpwned-checker backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
