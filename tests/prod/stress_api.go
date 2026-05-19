package main

import (
	"flag"
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

func main() {
	targetURL := flag.String("url", "http://127.0.0.1:8098/api/search?q=dolar", "Target URL to stress test")
	concurrency := flag.Int("c", 100, "Number of concurrent workers (virtual users)")
	durationSecs := flag.Int("d", 10, "Duration of the test in seconds")
	flag.Parse()

	fmt.Printf("🔥 Iniciando Canhão FTS5 contra: %s\n", *targetURL)
	fmt.Printf("👥 Usuários Virtuais: %d | ⏱️  Duração: %d segundos\n", *concurrency, *durationSecs)

	var successCount int64
	var errorCount int64
	var totalLatencyMs int64

	var wg sync.WaitGroup
	timeout := time.After(time.Duration(*durationSecs) * time.Second)
	done := make(chan bool)

	// Inicia o cronômetro para finalizar
	go func() {
		<-timeout
		close(done)
	}()

	client := &http.Client{
		Timeout: 5 * time.Second, // Timeout agressivo para testar falhas rápidas
	}

	startGlobal := time.Now()

	for i := 0; i < *concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case <-done:
					return
				default:
					startReq := time.Now()
					resp, err := client.Get(*targetURL)
					latency := time.Since(startReq).Milliseconds()

					if err != nil || resp.StatusCode != 200 {
						atomic.AddInt64(&errorCount, 1)
					} else {
						atomic.AddInt64(&successCount, 1)
						atomic.AddInt64(&totalLatencyMs, latency)
					}
					
					if resp != nil {
						resp.Body.Close()
					}
				}
			}
		}()
	}

	wg.Wait()
	elapsed := time.Since(startGlobal).Seconds()

	totalReqs := successCount + errorCount
	var avgLatency int64
	if successCount > 0 {
		avgLatency = totalLatencyMs / successCount
	}

	fmt.Println("\n📊 === RESULTADOS DO ESTRESSE FTS5 ===")
	fmt.Printf("Total de Requisições : %d\n", totalReqs)
	fmt.Printf("Requisições/seg (RPS): %.2f\n", float64(totalReqs)/elapsed)
	fmt.Printf("Sucessos (200 OK)    : %d\n", successCount)
	fmt.Printf("Falhas / Timeouts    : %d\n", errorCount)
	fmt.Printf("Latência Média       : %d ms\n", avgLatency)
	
	if errorCount > 0 {
		fmt.Println("⚠️  ALERTA: Ocorreram erros! O banco de dados ou NGINX pode ter engasgado.")
	} else {
		fmt.Println("✅ APROVADO: O sistema segurou a carga sem dropar conexões!")
	}
}
