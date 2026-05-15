package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/crom-pesquisador/backend/db"
	"github.com/temoto/robotstxt"
)

type TargetConfig struct {
	Name         string   `json:"name"`
	URLs         []string `json:"urls"`
	LimitPerSite int      `json:"limit_per_site"`
	DelayMs      int      `json:"delay_ms"`
	DefaultTags  []string `json:"default_tags"`
	Language     string   `json:"language"`
	Category     string   `json:"category"`
}

var UserAgent = "CROM-Bot/1.0 (+https://crom.me)"

func main() {
	configPath := flag.String("config", "", "Path to the target JSON configuration file")
	flag.Parse()

	if *configPath == "" {
		log.Fatal("Please provide a --config to JSON target (e.g. --config targets/crom.json)")
	}

	// 1. Load JSON Config
	fileBytes, err := os.ReadFile(*configPath)
	if err != nil {
		log.Fatalf("Failed to read config file: %v", err)
	}

	var target TargetConfig
	if err := json.Unmarshal(fileBytes, &target); err != nil {
		log.Fatalf("Failed to parse config file: %v", err)
	}

	fmt.Printf("🚀 Lançando Batch de Crawlers para o Nicho: %s (%d alvos base)\n", target.Name, len(target.URLs))

	var wg sync.WaitGroup

	// Dispatch a worker for each URL seed in the JSON array
	for _, seedURL := range target.URLs {
		wg.Add(1)
		go func(urlStr string) {
			defer wg.Done()
			processSite(urlStr, &target)
		}(seedURL)
	}

	// Wait for all workers in the pool to complete
	wg.Wait()
	fmt.Printf("✅ Todos os %d sites do nicho '%s' foram varridos!\n", len(target.URLs), target.Name)
}

// processSite acts as an individual Spider worker for a specific domain
func processSite(startURL string, config *TargetConfig) {
	baseDomain := extractDomain(startURL)
	baseURLObj, err := url.Parse(startURL)
	if err != nil {
		fmt.Printf("[ERRO] URL Inválida: %s\n", startURL)
		return
	}

	// Fetch robots.txt
	robotsURL := fmt.Sprintf("%s://%s/robots.txt", baseURLObj.Scheme, baseURLObj.Host)
	var robotsData *robotstxt.Group
	
	req, _ := http.NewRequest("GET", robotsURL, nil)
	req.Header.Set("User-Agent", UserAgent)
	client := &http.Client{Timeout: 10 * time.Second}
	respRobots, err := client.Do(req)
	
	if err == nil && respRobots.StatusCode == 200 {
		robots, err := robotstxt.FromResponse(respRobots)
		if err == nil {
			robotsData = robots.FindGroup(UserAgent)
		}
	}

	// Open DB connection for this specific domain shard
	siteDB, err := db.OpenSiteDB(baseDomain)
	if err != nil {
		fmt.Printf("[ERRO DB] Falha ao abrir db para %s: %v\n", baseDomain, err)
		return
	}
	// We handle close carefully for concurrent writes. The CRUD methods in db use their own DB handle locks natively via SQLite driver.
	defer siteDB.Close()

	// BFS Queue Setup
	queue := []string{startURL}
	visited := make(map[string]bool)
	count := 0

	for len(queue) > 0 && count < config.LimitPerSite {
		currentURL := queue[0]
		queue = queue[1:]

		cleanURL := removeFragment(currentURL)

		if visited[cleanURL] {
			continue
		}
		
		parsedCurrent, err := url.Parse(cleanURL)
		if err != nil {
			continue
		}

		// Check robots.txt compliance
		if robotsData != nil && !robotsData.Test(parsedCurrent.Path) {
			visited[cleanURL] = true
			continue
		}

		visited[cleanURL] = true
		fmt.Printf("[🤖 %s] Crawling %d/%d: %s\n", baseDomain, count+1, config.LimitPerSite, cleanURL)
		
		node, links := processPage(cleanURL, baseDomain, baseURLObj, config)
		if node != nil {
			err = siteDB.SaveNode(node)
			if err != nil {
				fmt.Printf("  -> [ERRO] %v\n", err)
			}
			count++
		}

		// Enqueue new internal links
		for _, link := range links {
			if !visited[link] {
				queue = append(queue, link)
			}
		}

		// Respect the delay
		time.Sleep(time.Duration(config.DelayMs) * time.Millisecond)
	}
}

func processPage(urlStr string, domain string, baseURLObj *url.URL, config *TargetConfig) (*db.LinkDetail, []string) {
	start := time.Now()
	
	req, _ := http.NewRequest("GET", urlStr, nil)
	req.Header.Set("User-Agent", UserAgent)
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	
	if err != nil {
		return nil, nil
	}
	defer resp.Body.Close()

	duration := time.Since(start).Milliseconds()

	if resp.StatusCode != 200 {
		return nil, nil
	}

	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(contentType, "text/html") {
		return nil, nil // Ignora PDFs, imagens, etc
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, nil
	}

	node := &db.LinkDetail{
		URL:  urlStr,
		Type: "page",
		Meta: db.LinkMeta{
			Keywords: config.DefaultTags,
		},
		Technical: db.LinkTechnical{
			Domain:         domain,
			IPMasked:       "10.0.***.***", 
			SSL:            strings.HasPrefix(urlStr, "https"),
			HTTPStatus:     resp.StatusCode,
			ResponseTimeMs: int(duration),
			ContentType:    contentType,
			Server:         resp.Header.Get("Server"),
		},
		Analytics: db.LinkAnalytics{
			SearchAppearances: 0,
			LastCrawled:       time.Now().Format(time.RFC3339),
			FirstSeen:         time.Now().Format(time.RFC3339),
			CromRank:          50,
			CategoryTags:      []string{config.Category},
		},
	}

	node.Meta.Title = doc.Find("title").Text()

	doc.Find("meta").Each(func(i int, s *goquery.Selection) {
		name, _ := s.Attr("name")
		property, _ := s.Attr("property")
		content, _ := s.Attr("content")

		if name == "description" {
			node.Meta.Description = content
		} else if name == "keywords" {
			pageKeywords := strings.Split(content, ",")
			node.Meta.Keywords = append(node.Meta.Keywords, pageKeywords...)
		} else if property == "og:image" {
			node.Meta.OGImage = content
		} else if property == "og:type" {
			node.Meta.OGType = content
		} else if name == "author" {
			node.Meta.Author = content
		}
	})

	var links []string
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		
		parsedHref, err := url.Parse(href)
		if err != nil {
			return
		}
		
		absoluteURL := baseURLObj.ResolveReference(parsedHref)
		absStr := removeFragment(absoluteURL.String())
		
		if absoluteURL.Scheme == "http" || absoluteURL.Scheme == "https" {
			if extractDomain(absStr) == domain {
				links = append(links, absStr)
			}
		}
	})

	return node, links
}

func extractDomain(rawURL string) string {
	rawURL = strings.TrimPrefix(rawURL, "http://")
	rawURL = strings.TrimPrefix(rawURL, "https://")
	parts := strings.Split(rawURL, "/")
	domain := parts[0]
	return strings.TrimPrefix(domain, "www.")
}

func removeFragment(rawURL string) string {
	if idx := strings.Index(rawURL, "#"); idx != -1 {
		return rawURL[:idx]
	}
	return rawURL
}
