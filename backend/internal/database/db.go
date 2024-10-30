package database

import (
	"database/sql"
	"interview/internal/models"
	"interview/internal/utils"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func SetupDatabase(filename string) *sql.DB {
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		panic("Unable to find database file")
	}

	db, err := sql.Open("sqlite3", filename) // Specify your database file here
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
		panic(err)
	}

	// Verify the connection, just to be sure!
	if err = db.Ping(); err != nil {
		log.Fatalf("Error connecting to database: %v", err)
		panic(err)
	}

	// Set PRAGMA settings
	//  Increase cache to 10,000 rows which will help with bigger datasets, should be optimed based on memory size.
	//  larger cache can help with heavy read workloads
	_, err = db.Exec("PRAGMA cache_size = 10000")
	if err != nil {
		panic(err)
	}

	// Added performance benefits whilst being relatively safe.  Since no database writes,
	//  we could potentially turn this to OFF, but just in case of future updates of the code lets leave it as NORMAL.
	//  FULL/EXTRA can be used to ensure data safety on write, but is much slower
	_, err = db.Exec("PRAGMA synchronous = NORMAL")
	if err != nil {
		panic(err)
	}

	// Write ahead logging, allows for concurrent read and writes.  Also offers better recovert option in case of a crash
	_, err = db.Exec("PRAGMA journal_mode = WAL")
	if err != nil {
		panic(err)
	}

	// Turn on foreign key enforcement to ensure data integrity
	_, err = db.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		panic(err)
	}

	log.Println("Connected to the database successfully.")
	return db
}

// CountTotalAssets - Count number of assets based on optional host/assetId filter
func CountTotalAssets(db *sql.DB, filterHost, assetId string) (int, error) {
	var count int
	var err error
	var arg any

	sqlStmt := "SELECT COUNT(*) FROM assets"
	if filterHost != "" {
		sqlStmt += " WHERE host LIKE ?"
		arg = "%" + filterHost + "%" 
	} else if assetId != "" {
		sqlStmt += " WHERE id LIKE ?"
		arg = assetId
	}

	// Prepare the statement
	stmt, err := db.Prepare(sqlStmt)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	// Bind the filter host if provided
	if filterHost != "" || assetId != "" {
		
		err = stmt.QueryRow(arg).Scan(&count)
	} else {
		err = stmt.QueryRow().Scan(&count)
	}

	return count, err
}

func QueryAssets(db *sql.DB, assetId, filterHost string, maxAssets, assetOffset int) ([]models.Asset, int, error) {

	totalCount, err := CountTotalAssets(db, filterHost, assetId)
	if err != nil {
		return nil, 0, err
	}

	args := []any{}
	// Prepare the filter, based on whether user is searching by ID or hostname
	filter := ""
	if assetId != "" {
		filter = " WHERE assets.id = ? "
		args = append(args, assetId)
	} else if filterHost != "" {
		filter = " WHERE assets.host LIKE ? "
		args = append(args, "%"+filterHost+"%")
	}

	// Prepare Limit and Offset for paginated results.
	limit := ""
	if maxAssets > 0 && assetOffset >= 0 {
		limit = " LIMIT ? OFFSET ? "
		args = append(args, maxAssets, assetOffset)
	}

	// Prepare the main asset query.  This query uses joins to prevent multiple database lookups.
	//  preparing the statement will prevent sql injection attacks.
	query := `
	SELECT a.id, a.host, a.comment, a.owner, i.address, p.port
	FROM (
		SELECT assets.id id, assets.host, assets.comment, assets.owner
		FROM assets
	` + filter + ` ORDER BY assets.host ASC ` + limit + `) a
	LEFT JOIN 
		ips i ON a.id = i.asset_id
	LEFT JOIN 
		ports p ON a.id = p.asset_id
	ORDER BY a.host ASC 
	`

	sqlStmt, err := db.Prepare(query)
	if err != nil {
		return nil, 0, err
	}

	defer sqlStmt.Close()

	var assets []models.Asset
	assetMap := make(map[int]*models.Asset)

	// Iterate the rows
	rows, err := sqlStmt.Query(args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	// Iterate the rows
	for rows.Next() {

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
