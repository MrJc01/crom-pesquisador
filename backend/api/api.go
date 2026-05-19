package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/crom-pesquisador/backend/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

var searchCache sync.Map

type cacheItem struct {
	data      interface{}
	expiresAt time.Time
}

// SetupRouter configures the Chi router with middleware and routes
func SetupRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP) // Needed for LGPD IP extraction

	// Basic CORS for local development
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
		// Root API Endpoint (Healthcheck/Status)
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			jsonResponse(w, http.StatusOK, map[string]interface{}{
				"name":    "CROM Engine API",
				"version": "1.0.0",
				"status":  "online",
			})
		})
		
		r.Get("/search", handleSearch)
		r.Get("/suggest", handleSuggest)
		r.Get("/proxy", handleImageProxy)
		r.Post("/chat", handleChat)
		
		// Governance
		r.With(httprate.LimitByIP(5, 1*time.Minute)).Post("/suggest-url", handleSuggestURL)
		r.With(httprate.LimitByIP(3, 1*time.Minute)).Post("/report", handleReportLink)
		
		r.Route("/link", func(r chi.Router) {
			r.Get("/{id}", handleGetLink)
			
			// Proteção LGPD contra Spam (Rate Limiting de 3 por minuto por IP)
			r.With(httprate.LimitByIP(3, 1*time.Minute)).Post("/{id}/comment", handlePostComment)
		})

		r.Get("/crawlers", handleGetCrawlers)

		r.Route("/admin", func(r chi.Router) {
			r.Use(adminAuth)
			r.Get("/stats", handleAdminStats)
			r.Get("/suggestions", handleAdminSuggestions)
			r.Post("/action", handleAdminAction)
		})
	})

	return r
}

func adminAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		expected := os.Getenv("ADMIN_SECRET")
		if expected == "" {
			expected = "crom-admin-123" // Fallback for dev
		}
		if token != "Bearer "+expected {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func jsonResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// ----------------------------------------------------------------------------
// Handlers
// ----------------------------------------------------------------------------

func handleSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	
	if query == "" {
		jsonResponse(w, http.StatusOK, map[string]interface{}{
			"query": "", "total": 0, "time": 0, "results": []interface{}{}, 
			"images": []interface{}{}, "videos": []interface{}{}, 
			"news": []interface{}{}, "code": []interface{}{},
			"academic": []interface{}{}, "shopping": []interface{}{},
			"related": []interface{}{},
			"hasMore": false, "page": 1,
		})
		return
	}

	// Cache Check
	page := r.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}
	cacheKey := query + "_pg" + page
	if cached, ok := searchCache.Load(cacheKey); ok {
		item := cached.(cacheItem)
		if time.Now().Before(item.expiresAt) {
			jsonResponse(w, http.StatusOK, item.data)
			return
		}
		searchCache.Delete(cacheKey)
	}

	globalDB, err := db.OpenGlobalIndex()
	if err != nil {
		http.Error(w, "Search index unavailable", http.StatusServiceUnavailable)
		return
	}

	// Query FTS table
	ftsQuery := query + "*"
	
	pageStr := r.URL.Query().Get("page")
	pageNum := 1
	if pageStr != "" {
		fmt.Sscanf(pageStr, "%d", &pageNum)
	}
	limit := 15
	offset := (pageNum - 1) * limit
	
	tab := r.URL.Query().Get("tab")
	if tab == "" {
		tab = "all"
	}
	
	targetNodeType := "page"
	if tab == "images" { targetNodeType = "image" }
	if tab == "videos" { targetNodeType = "video" }
	if tab == "code" { targetNodeType = "code" }
	if tab == "academic" { targetNodeType = "academic" }
	if tab == "shopping" { targetNodeType = "shopping" }
	if tab == "news" { targetNodeType = "page" } // News is extracted from pages with pub date

	// 1. Get Absolute Total Matches ONLY for the current tab's content type
	var absoluteTotal int
	globalDB.QueryRow(`
		SELECT COUNT(*) 
		FROM search_index 
		JOIN search_fts ON search_index.rowid = search_fts.rowid
		WHERE search_fts MATCH ? 
		  AND search_index.type = ?
		  AND search_index.domain NOT IN (SELECT domain FROM banned_domains)
	`, ftsQuery, targetNodeType).Scan(&absoluteTotal)

	// 2. Fetch results per type
	results := make([]map[string]interface{}, 0)
	newsResults := make([]map[string]interface{}, 0)
	images := make([]map[string]interface{}, 0)
	videos := make([]map[string]interface{}, 0)
	code := make([]map[string]interface{}, 0)
	academic := make([]map[string]interface{}, 0)
	shopping := make([]map[string]interface{}, 0)

	typesToFetch := []string{targetNodeType}
	hasMore := false
	
	// Prepara a string limpa para o LIKE do Boost de Domínio
	cleanQuery := strings.TrimSpace(query)

	for _, nodeType := range typesToFetch {
		rows, err := globalDB.Query(`
			SELECT search_index.id, search_index.domain, search_index.url, search_index.type, search_index.title, search_index.description, search_index.published_date 
			FROM search_index 
			JOIN search_fts ON search_index.rowid = search_fts.rowid
			WHERE search_fts MATCH ? 
			  AND search_index.type = ?
			  AND search_index.domain NOT IN (SELECT domain FROM banned_domains)
			ORDER BY 
			  CASE 
			    WHEN search_index.domain LIKE '%' || ? || '%' THEN search_fts.rank - 10000 
			    ELSE search_fts.rank 
			  END ASC,
			  search_fts.rank ASC
			LIMIT ? OFFSET ?
		`, ftsQuery, nodeType, cleanQuery, limit, offset)
		
		if err != nil {
			continue
		}
		
		count := 0
		for rows.Next() {
			count++
			var id, domain, url, t, title, description string
			var pubDate sql.NullString
			if err := rows.Scan(&id, &domain, &url, &t, &title, &description, &pubDate); err != nil {
				continue
			}
			
			apiID := domain + "|" + id
			
			if nodeType == "image" {
				images = append(images, map[string]interface{}{
					"id": apiID, "src": description, "alt": title, "site": domain,
				})
			} else if nodeType == "video" {
				videos = append(videos, map[string]interface{}{
					"id": apiID, "title": title, "thumb": description, "channel": domain, "views": "N/A", "duration": "0:00",
				})
			} else if nodeType == "code" {
				code = append(code, map[string]interface{}{
					"id": apiID, "title": title, "language": "txt", "content": description, "site": domain,
				})
			} else if nodeType == "academic" {
				academic = append(academic, map[string]interface{}{
					"id": apiID, "title": title, "url": url, "snippet": description, "site": domain, "year": pubDate.String,
				})
			} else if nodeType == "shopping" {
				shopping = append(shopping, map[string]interface{}{
					"id": apiID, "title": title, "url": url, "price": description, "site": domain,
				})
			} else {
				item := map[string]interface{}{
					"id": apiID, "url": url, "title": title, "snippet": description, "site": domain, "breadcrumb": domain + " › " + title,
				}
				if pubDate.Valid && pubDate.String != "" {
					item["time"] = pubDate.String
					newsResults = append(newsResults, item)
				} else {
					results = append(results, item)
				}
			}
		}
		rows.Close()
		
		if count == limit {
			hasMore = true
		}
	}

	var kp *KnowledgePanel
	if pageNum == 1 {
		kp = getKnowledgePanel(query)
	}

	response := map[string]interface{}{
		"query":   query,
		"total":   absoluteTotal,
		"time":    0.02,
		"results": results,
		"images":  images, 
		"videos":  videos,
		"news":    newsResults,
		"code":    code,
		"academic": academic,
		"shopping": shopping,
		"knowledgePanel": kp,
		"related": []interface{}{},
		"hasMore": hasMore,
		"page":    pageNum,
	}

	// ---------------------------------------------------------
	// ON-DEMAND SEED INJECTION (Motor Autônomo)
	// Adiciona a pesquisa na fila do crawler para descobertas
	// ---------------------------------------------------------
	go func(q string) {
		if globalDB != nil && len(q) > 2 {
			wikiSearch := fmt.Sprintf("https://pt.wikipedia.org/w/index.php?search=%s", url.QueryEscape(q))
			ddgSearch := fmt.Sprintf("https://html.duckduckgo.com/html/?q=%s", url.QueryEscape(q))
			
			now := time.Now().Format(time.RFC3339)
			globalDB.Exec("INSERT OR IGNORE INTO crawler_queue (url, status, discovered_at) VALUES (?, 'pending', ?)", wikiSearch, now)
			globalDB.Exec("INSERT OR IGNORE INTO crawler_queue (url, status, discovered_at) VALUES (?, 'pending', ?)", ddgSearch, now)
		}
	}(query)

	// Save to cache (5 minutes TTL)
	searchCache.Store(cacheKey, cacheItem{
		data:      response,
		expiresAt: time.Now().Add(5 * time.Minute),
	})

	jsonResponse(w, http.StatusOK, response)
}

