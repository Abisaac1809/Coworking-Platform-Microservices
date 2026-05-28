package models

import (
	"time"
)

type Espacio struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Nombre        string    `gorm:"type:varchar(100);not null" json:"nombre"`
	Descripcion   string    `gorm:"type:text" json:"descripcion"`
	Capacidad     int       `gorm:"type:integer;not null" json:"capacidad"`
	PrecioPorHora float64   `gorm:"type:decimal(10,2);not null" json:"precio_por_hora"`
	Estado        string    `gorm:"type:varchar(20);default:'disponible'" json:"estado"`
	FotoURL       string    `gorm:"type:varchar(255);column:foto_url" json:"foto_url"`
	CreadoEn      time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:creado_en" json:"creado_en"`
}
