package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireAdminRole valida que el usuario tenga rol de administrador
func RequireAdminRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetHeader("x-user-role")
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Se requieren privilegios de administrador"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireUserId valida que la petición provenga de un usuario autenticado (Gateway debió inyectarlo)
func RequireUserId() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetHeader("x-user-id")
		if userId == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			c.Abort()
			return
		}
		c.Next()
	}
}
