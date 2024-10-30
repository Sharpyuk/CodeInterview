package main

import (
	"interview/internal/database"
	"interview/internal/middleware"
	"interview/internal/handlers"
	"github.com/gin-gonic/gin"
)

const dbFileName = "assets.db"

func main() {
	db := database.SetupDatabase(dbFileName)
	defer db.Close()

	router := gin.Default()

	router.Use(middleware.CORSConfig())

	router.GET("/assets", handlers.GetAssets(db))
	
	router.Run(":8080")
}

