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
		log.Fatalf("Erro ao abrir banco: %v", err)
	}
	defer db.Close()

	fmt.Println("💀 Iniciando o Ceifador (Data Reaper) de Hibernação...")

	// 1. Hibernar Notícias Antigas (mais de 2 anos)
	// Para páginas normais e imagens, idealmente usaríamos um tracking de cliques no futuro.
	res, err := db.Exec(`
		UPDATE search_index 
		SET status = 'archived' 
		WHERE published_date != '' 
		  AND date(published_date) < date('now', '-2 years')
		  AND status = 'active'
	`)
	
	if err != nil {
		log.Fatalf("Erro ao hibernar dados: %v", err)
	}

	rowsAffected, _ := res.RowsAffected()
	fmt.Printf("❄️  %d registros antigos foram colocados em Cold Storage (hibernados).\n", rowsAffected)
	fmt.Println("Estes registros não aparecerão mais nas buscas normais, apenas no modo &deep=true.")
}
