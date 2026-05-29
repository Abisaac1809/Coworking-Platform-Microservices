package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"SpaceService/handlers"
	"SpaceService/middlewares"
	"SpaceService/models"
)

var db *gorm.DB

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migración
	if err := db.AutoMigrate(&models.Espacio{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Crear carpeta uploads si no existe
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		err := os.Mkdir("uploads", 0755)
		if err != nil {
			log.Fatalf("Failed to create uploads directory: %v", err)
		}
	}

	r := gin.Default()

	// Servir archivos estáticos
	r.Static("/uploads", "./uploads")

	r.GET("/health", func(c *gin.Context) {
		dbStatus := "connected"
		sqlDB, err := db.DB()
		if err != nil || sqlDB.Ping() != nil {
			dbStatus = "disconnected"
		}
		c.JSON(http.StatusOK, gin.H{
			"status":   "healthy",
			"service":  "SpaceService",
			"database": dbStatus,
		})
	})

	// Setup de Handlers y Rutas
	espacioHandler := handlers.NewEspacioHandler(db)

	espaciosGroup := r.Group("/espacios")
	espaciosGroup.Use(middlewares.RequireUserId())
	{
		espaciosGroup.GET("", espacioHandler.ListarEspacios)
		espaciosGroup.GET("/:id", espacioHandler.ObtenerEspacio)

		// Rutas protegidas para administradores
		adminGroup := espaciosGroup.Group("")
		adminGroup.Use(middlewares.RequireAdminRole())
		{
			adminGroup.POST("", espacioHandler.CrearEspacio)
			adminGroup.PUT("/:id", espacioHandler.ActualizarEspacio)
			adminGroup.PATCH("/:id/estado", espacioHandler.CambiarEstadoEspacio)
		}
	}

	if err := r.Run(":8000"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
