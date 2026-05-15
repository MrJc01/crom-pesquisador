package main

import (
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
		{"https://www.uol.com.br", "uol.com.br"},
		{"http://sub.domain.com/path", "sub.domain.com"},
	}

	for _, tt := range tests {
		domain := extractDomain(tt.url)
		if domain != tt.expected {
			t.Errorf("extractDomain(%s): esperava %s, obteve %s", tt.url, tt.expected, domain)
		}
	}
}

func TestRemoveFragment(t *testing.T) {
	tests := []struct {
		url      string
		expected string
	}{
		{"https://example.com/page#section", "https://example.com/page"},
		{"https://example.com/page", "https://example.com/page"},
		{"https://example.com/#", "https://example.com/"},
	}

	for _, tt := range tests {
		result := removeFragment(tt.url)
		if result != tt.expected {
			t.Errorf("removeFragment(%s): esperava %s, obteve %s", tt.url, tt.expected, result)
		}
	}
}
