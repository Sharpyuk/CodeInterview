package middleware

import (
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

// CORSConfig sets up the CORS middleware configuration using a gin.HandlerFunc
func CORSConfig() gin.HandlerFunc {
    corsConfig := cors.Config{
        AllowOrigins:     []string{"*"}, // Change to specific origins in production
        AllowMethods:     []string{"GET"},  // Removed  "POST", "PUT", "DELETE", "OPTIONS" as they're not required
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }

    return cors.New(corsConfig)
}