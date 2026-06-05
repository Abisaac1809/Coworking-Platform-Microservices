use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActualizarHorarioRequest {
    pub hora_inicio: String,
    pub hora_fin: String,
    pub activo: bool,
}
