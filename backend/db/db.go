package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	_ "modernc.org/sqlite" // Pure Go SQLite driver
)

// DataDir is the path where databases will be stored
var DataDir = "./data/sites"
var IndexDir = "./data/index"

var (
	globalDBPool *sql.DB
	globalDBOnce sync.Once
)

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
	// Add PRAGMAs to DSN to ensure all connections in the pool have busy_timeout
	dsn := dbPath + "?_pragma=busy_timeout(10000)&_pragma=journal_mode(WAL)"
	conn, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open db for %s: %w", domain, err)
	}

	// Double check PRAGMAs on first connection
	_, err = conn.Exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=10000;")
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
	var initErr error
	globalDBOnce.Do(func() {
		dbPath := filepath.Join(IndexDir, "global_index.db")
		dsn := dbPath + "?_pragma=busy_timeout(15000)&_pragma=journal_mode(WAL)"
		conn, err := sql.Open("sqlite", dsn)
		if err != nil {
			initErr = fmt.Errorf("failed to open global index: %w", err)
			return
		}

		_, err = conn.Exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=15000;")
		if err != nil {
			initErr = fmt.Errorf("failed to enable WAL for index: %w", err)
			return
		}
		
		// Fix SQLITE_BUSY by serializing writes to the global index
		conn.SetMaxOpenConns(1)

	schema := `
	CREATE TABLE IF NOT EXISTS search_index (
		id TEXT PRIMARY KEY,
		domain TEXT NOT NULL,
		url TEXT UNIQUE NOT NULL,
		type TEXT DEFAULT 'page',
		title TEXT,
		description TEXT,
		keywords TEXT,
		published_date TEXT,
		embedding BLOB
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

	-- Governance Tables
	CREATE TABLE IF NOT EXISTS banned_domains (
		domain TEXT PRIMARY KEY,
		reason TEXT,
		banned_at TEXT
	);

	CREATE TABLE IF NOT EXISTS suggested_urls (
		url TEXT PRIMARY KEY,
		status TEXT DEFAULT 'pending',
		suggested_at TEXT
	);

	CREATE TABLE IF NOT EXISTS reports (
		id TEXT PRIMARY KEY,
		meta_id TEXT NOT NULL,
		url TEXT NOT NULL,
		reason TEXT NOT NULL,
		reported_at TEXT
	);
	`
	// Attempt to add published_date and embedding if table already exists (safe migrations)
	conn.Exec("ALTER TABLE search_index ADD COLUMN published_date TEXT;")
	conn.Exec("ALTER TABLE search_index ADD COLUMN embedding BLOB;")
	conn.Exec("ALTER TABLE search_index ADD COLUMN type TEXT DEFAULT 'page';")

	_, err = conn.Exec(schema)
	if err != nil {
		initErr = fmt.Errorf("failed to migrate global index: %w", err)
		return
	}

		globalDBPool = conn
	})

	if initErr != nil {
		return nil, initErr
	}

	return globalDBPool, nil
}

// Ensure the tables have standard initial data (e.g., when a crawler inserts them)
// Additional functions for CRUD operations will go here...
