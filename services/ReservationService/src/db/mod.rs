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

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS horarios_negocio (
            id SERIAL PRIMARY KEY,
            dia_semana SMALLINT NOT NULL,
            hora_inicio TIME NOT NULL,
            hora_fin TIME NOT NULL,
            activo BOOLEAN NOT NULL DEFAULT true,
            actualizado_en TIMESTAMP DEFAULT NOW(),
            UNIQUE (dia_semana)
        )",
    )
    .execute(pool)
    .await
    .expect("Failed to create horarios_negocio table");

    sqlx::query(
        "INSERT INTO horarios_negocio (dia_semana, hora_inicio, hora_fin, activo)
         SELECT * FROM (VALUES
             (1::SMALLINT, '08:00'::TIME, '17:00'::TIME, true),
             (2::SMALLINT, '08:00'::TIME, '17:00'::TIME, true),
             (3::SMALLINT, '08:00'::TIME, '17:00'::TIME, true),
             (4::SMALLINT, '08:00'::TIME, '17:00'::TIME, true),
             (5::SMALLINT, '08:00'::TIME, '17:00'::TIME, true),
             (6::SMALLINT, '00:00'::TIME, '00:00'::TIME, false),
             (0::SMALLINT, '00:00'::TIME, '00:00'::TIME, false)
         ) AS v(dia_semana, hora_inicio, hora_fin, activo)
         WHERE NOT EXISTS (SELECT 1 FROM horarios_negocio LIMIT 1)",
    )
    .execute(pool)
    .await
    .expect("Failed to seed horarios_negocio");
}