func handleImageProxy(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, "Missing URL", http.StatusBadRequest)
		return
	}

	// Basic validation
	parsed, err := url.Parse(targetURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		http.Error(w, "Invalid URL format", http.StatusBadRequest)
		return
	}

	// Prevent proxying localhost / SSRF (Basic protection)
	host := strings.ToLower(parsed.Hostname())
	if host == "localhost" || host == "127.0.0.1" || strings.HasPrefix(host, "10.") || strings.HasPrefix(host, "192.168.") || strings.HasPrefix(host, "169.254.") {
		http.Error(w, "Forbidden address", http.StatusForbidden)
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	// Masquerade User-Agent
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CROM/1.0 ImageProxy")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to fetch image", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Only proxy images or media
	contentType := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") && !strings.HasPrefix(contentType, "video/") {
		http.Error(w, "Unsupported content type", http.StatusUnsupportedMediaType)
		return
	}

	// Set headers
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Cache-Control", "public, max-age=86400") // Cache aggressively on client

	io.Copy(w, resp.Body)
}

func handleSuggest(w http.ResponseWriter, r *http.Request) {
	// query := r.URL.Query().Get("q")
	jsonResponse(w, http.StatusOK, []string{})
}

func handleChat(w http.ResponseWriter, r *http.Request) {
	// message := r.FormValue("message")
	jsonResponse(w, http.StatusOK, "Este é o backend Go do CROM (WIP).")
}

func handleGetLink(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	
	// Format of ID right now might be just a hash or UUID.
	// For testing, we'll try opening "crom.me.db" if it exists, otherwise just return mock or 404.
	// In reality, the ID from search results should encode the domain (e.g. "crom.me|uuid")
	
	var domain string
	parts := strings.SplitN(id, "|", 2)
	if len(parts) == 2 {
		domain = parts[0]
		id = parts[1]
	} else {
		// Fallback for demo purposes
		domain = "crom.me" 
	}

	siteDB, err := db.OpenSiteDB(domain)
	if err != nil {
		http.Error(w, "Database unavailable", http.StatusServiceUnavailable)
		return
	}
	defer siteDB.Close()

	node, err := siteDB.GetNode(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if node == nil {
		http.Error(w, "Node not found", http.StatusNotFound)
		return
	}

	jsonResponse(w, http.StatusOK, node)
}

func handlePostComment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	
	var req struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Content) == "" {
		http.Error(w, "Invalid content", http.StatusBadRequest)
		return
	}

	ip := r.RemoteAddr
	// In production behind reverse proxy:
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		ip = strings.Split(fwd, ",")[0]
	}

	// Determine domain
	var domain string
	parts := strings.SplitN(id, "|", 2)
	if len(parts) == 2 {
		domain = parts[0]
		id = parts[1]
	} else {
		domain = "crom.me" 
	}

	siteDB, err := db.OpenSiteDB(domain)
	if err != nil {
		http.Error(w, "Database unavailable", http.StatusServiceUnavailable)
		return
	}
	defer siteDB.Close()

	comment, err := siteDB.AddComment(id, ip, req.Content)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonResponse(w, http.StatusCreated, comment)
}

func handleGetCrawlers(w http.ResponseWriter, r *http.Request) {
	// Will list running crawlers later by interacting with OS or internal state
	jsonResponse(w, http.StatusOK, []interface{}{})
}

// ----------------------------------------------------------------------------
// Governance Handlers
// ----------------------------------------------------------------------------

func handleSuggestURL(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.URL) == "" {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	// Basic validation
	parsed, err := url.Parse(req.URL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		http.Error(w, "Invalid URL format", http.StatusBadRequest)
		return
	}

	if err := db.SuggestURL(req.URL); err != nil {
		http.Error(w, "Failed to submit suggestion", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "URL suggested successfully"})
}

