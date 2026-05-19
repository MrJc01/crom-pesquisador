package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

type ProxyPool struct {
	proxies []*url.URL
	mutex   sync.RWMutex
}

var globalProxyPool = &ProxyPool{
	proxies: make([]*url.URL, 0),
}

// InitProxyPool starts the background routine to fetch and test proxies
func InitProxyPool() {
	go func() {
		for {
			fmt.Println("[🛡️ PROXY] Buscando nova lista de Proxies BR (ProxyScrape)...")
			fetchAndTestProxies()
			// Refresca a cada 2 horas
			time.Sleep(2 * time.Hour)
		}
	}()
}

func fetchAndTestProxies() {
	apiURL := "https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=BR&ssl=all&anonymity=all"
	
	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("GET", apiURL, nil)
	// Masking User-Agent
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
	
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		fmt.Printf("[🛡️ PROXY ERRO] Falha ao baixar lista de proxies: %v\n", err)
		return
	}
	defer resp.Body.Close()

	var rawProxies []string
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line != "" {
			rawProxies = append(rawProxies, line)
		}
	}

	fmt.Printf("[🛡️ PROXY] %d IPs brutos encontrados. Testando latência...\n", len(rawProxies))

	var workingProxies []*url.URL
	var wg sync.WaitGroup
	var mu sync.Mutex

	// Limita o teste simultâneo para não esgotar sockets locais
	sem := make(chan struct{}, 50)

	for _, p := range rawProxies {
		wg.Add(1)
		go func(proxyStr string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			proxyURL, err := url.Parse("http://" + proxyStr)
			if err != nil {
				return
			}

			// Testando o proxy contra o site do uol para simular brasil ou example
			testClient := &http.Client{
				Transport: &http.Transport{
					Proxy: http.ProxyURL(proxyURL),
				},
				Timeout: 4 * time.Second, // Timeout rigoroso
			}

			start := time.Now()
			testResp, err := testClient.Get("http://example.com")
			if err == nil && testResp.StatusCode == 200 {
				testResp.Body.Close()
				mu.Lock()
				workingProxies = append(workingProxies, proxyURL)
				mu.Unlock()
				fmt.Printf("  ✅ Proxy OK: %s (%v)\n", proxyStr, time.Since(start))
			} else if testResp != nil {
				testResp.Body.Close()
			}
		}(p)
	}

	wg.Wait()

	// Atualiza o pool global de forma segura
	globalProxyPool.mutex.Lock()
	globalProxyPool.proxies = workingProxies
	globalProxyPool.mutex.Unlock()

	fmt.Printf("[🛡️ PROXY] Atualização completa! %d Proxies Brasileiros Saudáveis em rotação.\n", len(workingProxies))
}

// GetHttpClient returns a new HTTP client configured with a random working proxy
// If the pool is empty, it returns a direct (non-proxied) client.
func GetHttpClient(timeout time.Duration) *http.Client {
	globalProxyPool.mutex.RLock()
	defer globalProxyPool.mutex.RUnlock()

	transport := &http.Transport{}

	if len(globalProxyPool.proxies) > 0 {
		// Pick a random proxy
		selected := globalProxyPool.proxies[rand.Intn(len(globalProxyPool.proxies))]
		transport.Proxy = http.ProxyURL(selected)
	}

	return &http.Client{
		Transport: transport,
		Timeout:   timeout,
	}
}

// GetRandomProxyLog helps debugging
func GetRandomProxyLog() string {
	globalProxyPool.mutex.RLock()
	defer globalProxyPool.mutex.RUnlock()
	if len(globalProxyPool.proxies) == 0 {
		return "DIRECT"
	}
	return globalProxyPool.proxies[rand.Intn(len(globalProxyPool.proxies))].Host
}
