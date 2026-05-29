use sqlx::PgPool;

use crate::entities::espacio_verificacion::EspacioVerificacion;
use crate::errors::AppError;
use crate::traits::EspacioVerificacionRepositoryTrait;

#[derive(Clone)]
pub struct EspacioVerificacionRepository {
    pub pool: PgPool,
}

impl EspacioVerificacionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl EspacioVerificacionRepositoryTrait for EspacioVerificacionRepository {
    async fn upsert(
        &self,
        espacio_id: i32,
        necesita_verificacion: bool,
    ) -> Result<(), AppError> {
        sqlx::query(
            "INSERT INTO espacios_verificacion (espacio_id, necesita_verificacion)
             VALUES ($1, $2)
             ON CONFLICT (espacio_id) DO UPDATE
             SET necesita_verificacion = EXCLUDED.necesita_verificacion",
        )
        .bind(espacio_id)
        .bind(necesita_verificacion)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn obtener(&self, espacio_id: i32) -> Result<Option<EspacioVerificacion>, AppError> {
        let result = sqlx::query_as::<_, EspacioVerificacion>(
            "SELECT * FROM espacios_verificacion WHERE espacio_id = $1",
        )
        .bind(espacio_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(result)
    }
}
