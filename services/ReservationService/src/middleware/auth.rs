use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use std::env;

use crate::errors::AppError;

#[derive(Deserialize)]
struct JwtClaims {
    sub: String,
    role: String,
}

fn decode_bearer(parts: &Parts) -> Option<JwtClaims> {
    let auth = parts.headers.get("authorization")?.to_str().ok()?;
    let token = auth.strip_prefix("Bearer ")?;
    let secret = env::var("SECRET_KEY").unwrap_or_else(|_| "clave-ultra-secreta".to_string());
    let mut v = Validation::new(Algorithm::HS256);
    v.validate_exp = true;
    decode::<JwtClaims>(token, &DecodingKey::from_secret(secret.as_bytes()), &v)
        .ok()
        .map(|d| d.claims)
}

pub struct AuthUser {
    pub user_id: i32,
    pub user_role: String,
}

#[axum::async_trait]
impl<S: Send + Sync> FromRequestParts<S> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let claims = decode_bearer(parts).ok_or(AppError::Unauthorized)?;
        let user_id = claims.sub.parse::<i32>().map_err(|_| AppError::Unauthorized)?;
        Ok(AuthUser {
            user_id,
            user_role: claims.role,
        })
    }
}

pub struct AdminUser(pub AuthUser);

#[axum::async_trait]
impl<S: Send + Sync> FromRequestParts<S> for AdminUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let user = AuthUser::from_request_parts(parts, state).await?;
        if user.user_role != "Admin" {
            return Err(AppError::Forbidden(
                "Se requieren privilegios de administrador".into(),
            ));
        }
        Ok(AdminUser(user))
    }
}
