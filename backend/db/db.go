package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite" // Pure Go SQLite driver
)

// DataDir is the path where databases will be stored
var DataDir = "./data/sites"
var IndexDir = "./data/index"

// DB struct holds the connection for a specific site
type DB struct {
	conn   *sql.DB
	domain string
}

func init() {
	// Ensure the directories exist
	if err := os.MkdirAll(DataDir, 0755); err != nil {
		fmt.Printf("Warning: Failed to create data directory: %v\n", err)
	}
	if err := os.MkdirAll(IndexDir, 0755); err != nil {
		fmt.Printf("Warning: Failed to create index directory: %v\n", err)
	}
}

// OpenSiteDB opens or creates an SQLite database for the specified domain
func OpenSiteDB(domain string) (*DB, error) {
	if domain == "" {
		return nil, fmt.Errorf("domain cannot be empty")
	}

	dbPath := filepath.Join(DataDir, domain+".db")
	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open db for %s: %w", domain, err)
	}

	// Enable WAL mode for better concurrent performance
	_, err = conn.Exec("PRAGMA journal_mode=WAL;")
	if err != nil {
		return nil, fmt.Errorf("failed to enable WAL: %w", err)
	}

	siteDB := &DB{
		conn:   conn,
		domain: domain,
	}

	if err := siteDB.migrate(); err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to migrate db for %s: %w", domain, err)
	}

	return siteDB, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.conn.Close()
}

// migrate creates the necessary tables
func (db *DB) migrate() error {
	schema := `
	CREATE TABLE IF NOT EXISTS meta (
		id TEXT PRIMARY KEY,
		url TEXT UNIQUE NOT NULL,
		type TEXT NOT NULL,
		title TEXT,
		description TEXT,
		og_image TEXT,
		og_type TEXT,
		canonical TEXT,
		favicon TEXT,
		author TEXT,
		published_date TEXT,
		modified_date TEXT,
		language TEXT,
		keywords TEXT -- JSON array
	);

	CREATE TABLE IF NOT EXISTS technical (
		meta_id TEXT PRIMARY KEY,
		domain TEXT,
		ip_masked TEXT,
		ssl BOOLEAN,
		ssl_issuer TEXT,
		http_status INTEGER,
		response_time_ms INTEGER,
		server TEXT,
		content_type TEXT,
		content_length INTEGER,
		FOREIGN KEY(meta_id) REFERENCES meta(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS analytics (
		meta_id TEXT PRIMARY KEY,
		search_appearances INTEGER DEFAULT 0,
		last_crawled TEXT,
		first_seen TEXT,
		crom_rank INTEGER DEFAULT 0,
		category_tags TEXT, -- JSON array
		FOREIGN KEY(meta_id) REFERENCES meta(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS comments (
		id TEXT PRIMARY KEY,
		meta_id TEXT NOT NULL,
		ip_hash TEXT NOT NULL,
		ip_masked TEXT NOT NULL,
		content TEXT NOT NULL,
		timestamp INTEGER NOT NULL,
		upvotes INTEGER DEFAULT 0,
		downvotes INTEGER DEFAULT 0,
		FOREIGN KEY(meta_id) REFERENCES meta(id) ON DELETE CASCADE
	);

	CREATE INDEX IF NOT EXISTS idx_comments_meta_id ON comments(meta_id);
	`

	_, err := db.conn.Exec(schema)
	return err
}

// OpenGlobalIndex opens the global search index database
func OpenGlobalIndex() (*sql.DB, error) {
	dbPath := filepath.Join(IndexDir, "global_index.db")
	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open global index: %w", err)
	}

	_, err = conn.Exec("PRAGMA journal_mode=WAL;")
	if err != nil {
		return nil, fmt.Errorf("failed to enable WAL for index: %w", err)
	}

	schema := `
	CREATE TABLE IF NOT EXISTS search_index (
		id TEXT PRIMARY KEY,
		domain TEXT NOT NULL,
		url TEXT UNIQUE NOT NULL,
		title TEXT,
		description TEXT,
		keywords TEXT
	);

	-- FTS virtual table for fast full-text search
	CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
		title, description, keywords, content=search_index, content_rowid=rowid
	);

	-- Triggers to automatically update FTS when search_index is modified
	CREATE TRIGGER IF NOT EXISTS search_index_ai AFTER INSERT ON search_index BEGIN
		INSERT INTO search_fts(rowid, title, description, keywords) VALUES (new.rowid, new.title, new.description, new.keywords);
	END;
	CREATE TRIGGER IF NOT EXISTS search_index_ad AFTER DELETE ON search_index BEGIN
		INSERT INTO search_fts(search_fts, rowid, title, description, keywords) VALUES('delete', old.rowid, old.title, old.description, old.keywords);
	END;
	CREATE TRIGGER IF NOT EXISTS search_index_au AFTER UPDATE ON search_index BEGIN
		INSERT INTO search_fts(search_fts, rowid, title, description, keywords) VALUES('delete', old.rowid, old.title, old.description, old.keywords);
		INSERT INTO search_fts(rowid, title, description, keywords) VALUES (new.rowid, new.title, new.description, new.keywords);
	END;
	`
	_, err = conn.Exec(schema)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to migrate global index: %w", err)
	}

	return conn, nil
}

// Ensure the tables have standard initial data (e.g., when a crawler inserts them)
// Additional functions for CRUD operations will go here...
