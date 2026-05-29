use sqlx::PgPool;

pub async fn run_migrations(pool: &PgPool) {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS espacios_verificacion (
            espacio_id INTEGER PRIMARY KEY,
            necesita_verificacion BOOLEAN NOT NULL
        )",
    )
    .execute(pool)
    .await
    .expect("Failed to create espacios_verificacion table");

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS reservas (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL,
            espacio_id INTEGER NOT NULL,
            fecha_inicio TIMESTAMP NOT NULL,
            fecha_fin TIMESTAMP NOT NULL,
            estado VARCHAR(20) DEFAULT 'PENDIENTE',
            notas TEXT,
            creado_en TIMESTAMP DEFAULT NOW()
        )",
    )
    .execute(pool)
    .await
    .expect("Failed to create reservas table");
}