func handleReportLink(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MetaID string `json:"meta_id"`
		URL    string `json:"url"`
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Reason == "" {
		http.Error(w, "Invalid report payload", http.StatusBadRequest)
		return
	}

	if err := db.ReportLink(req.MetaID, req.URL, req.Reason); err != nil {
		http.Error(w, "Failed to submit report", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Report submitted successfully"})
}

// ----------------------------------------------------------------------------
// Admin Handlers
// ----------------------------------------------------------------------------

func handleAdminStats(w http.ResponseWriter, r *http.Request) {
	globalDB, err := db.OpenGlobalIndex()
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	var totalNodes int
	globalDB.QueryRow("SELECT COUNT(*) FROM search_index").Scan(&totalNodes)

	var totalSuggestions int
	globalDB.QueryRow("SELECT COUNT(*) FROM suggested_urls WHERE status = 'pending'").Scan(&totalSuggestions)

	jsonResponse(w, http.StatusOK, map[string]interface{}{
		"total_nodes": totalNodes,
		"pending_suggestions": totalSuggestions,
		"status": "healthy",
	})
}

func handleAdminSuggestions(w http.ResponseWriter, r *http.Request) {
	globalDB, err := db.OpenGlobalIndex()
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	rows, err := globalDB.Query("SELECT url, status, suggested_at FROM suggested_urls WHERE status = 'pending' LIMIT 50")
	if err != nil {
		http.Error(w, "DB query error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var suggestions []map[string]interface{}
	for rows.Next() {
		var url, status, suggestedAt string
		if err := rows.Scan(&url, &status, &suggestedAt); err != nil {
			continue
		}
		suggestions = append(suggestions, map[string]interface{}{
			"url": url,
			"status": status,
			"suggested_at": suggestedAt,
		})
	}
	
	if suggestions == nil {
		suggestions = make([]map[string]interface{}, 0)
	}

	jsonResponse(w, http.StatusOK, suggestions)
}

func handleAdminAction(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL    string `json:"url"`
		Action string `json:"action"` // "approve" or "reject"
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	globalDB, err := db.OpenGlobalIndex()
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	if req.Action == "approve" || req.Action == "reject" {
		_, err := globalDB.Exec("UPDATE suggested_urls SET status = ? WHERE url = ?", req.Action, req.URL)
		if err != nil {
			http.Error(w, "DB update error", http.StatusInternalServerError)
			return
		}
		// If approved, in the future this would append to crom.json or alert the crawler.
	}

	jsonResponse(w, http.StatusOK, map[string]string{"message": "Action applied"})
}

// ExtractDomain helper
func ExtractDomain(rawURL string) string {
	rawURL = strings.TrimPrefix(rawURL, "http://")
	rawURL = strings.TrimPrefix(rawURL, "https://")
	parts := strings.Split(rawURL, "/")
	domain := parts[0]
	return strings.TrimPrefix(domain, "www.")
}

// ----------------------------------------------------------------------------
// Knowledge Panel (Snippets)
// ----------------------------------------------------------------------------

type KnowledgePanel struct {
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Description string `json:"description"`
	Image       string `json:"image,omitempty"`
	Facts       []Fact `json:"facts"`
}

type Fact struct {
	Label string `json:"label"`
	Value string `json:"value"`
	Link  string `json:"link,omitempty"`
}

func getKnowledgePanel(query string) *KnowledgePanel {
	q := strings.ToLower(strings.TrimSpace(query))
	
	if q == "dolar" || q == "dólar" || q == "usd" || q == "cotacao dolar" || q == "cotação dólar" {
		return fetchBinanceAPI("USDTBRL", "Dólar (USDT/BRL)", "Referência via Tether (Binance)", "Acompanhe a cotação em tempo real através do pareamento cripto.")
	}
	if q == "bitcoin" || q == "btc" || q == "cotacao bitcoin" {
		return fetchBinanceAPI("BTCBRL", "Bitcoin (BTC)", "Criptomoeda Descentralizada", "Ouro digital e reserva de valor soberana.")
	}
	
	return nil
}

func fetchBinanceAPI(symbol, title, subtitle, desc string) *KnowledgePanel {
	resp, err := http.Get("https://api.binance.com/api/v3/ticker/24hr?symbol=" + symbol)
	if err != nil || resp.StatusCode != 200 {
		fmt.Printf("[ORÁCULO ERRO] Falha ao acessar Binance para %s: %v\n", symbol, err)
		return createFallbackPanel(title, subtitle, desc)
	}
	defer resp.Body.Close()

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		fmt.Printf("[ORÁCULO ERRO] Falha no Parse do JSON Binance %s: %v\n", symbol, err)
		return createFallbackPanel(title, subtitle, desc)
	}

	high, _ := data["highPrice"].(string)
	low, _ := data["lowPrice"].(string)
	last, _ := data["lastPrice"].(string)
	pct, _ := data["priceChangePercent"].(string)

	// Format values to a max of 2 decimal places for neatness if they are floats
	formatFloatStr := func(val string) string {
		var f float64
		fmt.Sscanf(val, "%f", &f)
		return fmt.Sprintf("%.2f", f)
	}

	return &KnowledgePanel{
		Title:       title,
		Subtitle:    subtitle,
		Description: desc,
		Facts: []Fact{
			{Label: "Cotação Atual", Value: "R$ " + formatFloatStr(last)},
			{Label: "Variação (24h)", Value: formatFloatStr(pct) + "%"},
			{Label: "Máxima (24h)", Value: "R$ " + formatFloatStr(high)},
			{Label: "Mínima (24h)", Value: "R$ " + formatFloatStr(low)},
		},
	}
}

func createFallbackPanel(title, subtitle, desc string) *KnowledgePanel {
	return &KnowledgePanel{
		Title:       title,
		Subtitle:    subtitle + " (Modo Offline/Fallback)",
		Description: desc + "\n\n(A API de cotações em tempo real está indisponível no momento.)",
		Facts: []Fact{
			{Label: "Status", Value: "Offline"},
		},
	}
}
