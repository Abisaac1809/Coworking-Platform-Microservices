use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
}
