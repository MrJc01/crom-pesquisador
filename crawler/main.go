package main

import (
	"encoding/json"
	"encoding/xml"
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

// RSS Structs for native XML parsing
type RssFeed struct {
	XMLName xml.Name  `xml:"rss"`
	Channel RssChannel `xml:"channel"`
}

type RssChannel struct {
	Title       string    `xml:"title"`
	Description string    `xml:"description"`
	Items       []RssItem `xml:"item"`
}

type RssItem struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	PubDate     string `xml:"pubDate"`
}

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

	for {
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
		
		fmt.Println("💤 Crawler entrando em repouso por 15 minutos antes da próxima varredura...")
		time.Sleep(15 * time.Minute)
	}
}

// processSite acts as an individual Spider worker for a specific domain
func processSite(startURL string, config *TargetConfig) {
	baseDomain := extractDomain(startURL)
	baseURLObj, err := url.Parse(startURL)
	if err != nil {
		fmt.Printf("[ERRO] URL Inválida: %s\n", startURL)
		return
	}

	if !isSafeHost(baseURLObj.Hostname()) {
		fmt.Printf("[🛡️ SSRF BLOCK] Alvo interno rejeitado: %s\n", baseURLObj.Hostname())
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
	defer siteDB.Close()

	// 🚨 RSS FAST-TRACK: If category is News and it's an RSS feed, we parse XML and bypass BFS
	if config.Category == "News" || strings.HasSuffix(startURL, ".xml") || strings.Contains(startURL, "rss") || strings.Contains(startURL, "feed") {
		processRSS(startURL, baseDomain, config, siteDB)
		return
	}

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
		
		node, links := processPage(cleanURL, baseDomain, baseURLObj, config, siteDB)
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

// processRSS downloads the XML, parses it natively, and injects exactly the news into the DB
func processRSS(rssURL string, domain string, config *TargetConfig, siteDB *db.DB) {
	fmt.Printf("[📰 RSS] Baixando Feed de Notícias Rápido: %s\n", rssURL)
	
	req, _ := http.NewRequest("GET", rssURL, nil)
	req.Header.Set("User-Agent", UserAgent)
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	
	if err != nil || resp.StatusCode != 200 {
		fmt.Printf("[📰 RSS ERRO] Falha ao buscar %s\n", rssURL)
		if resp != nil {
			resp.Body.Close()
		}
		return
	}
	defer resp.Body.Close()

	var feed RssFeed
	if err := xml.NewDecoder(resp.Body).Decode(&feed); err != nil {
		fmt.Printf("[📰 RSS ERRO] Falha no Parse XML de %s: %v\n", rssURL, err)
		return
	}

	count := 0
	for _, item := range feed.Channel.Items {
		if count >= config.LimitPerSite {
			break
		}
		
		cleanURL := strings.TrimSpace(item.Link)
		if cleanURL == "" {
			continue
		}

		// Cleanup description (some RSS put full HTML in description)
		desc := item.Description
		if len(desc) > 300 {
			desc = desc[:300] + "..."
		}

		// Convert pubDate to a format SQLite can easily sort if needed, or just store it.
		// Standard RSS pubDate: "Mon, 02 Jan 2006 15:04:05 -0700"
		// We'll parse it and reformat to ISO8601 (RFC3339) if possible, else keep raw.
		pubTime, err := time.Parse(time.RFC1123Z, item.PubDate)
		pubStr := item.PubDate
		if err == nil {
			pubStr = pubTime.Format(time.RFC3339)
		} else {
			pubTime, err = time.Parse(time.RFC1123, item.PubDate)
			if err == nil {
				pubStr = pubTime.Format(time.RFC3339)
			}
		}

		node := &db.LinkDetail{
			URL:  cleanURL,
			Type: "news",
			Meta: db.LinkMeta{
				Title:         item.Title,
				Description:   desc,
				PublishedDate: pubStr,
				Keywords:      config.DefaultTags,
			},
			Technical: db.LinkTechnical{
				Domain:         domain,
				IPMasked:       "RSS-Feed",
				SSL:            strings.HasPrefix(cleanURL, "https"),
				HTTPStatus:     200,
				ResponseTimeMs: 10,
				ContentType:    "text/html",
			},
			Analytics: db.LinkAnalytics{
				SearchAppearances: 0,
				LastCrawled:       time.Now().Format(time.RFC3339),
				FirstSeen:         time.Now().Format(time.RFC3339),
				CromRank:          100, // Notícias ganham boost inicial nativo
				CategoryTags:      []string{config.Category},
			},
		}

		err = siteDB.SaveNode(node)
		if err != nil {
			fmt.Printf("  -> [ERRO Salvando News] %v\n", err)
		} else {
			count++
		}
	}
	fmt.Printf("✅ [📰 RSS] Processou %d notícias urgentes de %s\n", count, domain)
}

func processPage(urlStr string, domain string, baseURLObj *url.URL, config *TargetConfig, siteDB *db.DB) (*db.LinkDetail, []string) {
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
	
	// Process Links
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

	// Process Images (Type: image)
	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if !exists || src == "" {
			return
		}
		alt, _ := s.Attr("alt")
		if alt == "" {
			alt = node.Meta.Title // Fallback to page title
		}

		parsedSrc, err := url.Parse(src)
		if err != nil {
			return
		}
		absSrc := baseURLObj.ResolveReference(parsedSrc).String()

		imgNode := &db.LinkDetail{
			URL:  absSrc + "#img" + fmt.Sprintf("%d", i), // Unique URL
			Type: "image",
			Meta: db.LinkMeta{
				Title:       alt,
				Description: absSrc, // Store real source in description for index
				Keywords:    node.Meta.Keywords,
			},
			Technical: node.Technical,
			Analytics: db.LinkAnalytics{
				SearchAppearances: 0,
				LastCrawled:       time.Now().Format(time.RFC3339),
				FirstSeen:         time.Now().Format(time.RFC3339),
				CromRank:          20,
				CategoryTags:      []string{config.Category},
			},
		}
		
		// Save Image Node
		siteDB.SaveNode(imgNode)
	})

	// Process Videos (Type: video)
	doc.Find("video, iframe").Each(func(i int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if !exists {
			return
		}
		
		// Very basic check for video sources
		if s.Is("iframe") && !strings.Contains(src, "youtube") && !strings.Contains(src, "vimeo") {
			return 
		}

		parsedSrc, err := url.Parse(src)
		if err != nil {
			return
		}
		absSrc := baseURLObj.ResolveReference(parsedSrc).String()

		vidNode := &db.LinkDetail{
			URL:  absSrc + "#vid" + fmt.Sprintf("%d", i),
			Type: "video",
			Meta: db.LinkMeta{
				Title:       node.Meta.Title + " Video",
				Description: absSrc,
				Keywords:    node.Meta.Keywords,
			},
			Technical: node.Technical,
			Analytics: db.LinkAnalytics{
				SearchAppearances: 0,
				LastCrawled:       time.Now().Format(time.RFC3339),
				FirstSeen:         time.Now().Format(time.RFC3339),
				CromRank:          30,
				CategoryTags:      []string{config.Category},
			},
		}
		// Save Video Node
		siteDB.SaveNode(vidNode)
	})

	// Process Code (Type: code)
	doc.Find("pre code").Each(func(i int, s *goquery.Selection) {
		codeContent := s.Text()
		if len(codeContent) < 50 {
			return // Ignore small inline code snippets
		}
		
		// Try to extract language from class
		class, _ := s.Attr("class")
		lang := "text"
		if strings.Contains(class, "language-") {
			parts := strings.Split(class, "language-")
			if len(parts) > 1 {
				lang = strings.Fields(parts[1])[0]
			}
		}

		codeNode := &db.LinkDetail{
			URL:  urlStr + "#code" + fmt.Sprintf("%d", i),
			Type: "code",
			Meta: db.LinkMeta{
				Title:       fmt.Sprintf("Code Snippet (%s) in %s", lang, node.Meta.Title),
				Description: codeContent[:min(len(codeContent), 300)], // Snippet preview
				Keywords:    node.Meta.Keywords,
			},
			Technical: node.Technical,
			Analytics: db.LinkAnalytics{
				SearchAppearances: 0,
				LastCrawled:       time.Now().Format(time.RFC3339),
				FirstSeen:         time.Now().Format(time.RFC3339),
				CromRank:          40,
				CategoryTags:      []string{config.Category},
			},
		}
		// Save Code Node
		siteDB.SaveNode(codeNode)
	})

	return node, links
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
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

func isSafeHost(host string) bool {
	h := strings.ToLower(host)
	if h == "localhost" || h == "127.0.0.1" || h == "[::1]" || strings.HasPrefix(h, "10.") || strings.HasPrefix(h, "192.168.") || strings.HasPrefix(h, "169.254.") {
		return false
	}
	return true
}
