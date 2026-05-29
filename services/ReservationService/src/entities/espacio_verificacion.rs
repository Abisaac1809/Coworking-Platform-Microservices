use sqlx::FromRow;

#[derive(Debug, Clone, FromRow)]
pub struct EspacioVerificacion {
    pub espacio_id: i32,
    pub necesita_verificacion: bool,
}
