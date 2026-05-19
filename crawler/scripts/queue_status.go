package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	dbPath := "../../data/index/global_index.db"
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Erro ao conectar no banco: %v", err)
	}
	defer db.Close()

	fmt.Println("📊 === STATUS DA FILA DO CRAWLER ===")

	// Contagem por Status
	rows, err := db.Query("SELECT status, COUNT(*) FROM crawler_queue GROUP BY status")
	if err != nil {
		log.Fatalf("Erro na consulta: %v", err)
	}
	defer rows.Close()

	total := 0
	for rows.Next() {
		var status string
		var count int
		rows.Scan(&status, &count)
		
		var icone string
		switch status {
		case "pending":
			icone = "⏳ Pendentes (Na Fila):"
		case "processing":
			icone = "⚙️  Processando Agora:"
		case "completed":
			icone = "✅ Concluídos (Crawler já passou):"
		default:
			icone = "❓ Outros:"
		}
		
		fmt.Printf("%s %d URLs\n", icone, count)
		total += count
	}

	fmt.Printf("\n📈 Total de URLs registradas na fila: %d\n", total)
}
