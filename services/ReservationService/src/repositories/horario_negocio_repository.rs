use chrono::NaiveTime;
use sqlx::PgPool;

use crate::entities::horario_negocio::HorarioNegocio;
use crate::errors::AppError;
use crate::traits::HorarioNegocioRepositoryTrait;

#[derive(Clone)]
pub struct HorarioNegocioRepository {
    pub pool: PgPool,
}

impl HorarioNegocioRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl HorarioNegocioRepositoryTrait for HorarioNegocioRepository {
    async fn listar_todos(&self) -> Result<Vec<HorarioNegocio>, AppError> {
        let horarios = sqlx::query_as::<_, HorarioNegocio>(
            "SELECT * FROM horarios_negocio ORDER BY dia_semana",
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(horarios)
    }

    async fn obtener_por_dia(&self, dia_semana: i16) -> Result<Option<HorarioNegocio>, AppError> {
        let horario = sqlx::query_as::<_, HorarioNegocio>(
            "SELECT * FROM horarios_negocio WHERE dia_semana = $1",
        )
        .bind(dia_semana)
        .fetch_optional(&self.pool)
        .await?;

        Ok(horario)
    }

    async fn actualizar(
        &self,
        dia_semana: i16,
        hora_inicio: NaiveTime,
        hora_fin: NaiveTime,
        activo: bool,
    ) -> Result<HorarioNegocio, AppError> {
        let horario = sqlx::query_as::<_, HorarioNegocio>(
            "UPDATE horarios_negocio
             SET hora_inicio = $1, hora_fin = $2, activo = $3, actualizado_en = NOW()
             WHERE dia_semana = $4
             RETURNING *",
        )
        .bind(hora_inicio)
        .bind(hora_fin)
        .bind(activo)
        .bind(dia_semana)
        .fetch_one(&self.pool)
        .await?;

        Ok(horario)
    }
}
