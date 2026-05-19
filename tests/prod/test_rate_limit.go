package main

import (
	"bytes"
	"flag"
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

func main() {
	targetURL := flag.String("url", "http://127.0.0.1:8098/api/link/test_domain|test_id/comment", "Target URL to test rate limiter")
	requests := flag.Int("n", 20, "Number of sequential requests to send (to trigger rate limit)")
	flag.Parse()

	fmt.Printf("🛡️  Iniciando Teste de Defesa Cibernética (LGPD / Rate Limit) contra: %s\n", *targetURL)
	fmt.Printf("📦 Enviando %d requisições seguidas a partir do mesmo IP...\n", *requests)

	var successCount int64 // Expect to be around 5
	var blockedCount int64 // Expect to be around 15
	var errorCount int64

	var wg sync.WaitGroup
	client := &http.Client{Timeout: 5 * time.Second}

	for i := 0; i < *requests; i++ {
		wg.Add(1)
		// Small delay to simulate rapid script firing
		time.Sleep(50 * time.Millisecond)
		
		go func(idx int) {
			defer wg.Done()
			
			payload := []byte(`{"content":"Teste de spam!"}`)
			req, _ := http.NewRequest("POST", *targetURL, bytes.NewBuffer(payload))
			req.Header.Set("Content-Type", "application/json")
			
			resp, err := client.Do(req)
			if err != nil {
				atomic.AddInt64(&errorCount, 1)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode == 200 || resp.StatusCode == 201 {
				atomic.AddInt64(&successCount, 1)
			} else if resp.StatusCode == 429 { // Too Many Requests
				atomic.AddInt64(&blockedCount, 1)
			} else {
				// Outro erro (ex: 404, 500)
				atomic.AddInt64(&errorCount, 1)
			}
		}(i)
	}

	wg.Wait()

	fmt.Println("\n📊 === RESULTADOS DA BLINDAGEM LGPD ===")
	fmt.Printf("Total de Requisições Enviadas: %d\n", *requests)
	fmt.Printf("Comentários Aceitos (200 OK): %d\n", successCount)
	fmt.Printf("Comentários Bloqueados (429): %d\n", blockedCount)
	fmt.Printf("Outros Erros (ex: 500/404)  : %d\n", errorCount)
	
	if blockedCount > 0 {
		fmt.Println("✅ APROVADO: O Rate Limiter está funcionando perfeitamente! Os ataques de SPAM foram barrados (429 Too Many Requests).")
	} else if errorCount > 0 {
		fmt.Println("⚠️  ALERTA: A rota não existe ou quebrou antes de rate limit.")
	} else {
		fmt.Println("⚠️  FALHA CRÍTICA: O Rate Limiter não funcionou! Todos os spams passaram.")
	}
}
