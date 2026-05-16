package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// SaveNode inserts or updates a crawled node in the database
func (db *DB) SaveNode(detail *LinkDetail) error {
	tx, err := db.conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	detail.ID = EnsureID(detail.ID)
	keywordsBytes, _ := json.Marshal(detail.Meta.Keywords)
	
	// 1. Save Meta
	_, err = tx.Exec(`
		INSERT INTO meta (id, url, type, title, description, og_image, og_type, canonical, favicon, author, published_date, modified_date, language, keywords)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(url) DO UPDATE SET
			title=excluded.title, description=excluded.description, og_image=excluded.og_image,
			og_type=excluded.og_type, canonical=excluded.canonical, favicon=excluded.favicon,
			author=excluded.author, modified_date=excluded.modified_date, keywords=excluded.keywords;
	`, detail.ID, detail.URL, detail.Type, detail.Meta.Title, detail.Meta.Description, detail.Meta.OGImage,
		detail.Meta.OGType, detail.Meta.Canonical, detail.Meta.Favicon, detail.Meta.Author,
		detail.Meta.PublishedDate, detail.Meta.ModifiedDate, detail.Meta.Language, string(keywordsBytes))
	
	if err != nil {
		return fmt.Errorf("failed to save meta: %w", err)
	}

	// For updates by URL, we need to get the actual ID (in case it existed)
	var realID string
	err = tx.QueryRow(`SELECT id FROM meta WHERE url = ?`, detail.URL).Scan(&realID)
	if err != nil {
		return fmt.Errorf("failed to retrieve meta ID: %w", err)
	}
	detail.ID = realID

	// 2. Save Technical
	_, err = tx.Exec(`
		INSERT INTO technical (meta_id, domain, ip_masked, ssl, ssl_issuer, http_status, response_time_ms, server, content_type, content_length)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(meta_id) DO UPDATE SET
			ip_masked=excluded.ip_masked, ssl=excluded.ssl, ssl_issuer=excluded.ssl_issuer,
			http_status=excluded.http_status, response_time_ms=excluded.response_time_ms,
			server=excluded.server, content_length=excluded.content_length;
	`, detail.ID, detail.Technical.Domain, detail.Technical.IPMasked, detail.Technical.SSL, detail.Technical.SSLIssuer,
		detail.Technical.HTTPStatus, detail.Technical.ResponseTimeMs, detail.Technical.Server, detail.Technical.ContentType, detail.Technical.ContentLength)
	
	if err != nil {
		return fmt.Errorf("failed to save technical: %w", err)
	}

	// 3. Save Analytics
	tagsBytes, _ := json.Marshal(detail.Analytics.CategoryTags)
	_, err = tx.Exec(`
		INSERT INTO analytics (meta_id, search_appearances, last_crawled, first_seen, crom_rank, category_tags)
		VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(meta_id) DO UPDATE SET
			last_crawled=excluded.last_crawled, crom_rank=excluded.crom_rank, category_tags=excluded.category_tags,
			search_appearances = search_appearances + 1;
	`, detail.ID, detail.Analytics.SearchAppearances, detail.Analytics.LastCrawled, detail.Analytics.FirstSeen, detail.Analytics.CromRank, string(tagsBytes))

	if err != nil {
		return fmt.Errorf("failed to save analytics: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	// Sincronizar com o Global Index
	go IndexNode(detail) // Rodar em background para não travar o crawler

	return nil
}

// IndexNode adiciona ou atualiza um nó no índice global de busca
func IndexNode(detail *LinkDetail) {
	globalDB, err := OpenGlobalIndex()
	if err != nil {
		fmt.Printf("Error opening global index: %v\n", err)
		return
	}

	keywordsBytes, _ := json.Marshal(detail.Meta.Keywords)
	
	_, err = globalDB.Exec(`
		INSERT INTO search_index (id, domain, url, title, description, keywords, published_date, type)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(url) DO UPDATE SET
			title=excluded.title, description=excluded.description, keywords=excluded.keywords, published_date=excluded.published_date, type=excluded.type;
	`, detail.ID, detail.Technical.Domain, detail.URL, detail.Meta.Title, detail.Meta.Description, string(keywordsBytes), detail.Meta.PublishedDate, detail.Type)
	
	if err != nil {
		fmt.Printf("Error indexing node %s: %v\n", detail.URL, err)
	}
}

// GetNode retrieves a full node detail by ID
func (db *DB) GetNode(id string) (*LinkDetail, error) {
	var detail LinkDetail
	detail.ID = id

	// 1. Get Meta
	var keywordsStr string
	err := db.conn.QueryRow(`
		SELECT url, type, title, description, og_image, og_type, canonical, favicon, author, published_date, modified_date, language, keywords
		FROM meta WHERE id = ?
	`, id).Scan(
		&detail.URL, &detail.Type, &detail.Meta.Title, &detail.Meta.Description, &detail.Meta.OGImage,
		&detail.Meta.OGType, &detail.Meta.Canonical, &detail.Meta.Favicon, &detail.Meta.Author,
		&detail.Meta.PublishedDate, &detail.Meta.ModifiedDate, &detail.Meta.Language, &keywordsStr,
	)
	if err == sql.ErrNoRows {
		return nil, nil // Not found
	} else if err != nil {
		return nil, err
	}
	json.Unmarshal([]byte(keywordsStr), &detail.Meta.Keywords)

	// 2. Get Technical
	err = db.conn.QueryRow(`
		SELECT domain, ip_masked, ssl, ssl_issuer, http_status, response_time_ms, server, content_type, content_length
		FROM technical WHERE meta_id = ?
	`, id).Scan(
		&detail.Technical.Domain, &detail.Technical.IPMasked, &detail.Technical.SSL, &detail.Technical.SSLIssuer,
		&detail.Technical.HTTPStatus, &detail.Technical.ResponseTimeMs, &detail.Technical.Server, &detail.Technical.ContentType, &detail.Technical.ContentLength,
	)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// 3. Get Analytics
	var tagsStr string
	err = db.conn.QueryRow(`
		SELECT search_appearances, last_crawled, first_seen, crom_rank, category_tags
		FROM analytics WHERE meta_id = ?
	`, id).Scan(
		&detail.Analytics.SearchAppearances, &detail.Analytics.LastCrawled, &detail.Analytics.FirstSeen, &detail.Analytics.CromRank, &tagsStr,
	)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	json.Unmarshal([]byte(tagsStr), &detail.Analytics.CategoryTags)

	// 4. Get Comments
	rows, err := db.conn.Query(`
		SELECT id, ip_hash, ip_masked, content, timestamp, upvotes, downvotes
		FROM comments WHERE meta_id = ? ORDER BY timestamp DESC
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	detail.Comments = []LinkComment{}
	for rows.Next() {
		var c LinkComment
		if err := rows.Scan(&c.ID, &c.IPHash, &c.IPMasked, &c.Content, &c.Timestamp, &c.Upvotes, &c.Downvotes); err != nil {
			return nil, err
		}
		detail.Comments = append(detail.Comments, c)
	}

	return &detail, nil
}

// AddComment adds a new comment respecting LGPD (hashed and masked IP)
func (db *DB) AddComment(metaID string, ip string, content string) (*LinkComment, error) {
	c := &LinkComment{
		ID:        EnsureID(""),
		IPHash:    GenerateIPHash(ip),
		IPMasked:  GenerateIPMask(ip),
		Content:   content,
		Timestamp: time.Now().UnixMilli(),
		Upvotes:   0,
		Downvotes: 0,
	}

	_, err := db.conn.Exec(`
		INSERT INTO comments (id, meta_id, ip_hash, ip_masked, content, timestamp, upvotes, downvotes)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, c.ID, metaID, c.IPHash, c.IPMasked, c.Content, c.Timestamp, c.Upvotes, c.Downvotes)

	if err != nil {
		return nil, err
	}
	return c, nil
}

// GetAllNodes returns a small summary of all nodes (useful for global index sync)
func (db *DB) GetAllNodes() ([]LinkDetail, error) {
	rows, err := db.conn.Query(`SELECT id, url, title, description FROM meta`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []LinkDetail
	for rows.Next() {
		var n LinkDetail
		if err := rows.Scan(&n.ID, &n.URL, &n.Meta.Title, &n.Meta.Description); err != nil {
			return nil, err
		}
		nodes = append(nodes, n)
	}
	return nodes, nil
}

// NodeExists checks if a URL has already been crawled and saved
func (db *DB) NodeExists(url string) bool {
	var exists int
	err := db.conn.QueryRow(`SELECT 1 FROM meta WHERE url = ?`, url).Scan(&exists)
	return err == nil && exists == 1
}

// ----------------------------------------------------------------------------
// Governance (SRE & Community Moderation)
// ----------------------------------------------------------------------------

func SuggestURL(url string) error {
	globalDB, err := OpenGlobalIndex()
	if err != nil {
		return err
	}

	_, err = globalDB.Exec(`
		INSERT INTO suggested_urls (url, status, suggested_at)
		VALUES (?, 'pending', ?)
		ON CONFLICT(url) DO NOTHING;
	`, url, time.Now().Format(time.RFC3339))
	return err
}

func ReportLink(metaID string, url string, reason string) error {
	globalDB, err := OpenGlobalIndex()
	if err != nil {
		return err
	}

	id := EnsureID("")
	_, err = globalDB.Exec(`
		INSERT INTO reports (id, meta_id, url, reason, reported_at)
		VALUES (?, ?, ?, ?, ?)
	`, id, metaID, url, reason, time.Now().Format(time.RFC3339))
	return err
}

func BanDomain(domain string, reason string) error {
	globalDB, err := OpenGlobalIndex()
	if err != nil {
		return err
	}

	_, err = globalDB.Exec(`
		INSERT INTO banned_domains (domain, reason, banned_at)
		VALUES (?, ?, ?)
		ON CONFLICT(domain) DO UPDATE SET reason=excluded.reason, banned_at=excluded.banned_at;
	`, domain, reason, time.Now().Format(time.RFC3339))
	return err
}

func IsDomainBanned(domain string) bool {
	globalDB, err := OpenGlobalIndex()
	if err != nil {
		return false // Assume not banned if DB error, or maybe safe to block?
	}

	var exists int
	err = globalDB.QueryRow(`SELECT 1 FROM banned_domains WHERE domain = ?`, domain).Scan(&exists)
	return err == nil && exists == 1
}
