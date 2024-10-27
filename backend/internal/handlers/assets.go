package handlers

import (
	"fmt"
	"net/http"
	"database/sql"

	"github.com/gin-gonic/gin"
	"interview/internal/models"
	"interview/internal/database"
	"interview/internal/utils"
	_ "github.com/mattn/go-sqlite3"
)

// queryAssets retrieves assets from the database.
func QueryAssets(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
		assetId := c.Query("id")
		filterHost := c.Query("filter")
		maxAssets := c.Query("maxAssets")
		assetOffset := c.Query("assetOffset")

		if filterHost != "" {
			filterHost = "%" + filterHost + "%"
		}

		assets, totalCount, err := database.QueryAssets(db, assetId, filterHost, maxAssets, assetOffset)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		totalPages := totalCount / 10 // Assuming 10 items per page, adjust accordingly
		if totalCount%10 > 0 {
			totalPages++
		}

		response := models.AssetContainer{
			Assets:     assets,
			PageNumber: (totalCount / 10) + 1, // Current page number (calculate based on offset)
			PageSize:   len(assets),           // Number of assets returned
			TotalPages: totalPages,
			TotalCount: totalCount,
		}
		c.JSON(http.StatusOK, response)
	}

	


        // assetID := c.Query("id") // Optional query parameter

        // var query string
        // if assetID != "" {
        //     query = "SELECT id, host, comment, owner FROM assets WHERE id = ?"
        // } else {
        //     query = "SELECT id, host, comment, owner FROM assets"
        // }

        // // Prepare the statement
        // stmt, err := db.Prepare(query)
        // if err != nil {
        //     c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare query"})
        //     return
        // }
        // defer stmt.Close()

        // // Execute the statement
        // var rows *sql.Rows
        // if assetID != "" {
        //     rows, err = stmt.Query(assetID)
        // } else {
        //     rows, err = stmt.Query()
        // }
        // if err != nil {
        //     c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to execute query"})
        //     return
        // }
        // defer rows.Close()

        // // Collect results
        // var assets []models.Asset
        // for rows.Next() {
        //     var asset models.Asset
        //     if err := rows.Scan(&asset.ID, &asset.Host, &asset.Comment, &asset.Owner); err != nil {
        //         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
        //         return
        //     }
        //     assets = append(assets, asset)
        // }

        // // Return results
        // c.JSON(http.StatusOK, assets)
    
}




// queryAssets - Return Assets based on pagination and filters
func queryAssets(conn *sql.DB, assetId, filterHost, maxAssets, assetOffset string) ([]models.Asset, int, error) {
	var err error
	//sqlStmt := &sqlite3.Stmt{}

	// // Count total assets before filtering
	// var totalCount int
	// countQuery := "SELECT COUNT(*) FROM assets"
	// if filterHost != "" {
	// 	countQuery += " WHERE host LIKE ?"
	// }
	// countStmt, err := conn.Prepare(countQuery)
	// if err != nil {
	// 	return nil, 0, err
	// }
	// defer countStmt.Close()
	// if filterHost != "" {
	// 	countStmt.Bind(filterHost)
	// } else {
	// 	countStmt.Bind()
	// }

	// countStmt.Step()
	// countStmt.Scan(&totalCount)

	totalCount, err := database.CountTotalAssets(conn, filterHost)
	if err != nil {
		return nil, 0, err
	}

	// Prepare the main asset query
	filter := ""
	if filterHost != "" {
		filter = " WHERE assets.host LIKE ? "
	}
	query := `
	SELECT a.id, a.host, a.comment, a.owner, i.address, p.port
	FROM (
		SELECT assets.id id, assets.host, assets.comment, assets.owner
		FROM assets
	` + filter + `
		LIMIT ? OFFSET ? 
	) a
	LEFT JOIN 
		ips i ON a.id = i.asset_id
	LEFT JOIN 
		ports p ON a.id = p.asset_id
	`
	sqlStmt, err := conn.Prepare(query)
	if err != nil {
		return nil, 0, err
	}
	if filterHost != "" {
		_, err = sqlStmt.Exec(filterHost, maxAssets, assetOffset)
	} else {
		_, err = sqlStmt.Exec(maxAssets, assetOffset)
	}
	if err != nil {
		return nil, 0, err
	}
	defer sqlStmt.Close()

	var assets []models.Asset
	assetMap := make(map[int]*models.Asset)

	 // Iterate the rows
	 rows, err := sqlStmt.Query()
	 if err != nil {
		 return nil, 0, err
	 }
	 defer rows.Close()

	// Iterate the rows
	for rows.Next() {
		// hasRow, err := sqlStmt.Step()
		// if err != nil {
		// 	return nil, 0, err
		// }
		// if !hasRow {
		// 	break
		// }

		var id int
		var host, comment, owner, ip_address string
		var port_number int
		if err := rows.Scan(&id, &host, &comment, &owner, &ip_address, &port_number); err != nil {
			return nil, 0, err
		}

		if asset, exists := assetMap[id]; exists {
			if ip_address != "" {
				if !utils.IpExists(asset.IPs, models.IP{Address: ip_address}) {
					asset.IPs = append(asset.IPs, models.IP{Address: ip_address})
				}
			}
			if port_number != 0 {
				if !utils.PortExists(asset.Ports, models.Port{Port: port_number}) {
					asset.Ports = append(asset.Ports, models.Port{Port: port_number})
				}
			}
		} else {
			newAsset := models.Asset{
				ID:      id,
				Host:    host,
				Comment: comment,
				Owner:   owner,
				IPs:     make([]models.IP, 0),
				Ports:   make([]models.Port, 0),
			}
			if ip_address != "" {
				newAsset.IPs = append(newAsset.IPs, models.IP{Address: ip_address})
			}
			if port_number != 0 {
				newAsset.Ports = append(newAsset.Ports, models.Port{Port: port_number})
			}
			assetMap[id] = &newAsset
		}
	}

	for _, asset := range assetMap {
		assets = append(assets, utils.GenerateSignature(*asset))
	}

	return assets, totalCount, nil
}
