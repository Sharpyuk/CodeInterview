package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"interview/internal/database"
	"interview/internal/models"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

// GetAssets retrieves assets from the database.
func GetAssets(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var err error
		assetId := c.Query("id")
		filterHost := c.Query("filter")
		maxAssets := c.Query("maxAssets")
		assetOffset := c.Query("assetOffset")
		limitInt := 0
		offsetInt := 0

		// Validate maxAssets is a number
		if maxAssets != "" {
			limitInt, err = strconv.Atoi(maxAssets)
			if err != nil {
				c.JSON(http.StatusBadRequest, "Invalid maxAssets given")
			}
		}

		// Validate assetOffset is a number
		if assetOffset != "" {
			offsetInt, err = strconv.Atoi(assetOffset)
			if err != nil {
				c.JSON(http.StatusBadRequest, "Invalid assetOffest given")
			}
		}

		assets, totalCount, err := database.QueryAssets(db, assetId, filterHost, limitInt, offsetInt)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		pageNumber := 1
		pageSize := totalCount
		totalPages := 1
		if limitInt > 0 {
			totalPages = totalCount / limitInt
			if totalCount%limitInt > 0 {
				totalPages++
			}
			pageSize = limitInt

			if offsetInt > 0 {
				pageNumber = (totalCount / limitInt) + 1
			}
		}

		response := models.AssetContainer{
			Assets:     assets,
			PageNumber: pageNumber,
			PageSize:   pageSize,
			TotalPages: totalPages,
			TotalCount: totalCount,
		}
		c.JSON(http.StatusOK, response)
	}

}
