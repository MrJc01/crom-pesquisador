package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

func main() {
	targetURL := flag.String("url", "http://127.0.0.1:8098/api/search?q=bitcoin", "Target URL to stress test")
	concurrency := flag.Int("c", 50, "Number of concurrent workers (virtual users)")
	durationSecs := flag.Int("d", 10, "Duration of the test in seconds")
	flag.Parse()

	fmt.Printf("🔥 Iniciando Canhão de ORÁCULO contra: %s\n", *targetURL)
	fmt.Printf("👥 Usuários Virtuais: %d | ⏱️  Duração: %d segundos\n", *concurrency, *durationSecs)

	var successCount int64
	var fallbackCount int64
	var errorCount int64

	var wg sync.WaitGroup
	timeout := time.After(time.Duration(*durationSecs) * time.Second)
	done := make(chan bool)

	// Inicia o cronômetro para finalizar
	go func() {
		<-timeout
		close(done)
	}()

	client := &http.Client{
		Timeout: 10 * time.Second, // Oráculo bate na Binance, precisa de mais tempo
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
					resp, err := client.Get(*targetURL)
					
					if err != nil || resp.StatusCode != 200 {
						atomic.AddInt64(&errorCount, 1)
						if resp != nil {
							resp.Body.Close()
						}
						continue
					}

					// Validate if KnowledgePanel returned Offline
					var data map[string]interface{}
					if err := json.NewDecoder(resp.Body).Decode(&data); err == nil {
						if kp, ok := data["knowledgePanel"].(map[string]interface{}); ok {
							if facts, ok2 := kp["Facts"].([]interface{}); ok2 && len(facts) > 0 {
								// Check first fact for "Offline" word
								factMap := facts[0].(map[string]interface{})
								if factMap["Label"] == "Status" && factMap["Value"] == "Offline" {
									atomic.AddInt64(&fallbackCount, 1)
								} else {
									atomic.AddInt64(&successCount, 1)
								}
							}
						}
					}
					resp.Body.Close()
				}
			}
		}()
	}

	wg.Wait()
	elapsed := time.Since(startGlobal).Seconds()

	totalReqs := successCount + fallbackCount + errorCount

	fmt.Println("\n📊 === RESULTADOS DO ESTRESSE DO ORÁCULO ===")
	fmt.Printf("Total de Requisições : %d\n", totalReqs)
	fmt.Printf("Requisições/seg (RPS): %.2f\n", float64(totalReqs)/elapsed)
	fmt.Printf("Sucessos Oráculo Real: %d\n", successCount)
	fmt.Printf("Modo Fallback Ativado: %d\n", fallbackCount)
	fmt.Printf("Falhas / Timeouts    : %d\n", errorCount)
	
	if fallbackCount > 0 {
		fmt.Println("⚠️  ALERTA: A Binance bloqueou a VPS (Rate Limit) ou timeout ocorreu. O Fallback salvou a UX.")
	} else if errorCount > 0 {
		fmt.Println("⚠️  ALERTA: Ocorreram falhas graves de conexão.")
	} else {
		fmt.Println("✅ APROVADO: A Binance aguentou a carga massiva sem bloquear o IP da VPS!")
	}
}
