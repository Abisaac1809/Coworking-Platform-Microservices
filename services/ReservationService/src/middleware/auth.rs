use axum::extract::FromRequestParts;
use axum::http::request::Parts;

use crate::errors::AppError;

pub struct AuthUser {
    pub user_id: i32,
    pub user_role: String,
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let user_id = parts
            .headers
            .get("x-user-id")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse::<i32>().ok())
            .ok_or(AppError::Unauthorized)?;

        let user_role = parts
            .headers
            .get("x-user-role")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("usuario")
            .to_string();

        Ok(AuthUser {
            user_id,
            user_role,
        })
    }
}

pub struct AdminUser(pub AuthUser);

#[axum::async_trait]
impl<S> FromRequestParts<S> for AdminUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let user = AuthUser::from_request_parts(parts, state).await?;
        if user.user_role != "admin" {
            return Err(AppError::Forbidden(
                "Se requieren privilegios de administrador".into(),
            ));
        }
        Ok(AdminUser(user))
    }
}
