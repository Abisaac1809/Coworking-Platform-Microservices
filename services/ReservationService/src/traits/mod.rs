use crate::entities::espacio_verificacion::EspacioVerificacion;
use crate::entities::reserva::Reserva;
use crate::errors::AppError;
use chrono::NaiveDateTime;

pub trait ReservaRepositoryTrait: Send + Sync {
    fn crear(
        &self,
        usuario_id: i32,
        espacio_id: i32,
        fecha_inicio: NaiveDateTime,
        fecha_fin: NaiveDateTime,
        estado: &str,
        notas: Option<&str>,
    ) -> impl std::future::Future<Output = Result<Reserva, AppError>> + Send;

    fn obtener_por_id(
        &self,
        id: i32,
    ) -> impl std::future::Future<Output = Result<Option<Reserva>, AppError>> + Send;

    fn listar_por_usuario(
        &self,
        usuario_id: i32,
        page: i64,
        limit: i64,
        sort_by: &str,
        sort_order: &str,
    ) -> impl std::future::Future<Output = Result<Vec<Reserva>, AppError>> + Send;

    fn listar_todas(
        &self,
        page: i64,
        limit: i64,
    ) -> impl std::future::Future<Output = Result<Vec<Reserva>, AppError>> + Send;

    fn actualizar_estado(
        &self,
        id: i32,
        estado: &str,
    ) -> impl std::future::Future<Output = Result<Reserva, AppError>> + Send;

    fn cargar_pendientes(
        &self,
    ) -> impl std::future::Future<Output = Result<Vec<Reserva>, AppError>> + Send;
}

pub trait EspacioVerificacionRepositoryTrait: Send + Sync {
    fn upsert(
        &self,
        espacio_id: i32,
        necesita_verificacion: bool,
    ) -> impl std::future::Future<Output = Result<(), AppError>> + Send;

    fn obtener(
        &self,
        espacio_id: i32,
    ) -> impl std::future::Future<Output = Result<Option<EspacioVerificacion>, AppError>> + Send;
}
