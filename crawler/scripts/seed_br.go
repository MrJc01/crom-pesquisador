package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "modernc.org/sqlite"
)

func main() {
	dbPath := "../../data/index/global_index.db"
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Erro ao abrir banco: %v", err)
	}
	defer db.Close()

	topSites := []string{
		"https://www.google.com.br",
		"https://www.youtube.com",
		"https://pt.wikipedia.org",
		"https://www.globo.com",
		"https://www.mercadolivre.com.br",
		"https://www.amazon.com.br",
		"https://www.shopee.com.br",
		"https://www.gov.br",
		"https://www.facebook.com",
		"https://www.instagram.com",
		"https://www.uol.com.br",
		"https://www.estadao.com.br",
		"https://www.folha.uol.com.br",
		"https://www.magazineluiza.com.br",
		"https://www.americanas.com.br",
		"https://www.olx.com.br",
		"https://www.itau.com.br",
		"https://www.nubank.com.br",
		"https://www.bing.com",
		"https://www.apple.com/br/",
		"https://www.microsoft.com/pt-br",
		"https://www.netflix.com/br/",
		"https://www.g1.globo.com",
		"https://www.bb.com.br",
		"https://www.caixa.gov.br",
		"https://www.sympla.com.br",
		"https://www.jusbrasil.com.br",
		"https://www.vagalume.com.br",
		"https://www.pensador.com",
		"https://www.tecmundo.com.br",
	}

	fmt.Println("🚀 Injetando Top 30 Sites do Brasil na Mente Mestra (crawler_queue)...")

	count := 0
	for _, site := range topSites {
		_, err := db.Exec("INSERT OR IGNORE INTO crawler_queue (url, status, discovered_at) VALUES (?, 'pending', ?)", site, time.Now().Format(time.RFC3339))
		if err != nil {
			fmt.Printf("Erro ao inserir %s: %v\n", site, err)
		} else {
			count++
		}
	}

	fmt.Printf("✅ %d Sementes Injetadas com Sucesso!\n", count)
	fmt.Println("O Crawler Autônomo começará a devorar esses sites em breve.")
}
