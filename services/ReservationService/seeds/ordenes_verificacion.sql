-- Seeder: órdenes (reservas) que deben ser verificadas
--
-- Una reserva queda en estado 'PENDIENTE' cuando su espacio requiere
-- verificación manual (espacios_verificacion.necesita_verificacion = true).
-- El ReservationService carga todas las reservas PENDIENTE en la cola de
-- prioridad al arrancar; el panel "Órdenes Pendientes" del admin las muestra
-- ordenadas por proximidad de inicio.
--
-- Idempotente: borra las órdenes previamente sembradas (marcadas con [seed])
-- antes de insertar, de modo que se pueda volver a correr sin duplicar.
--
-- Uso:
--   docker exec -i reservation-db psql -U postgres -d reservation_db \
--     < services/ReservationService/seeds/ordenes_verificacion.sql

BEGIN;

-- 1. Marcar los espacios usados como que requieren verificación.
INSERT INTO espacios_verificacion (espacio_id, necesita_verificacion)
VALUES (1, true), (2, true)
ON CONFLICT (espacio_id)
DO UPDATE SET necesita_verificacion = EXCLUDED.necesita_verificacion;

-- 2. Limpiar siembras anteriores para mantener el seeder idempotente.
DELETE FROM reservas
WHERE estado = 'PENDIENTE'
  AND notas LIKE '[seed]%';

-- 3. Insertar reservas PENDIENTE (órdenes a verificar) en días/horas hábiles
--    futuros (L-V, 08:00-17:00). Se ordenan en la cola por fecha_inicio.
INSERT INTO reservas (usuario_id, espacio_id, fecha_inicio, fecha_fin, estado, notas)
VALUES
  (2, 1, '2026-06-03 09:00:00', '2026-06-03 11:00:00', 'PENDIENTE', '[seed] Reunión equipo de diseño'),
  (5, 2, '2026-06-04 14:00:00', '2026-06-04 16:00:00', 'PENDIENTE', '[seed] Sesión de trabajo individual'),
  (5, 1, '2026-06-05 08:00:00', '2026-06-05 10:00:00', 'PENDIENTE', '[seed] Entrevista con cliente'),
  (2, 2, '2026-06-08 10:00:00', '2026-06-08 12:00:00', 'PENDIENTE', '[seed] Bloque de concentración'),
  (2, 1, '2026-06-09 15:00:00', '2026-06-09 17:00:00', 'PENDIENTE', '[seed] Demo de producto');

COMMIT;

-- Resumen de lo sembrado.
SELECT id, usuario_id, espacio_id, fecha_inicio, estado, notas
FROM reservas
WHERE estado = 'PENDIENTE'
ORDER BY fecha_inicio;
