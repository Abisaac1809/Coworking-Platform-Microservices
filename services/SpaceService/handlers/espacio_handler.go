package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"SpaceService/messaging"
	"SpaceService/models"
)

type EspacioHandler struct {
	DB       *gorm.DB
	Producer *messaging.RabbitMQProducer
}

func NewEspacioHandler(db *gorm.DB, producer *messaging.RabbitMQProducer) *EspacioHandler {
	return &EspacioHandler{DB: db, Producer: producer}
}

// ListarEspacios - GET /espacios
func (h *EspacioHandler) ListarEspacios(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	sortBy := c.DefaultQuery("sort_by", "precio")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	status := c.Query("status")
	search := c.Query("search")
	capacidad, _ := strconv.Atoi(c.Query("capacidad"))

	query := h.DB.Model(&models.Espacio{})

	if status != "" {
		query = query.Where("estado = ?", status)
	}
	if search != "" {
		query = query.Where("nombre ILIKE ? OR descripcion ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if capacidad > 0 {
		query = query.Where("capacidad >= ?", capacidad)
	}

	allowedSortFields := map[string]string{
		"nombre":    "nombre",
		"capacidad": "capacidad",
		"precio":    "precio_por_hora",
	}
	sortField, ok := allowedSortFields[sortBy]
	if !ok {
		sortField = "precio_por_hora"
	}

	direction := "ASC"
	if sortOrder == "desc" {
		direction = "DESC"
	}
	query = query.Order(fmt.Sprintf("%s %s", sortField, direction))

	offset := (page - 1) * limit
	query = query.Limit(limit).Offset(offset)

	var espacios []models.Espacio
	if err := query.Find(&espacios).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener espacios"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"pagina": page,
		"limite": limit,
		"filtros": gin.H{
			"status":    status,
			"search":    search,
			"capacidad": capacidad,
		},
		"espacios": espacios,
	})
}

// ObtenerEspacio - GET /espacios/:id
func (h *EspacioHandler) ObtenerEspacio(c *gin.Context) {
	id := c.Param("id")
	var espacio models.Espacio
	if err := h.DB.First(&espacio, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Espacio no encontrado"})
		return
	}
	c.JSON(http.StatusOK, espacio)
}

// CrearEspacio - POST /espacios
func (h *EspacioHandler) CrearEspacio(c *gin.Context) {
	nombre := c.PostForm("nombre")
	descripcion := c.PostForm("descripcion")
	capacidadStr := c.PostForm("capacidad")
	precioStr := c.PostForm("precioPorHora")

	if nombre == "" || capacidadStr == "" || precioStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campos nombre, capacidad y precioPorHora son requeridos"})
		return
	}

	capacidad, err := strconv.Atoi(capacidadStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Capacidad debe ser un número entero"})
		return
	}

	precioPorHora, err := strconv.ParseFloat(precioStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "PrecioPorHora debe ser un número decimal"})
		return
	}

	file, err := c.FormFile("foto")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La foto es requerida"})
		return
	}

	uniqueName := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
	uploadPath := filepath.Join("uploads", uniqueName)
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar la imagen"})
		return
	}

	fotoURL := "/api/spaces/uploads/" + uniqueName

	necesitaVerificacion := c.PostForm("necesitaVerificacion") == "true"

	espacio := models.Espacio{
		Nombre:               nombre,
		Descripcion:          descripcion,
		Capacidad:            capacidad,
		PrecioPorHora:        precioPorHora,
		NecesitaVerificacion: necesitaVerificacion,
		FotoURL:              fotoURL,
	}

	if err := h.DB.Create(&espacio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el espacio en base de datos"})
		return
	}

	if h.Producer != nil {
		h.Producer.Publish("espacio.creado", espacio.ID, espacio.NecesitaVerificacion)
	}

	c.JSON(http.StatusCreated, espacio)
}

// ActualizarEspacio - PUT /espacios/:id
func (h *EspacioHandler) ActualizarEspacio(c *gin.Context) {
	id := c.Param("id")
	var espacio models.Espacio
	if err := h.DB.First(&espacio, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Espacio no encontrado"})
		return
	}

	if nombre := c.PostForm("nombre"); nombre != "" {
		espacio.Nombre = nombre
	}
	if descripcion := c.PostForm("descripcion"); descripcion != "" {
		espacio.Descripcion = descripcion
	}
	if capacidadStr := c.PostForm("capacidad"); capacidadStr != "" {
		if cap, err := strconv.Atoi(capacidadStr); err == nil {
			espacio.Capacidad = cap
		}
	}
	if precioStr := c.PostForm("precioPorHora"); precioStr != "" {
		if precio, err := strconv.ParseFloat(precioStr, 64); err == nil {
			espacio.PrecioPorHora = precio
		}
	}
	if nv := c.PostForm("necesitaVerificacion"); nv != "" {
		espacio.NecesitaVerificacion = nv == "true"
	}

	file, err := c.FormFile("foto")
	if err == nil {
		// Se proporcionó una nueva foto
		uniqueName := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		uploadPath := filepath.Join("uploads", uniqueName)
		if err := c.SaveUploadedFile(file, uploadPath); err == nil {
			espacio.FotoURL = "/api/spaces/uploads/" + uniqueName
		}
	}

	if err := h.DB.Save(&espacio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el espacio"})
		return
	}

	if h.Producer != nil {
		h.Producer.Publish("espacio.actualizado", espacio.ID, espacio.NecesitaVerificacion)
	}

	c.JSON(http.StatusOK, espacio)
}

// CambiarEstadoEspacio - PATCH /espacios/:id/estado
func (h *EspacioHandler) CambiarEstadoEspacio(c *gin.Context) {
	id := c.Param("id")
	var espacio models.Espacio
	if err := h.DB.First(&espacio, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Espacio no encontrado"})
		return
	}

	var reqBody struct {
		Estado string `json:"estado"`
	}

	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cuerpo de petición inválido"})
		return
	}

	validStates := map[string]bool{
		"reservada":     true,
		"ocupada":       true,
		"mantenimiento": true,
		"disponible":    true,
	}

	if !validStates[reqBody.Estado] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado inválido"})
		return
	}

	espacio.Estado = reqBody.Estado

	if err := h.DB.Save(&espacio).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el estado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":     espacio.ID,
		"nombre": espacio.Nombre,
		"estado": espacio.Estado,
	})
}
