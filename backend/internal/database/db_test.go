package database

import (
	"database/sql"
	"testing"
	"os"
	"path/filepath"

	"interview/internal/models"
	_ "github.com/mattn/go-sqlite3"
)

var testDB *sql.DB

// SetupTestDB sets up a test database connection
func SetupTestDB(t *testing.T) *sql.DB {
	path := filepath.Join("..", "..", "assets.db")
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	if err = db.Ping(); err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	return db
}

func TestMain(m *testing.M) {
	testDB = SetupTestDB(nil)
	code := m.Run()
	_ = testDB.Close()
	os.Exit(code)
}

func TestCountTotalAssets(t *testing.T) {
	db := SetupTestDB(t)
	defer db.Close()

	t.Run("Without Filter", func(t *testing.T) {
		count, err := CountTotalAssets(db, "")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if count <= 0 {
			t.Fatalf("Expected count to be greater than 0, got %d", count)
		}
	})

	t.Run("With Filter", func(t *testing.T) {
		count, err := CountTotalAssets(db, "a.AbfFkFY.org")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if count < 0 {
			t.Fatalf("Expected count to be 0 or more, got %d", count)
		}
	})
}

func TestQueryAssets(t *testing.T) {
	db := SetupTestDB(t)
	defer db.Close()

	t.Run("Query with Asset ID", func(t *testing.T) {
		assets, total, err := QueryAssets(db, "1", "", 10, 0)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if total <= 0 {
			t.Fatalf("Expected total assets to be greater than 0, got %d", total)
		}
		if len(assets) == 0 {
			t.Fatalf("Expected assets, got 0 results")
		}
	})

	t.Run("Query with Host Filter", func(t *testing.T) {
		assets, total, err := QueryAssets(db, "", "host_example", 10, 0) // Replace "host_example" with an actual host example from assets.db
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if total < 0 {
			t.Fatalf("Expected total assets to be 0 or more, got %d", total)
		}
	})

	t.Run("Query with Pagination", func(t *testing.T) {
		assets, total, err := QueryAssets(db, "", "", 5, 2)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if len(assets) > 5 {
			t.Fatalf("Expected at most 5 assets, got %d", len(assets))
		}
		if total < 0 {
			t.Fatalf("Expected total to be 0 or more, got %d", total)
		}
	})
}
