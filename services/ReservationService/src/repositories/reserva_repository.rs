use chrono::NaiveDateTime;
use sqlx::PgPool;

use crate::entities::reserva::Reserva;
use crate::errors::AppError;
use crate::traits::ReservaRepositoryTrait;

#[derive(Clone)]
pub struct ReservaRepository {
    pub pool: PgPool,
}

impl ReservaRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl ReservaRepositoryTrait for ReservaRepository {
    async fn crear(
        &self,
        usuario_id: i32,
        espacio_id: i32,
        fecha_inicio: NaiveDateTime,
        fecha_fin: NaiveDateTime,
        estado: &str,
        notas: Option<&str>,
    ) -> Result<Reserva, AppError> {
        let reserva = sqlx::query_as::<_, Reserva>(
            "INSERT INTO reservas (usuario_id, espacio_id, fecha_inicio, fecha_fin, estado, notas)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *",
        )
        .bind(usuario_id)
        .bind(espacio_id)
        .bind(fecha_inicio)
        .bind(fecha_fin)
        .bind(estado)
        .bind(notas)
        .fetch_one(&self.pool)
        .await?;

        Ok(reserva)
    }

    async fn obtener_por_id(&self, id: i32) -> Result<Option<Reserva>, AppError> {
        let reserva = sqlx::query_as::<_, Reserva>("SELECT * FROM reservas WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(reserva)
    }

    async fn listar_por_usuario(
        &self,
        usuario_id: i32,
        page: i64,
        limit: i64,
        sort_by: &str,
        sort_order: &str,
    ) -> Result<Vec<Reserva>, AppError> {
        let sort_field = match sort_by {
            "fecha_inicio" => "fecha_inicio",
            "fecha_fin" => "fecha_fin",
            "estado" => "estado",
            _ => "creado_en",
        };
        let direction = if sort_order == "asc" { "ASC" } else { "DESC" };
        let offset = (page - 1) * limit;

        let mut qb =
            sqlx::QueryBuilder::new("SELECT * FROM reservas WHERE usuario_id = ");
        qb.push_bind(usuario_id);
        qb.push(format!(" ORDER BY {} {}", sort_field, direction));
        qb.push(" LIMIT ");
        qb.push_bind(limit);
        qb.push(" OFFSET ");
        qb.push_bind(offset);

        let reservas = qb
            .build_query_as::<Reserva>()
            .fetch_all(&self.pool)
            .await?;

        Ok(reservas)
    }

    async fn listar_todas(&self, page: i64, limit: i64) -> Result<Vec<Reserva>, AppError> {
        let offset = (page - 1) * limit;

        let reservas = sqlx::query_as::<_, Reserva>(
            "SELECT * FROM reservas ORDER BY creado_en DESC LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        Ok(reservas)
    }

    async fn actualizar_estado(&self, id: i32, estado: &str) -> Result<Reserva, AppError> {
        let reserva = sqlx::query_as::<_, Reserva>(
            "UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *",
        )
        .bind(estado)
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        Ok(reserva)
    }

    async fn cargar_pendientes(&self) -> Result<Vec<Reserva>, AppError> {
        let reservas = sqlx::query_as::<_, Reserva>(
            "SELECT * FROM reservas WHERE estado = 'PENDIENTE'",
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(reservas)
    }
}
