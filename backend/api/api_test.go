package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestExtractDomain(t *testing.T) {
	tests := []struct {
		url      string
		expected string
	}{
		{"https://g1.globo.com/politica", "g1.globo.com"},
		{"http://www.terra.com.br/noticias", "terra.com.br"},
		{"https://tabnews.com.br", "tabnews.com.br"},
		{"invalid-url", "invalid-url"},
	}

	for _, tt := range tests {
		domain := ExtractDomain(tt.url)
		if domain != tt.expected {
			t.Errorf("ExtractDomain(%s): esperava %s, obteve %s", tt.url, tt.expected, domain)
		}
	}
}

func TestHandleSuggestURLValidation(t *testing.T) {
	reqBody := `{"url": "not-a-valid-url"}`
	req, err := http.NewRequest("POST", "/suggest-url", strings.NewReader(reqBody))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleSuggestURL)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusBadRequest)
	}
}

func TestHandleReportLinkValidation(t *testing.T) {
	// Missing reason
	reqBody := `{"meta_id": "123", "url": "https://example.com"}`
	req, err := http.NewRequest("POST", "/report", strings.NewReader(reqBody))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleReportLink)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code for invalid payload: got %v want %v", status, http.StatusBadRequest)
	}
}
