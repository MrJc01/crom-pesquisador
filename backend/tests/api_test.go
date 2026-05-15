package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/crom-pesquisador/backend/api"
	"github.com/crom-pesquisador/backend/db"
)

func TestMain(m *testing.M) {
	// Setup test environment
	db.DataDir = "./testdata_sites"
	os.MkdirAll(db.DataDir, 0755)

	// Run tests
	code := m.Run()

	// Teardown
	os.RemoveAll(db.DataDir)
	os.Exit(code)
}

func TestCrawlerAndAPI(t *testing.T) {
	domain := "testsite.com"
	
	// 1. Manually insert a mock node directly via DB package (Simulating crawler)
	siteDB, err := db.OpenSiteDB(domain)
	if err != nil {
		t.Fatalf("Failed to open test DB: %v", err)
	}
	defer siteDB.Close()

	node := &db.LinkDetail{
		URL:  "https://testsite.com/about",
		Type: "page",
		Meta: db.LinkMeta{
			Title:       "About Test Site",
			Description: "This is a test description",
			Keywords:    []string{"test", "about"},
		},
		Technical: db.LinkTechnical{
			Domain:         domain,
			IPMasked:       "192.168.***.***",
			HTTPStatus:     200,
			ResponseTimeMs: 45,
		},
		Analytics: db.LinkAnalytics{
			CromRank:    100,
			LastCrawled: time.Now().Format(time.RFC3339),
		},
	}

	err = siteDB.SaveNode(node)
	if err != nil {
		t.Fatalf("Failed to save node: %v", err)
	}
	
	// Ensure ID was created
	if node.ID == "" {
		t.Fatalf("Expected Node ID to be set after save")
	}

	// 2. Test the API Endpoints
	router := api.SetupRouter()
	
	// The API expects ID to be "domain|id" for our routing logic
	apiID := domain + "|" + node.ID

	// Test GET /api/link/:id
	req, _ := http.NewRequest("GET", "/api/link/"+apiID, nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var responseNode db.LinkDetail
	if err := json.NewDecoder(rr.Body).Decode(&responseNode); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if responseNode.Meta.Title != "About Test Site" {
		t.Errorf("Expected title 'About Test Site', got '%s'", responseNode.Meta.Title)
	}

	// Test POST /api/link/:id/comment
	payload := []byte(`{"content":"Great test site!"}`)
	req2, _ := http.NewRequest("POST", "/api/link/"+apiID+"/comment", bytes.NewBuffer(payload))
	req2.Header.Set("Content-Type", "application/json")
	req2.RemoteAddr = "123.45.67.89:12345" // Mock IP
	
	rr2 := httptest.NewRecorder()
	router.ServeHTTP(rr2, req2)

	if status := rr2.Code; status != http.StatusCreated {
		t.Errorf("Comment handler returned wrong status code: got %v want %v", status, http.StatusCreated)
	}

	var comment db.LinkComment
	if err := json.NewDecoder(rr2.Body).Decode(&comment); err != nil {
		t.Fatalf("Failed to decode comment response: %v", err)
	}

	if comment.Content != "Great test site!" {
		t.Errorf("Expected comment content 'Great test site!', got '%s'", comment.Content)
	}

	if comment.IPMasked != "123.45.***.***" {
		t.Errorf("Expected IP to be masked as '123.45.***.***', got '%s'", comment.IPMasked)
	}
}

func TestDomainExtractor(t *testing.T) {
	cases := []struct {
		url      string
		expected string
	}{
		{"https://blog.crom.me/post", "blog.crom.me"},
		{"http://www.wikipedia.org", "wikipedia.org"},
		{"https://dev.to/article", "dev.to"},
	}

	for _, c := range cases {
		domain := api.ExtractDomain(c.url)
		if domain != c.expected {
			t.Errorf("ExtractDomain(%s) == %s, expected %s", c.url, domain, c.expected)
		}
	}
}
