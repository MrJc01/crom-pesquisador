package db

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/google/uuid"
)

// LinkDetail matches the frontend types
type LinkDetail struct {
	ID        string        `json:"id"`
	URL       string        `json:"url"`
	Type      string        `json:"type"`
	Meta      LinkMeta      `json:"meta"`
	Technical LinkTechnical `json:"technical"`
	Analytics LinkAnalytics `json:"analytics"`
	Comments  []LinkComment `json:"comments"`
}

type LinkMeta struct {
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	OGImage       string   `json:"ogImage,omitempty"`
	OGType        string   `json:"ogType,omitempty"`
	Canonical     string   `json:"canonical,omitempty"`
	Favicon       string   `json:"favicon,omitempty"`
	Author        string   `json:"author,omitempty"`
	PublishedDate string   `json:"publishedDate,omitempty"`
	ModifiedDate  string   `json:"modifiedDate,omitempty"`
	Language      string   `json:"language,omitempty"`
	Keywords      []string `json:"keywords"`
}

type LinkTechnical struct {
	Domain         string `json:"domain"`
	IPMasked       string `json:"ipMasked"`
	SSL            bool   `json:"ssl"`
	SSLIssuer      string `json:"sslIssuer,omitempty"`
	HTTPStatus     int    `json:"httpStatus"`
	ResponseTimeMs int    `json:"responseTimeMs"`
	Server         string `json:"server,omitempty"`
	ContentType    string `json:"contentType"`
	ContentLength  int    `json:"contentLength,omitempty"`
}

type LinkAnalytics struct {
	SearchAppearances int      `json:"searchAppearances"`
	LastCrawled       string   `json:"lastCrawled"`
	FirstSeen         string   `json:"firstSeen"`
	CromRank          int      `json:"cromRank"`
	CategoryTags      []string `json:"categoryTags"`
}

type LinkComment struct {
	ID        string `json:"id"`
	IPHash    string `json:"ipHash"`
	IPMasked  string `json:"ipMasked"`
	Content   string `json:"content"`
	Timestamp int64  `json:"timestamp"`
	Upvotes   int    `json:"upvotes"`
	Downvotes int    `json:"downvotes"`
	UserVote  string `json:"userVote,omitempty"`
}

// GenerateIPMask takes an IP like 192.168.1.100 and returns 192.168.***.***
func GenerateIPMask(ip string) string {
	parts := strings.Split(ip, ".")
	if len(parts) == 4 {
		return fmt.Sprintf("%s.%s.***.***", parts[0], parts[1])
	}
	// For IPv6 or other formats
	if len(ip) > 8 {
		return ip[:4] + "****"
	}
	return "***.***"
}

// GenerateIPHash generates a SHA256 hash of the IP to ensure uniqueness without storing it
func GenerateIPHash(ip string) string {
	hash := sha256.Sum256([]byte(ip + "crom-salt-2026"))
	return hex.EncodeToString(hash[:])[:12] // Return first 12 chars
}

// EnsureID generates a UUID if id is empty
func EnsureID(id string) string {
	if id == "" {
		return uuid.New().String()
	}
	return id
}
