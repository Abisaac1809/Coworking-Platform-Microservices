package middlewares

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func getSecret() []byte {
	s := os.Getenv("SECRET_KEY")
	if s == "" {
		s = "clave-ultra-secreta"
	}
	return []byte(s)
}

// RequireUserId valida el token Bearer, extrae user_id y user_role, y los guarda en el contexto.
func RequireUserId() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
			c.Abort()
			return
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return getSecret(), nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido o expirado"})
			c.Abort()
			return
		}
		c.Set("user_id", claims.Subject)
		c.Set("user_role", claims.Role)
		c.Next()
	}
}

// RequireAdminRole verifica que el usuario (ya autenticado por RequireUserId) tenga rol Admin.
func RequireAdminRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("user_role")
		if role != "Admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Se requieren privilegios de administrador"})
			c.Abort()
			return
		}
		c.Next()
	}
}
