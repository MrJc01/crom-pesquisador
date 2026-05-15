package api

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/crom-pesquisador/backend/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
)

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
	})

	return r
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
			"news": []interface{}{}, "code": []interface{}{}, "related": []interface{}{},
			"hasMore": false, "page": 1,
		})
		return
	}

	globalDB, err := db.OpenGlobalIndex()
	if err != nil {
		http.Error(w, "Search index unavailable", http.StatusServiceUnavailable)
		return
	}
	defer globalDB.Close()

	// Query FTS table
	// We append * for prefix matching
	ftsQuery := query + "*"
	
	rows, err := globalDB.Query(`
		SELECT search_index.id, search_index.domain, search_index.url, search_index.title, search_index.description, search_index.published_date 
		FROM search_index 
		JOIN search_fts ON search_index.rowid = search_fts.rowid
		WHERE search_fts MATCH ? 
		  AND search_index.domain NOT IN (SELECT domain FROM banned_domains)
		ORDER BY search_fts.rank ASC
		LIMIT 50
	`, ftsQuery)
	
	if err != nil {
		http.Error(w, "Search failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Ensure it is an empty array, not null, to prevent React crashes
	results := make([]map[string]interface{}, 0)
	newsResults := make([]map[string]interface{}, 0)

	for rows.Next() {
		var id, domain, url, title, description string
		var pubDate sql.NullString
		if err := rows.Scan(&id, &domain, &url, &title, &description, &pubDate); err != nil {
			continue
		}
		
		apiID := domain + "|" + id
		
		item := map[string]interface{}{
			"id": apiID,
			"url": url,
			"title": title,
			"snippet": description,
			"site": domain,
			"breadcrumb": domain + " › " + title,
		}

		if pubDate.Valid && pubDate.String != "" {
			item["time"] = pubDate.String // Send date to frontend
			newsResults = append(newsResults, item)
		} else {
			results = append(results, item)
		}
	}

	response := map[string]interface{}{
		"query":   query,
		"total":   len(results),
		"time":    0.02, // simulated fast response time
		"results": results,
		"images":  []interface{}{}, 
		"videos":  []interface{}{},
		"news":    newsResults, // Notícias extraídas do RSS com Time Decay
		"code":    []interface{}{},
		"related": []interface{}{},
		"hasMore": false,
		"page":    1,
	}
	jsonResponse(w, http.StatusOK, response)
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

// ExtractDomain helper
func ExtractDomain(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return "unknown"
	}
	return strings.TrimPrefix(u.Hostname(), "www.")
}
