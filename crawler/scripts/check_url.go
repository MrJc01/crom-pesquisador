package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "modernc.org/sqlite"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Uso: go run check_url.go <termo_ou_url>")
		return
	}
	termo := os.Args[1]
	dbPath := "../../data/index/global_index.db"
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Erro: %v", err)
	}
	defer db.Close()

	fmt.Printf("🔍 Buscando '%s' no Banco de Dados...\n\n", termo)

	// Verifica no Índice Principal
	var countIndex int
	db.QueryRow("SELECT COUNT(*) FROM search_index WHERE url LIKE ?", "%"+termo+"%").Scan(&countIndex)
	fmt.Printf("📦 Encontrado no Índice de Busca: %d vezes\n", countIndex)

	// Verifica na Fila do Crawler
	rows, err := db.Query("SELECT url, status FROM crawler_queue WHERE url LIKE ? LIMIT 5", "%"+termo+"%")
	if err == nil {
		fmt.Println("\n🕷️ Status na Fila do Crawler (Top 5):")
		foundQueue := false
		for rows.Next() {
			var url, status string
			rows.Scan(&url, &status)
			fmt.Printf(" - %s (Status: %s)\n", url, status)
			foundQueue = true
		}
		if !foundQueue {
			fmt.Println(" - (Nenhum registro encontrado na fila)")
		}
	}
}
