package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

func main() {
	dbPath := "../data/index/global_index.db"
	if len(os.Args) > 1 {
		dbPath = os.Args[1]
	}

	fmt.Printf("Gerando relatório a partir de %s...\n", dbPath)

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Falha ao abrir banco de dados: %v", err)
	}
	defer db.Close()

	reportFile := "crom_database_report.md"
	f, err := os.Create(reportFile)
	if err != nil {
		log.Fatalf("Falha ao criar arquivo de relatório: %v", err)
	}
	defer f.Close()

	writeHeader(f)
	writeOverview(db, f)
	writeDomainStats(db, f)
	writeRecentEntries(db, f)

	fmt.Printf("✅ Relatório gerado com sucesso: %s\n", filepath.Join(filepath.Dir(os.Args[0]), reportFile))
}

func writeHeader(f *os.File) {
	fmt.Fprintf(f, "# 📊 Relatório de Banco de Dados - CROM Pesquisador\n\n")
	fmt.Fprintf(f, "**Data de Geração:** %s\n\n", time.Now().Format(time.RFC1123))
	fmt.Fprintf(f, "---\n\n")
}

func writeOverview(db *sql.DB, f *os.File) {
	fmt.Fprintf(f, "## 📈 Visão Geral do Índice Global\n\n")

	var totalUrls int
	err := db.QueryRow("SELECT COUNT(*) FROM search_index").Scan(&totalUrls)
	if err != nil {
		fmt.Fprintf(f, "> *Aviso: Não foi possível ler a tabela search_index.*\n\n")
		return
	}

	var totalDomains int
	db.QueryRow("SELECT COUNT(DISTINCT domain) FROM search_index").Scan(&totalDomains)

	fmt.Fprintf(f, "- **Total de Links Indexados:** %d\n", totalUrls)
	fmt.Fprintf(f, "- **Total de Domínios Únicos:** %d\n\n", totalDomains)

	// Tipos de conteúdo
	fmt.Fprintf(f, "### Distribuição por Tipo de Conteúdo\n\n")
	fmt.Fprintf(f, "| Tipo | Quantidade |\n")
	fmt.Fprintf(f, "|---|---|\n")

	rows, err := db.Query("SELECT type, COUNT(*) FROM search_index GROUP BY type ORDER BY COUNT(*) DESC")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var tType string
			var count int
			if err := rows.Scan(&tType, &count); err == nil {
				fmt.Fprintf(f, "| `%s` | %d |\n", tType, count)
			}
		}
	}
	fmt.Fprintf(f, "\n")
}

func writeDomainStats(db *sql.DB, f *os.File) {
	fmt.Fprintf(f, "## 🌐 Top 20 Domínios Indexados\n\n")
	fmt.Fprintf(f, "| Domínio | Total de Links |\n")
	fmt.Fprintf(f, "|---|---|\n")

	rows, err := db.Query("SELECT domain, COUNT(*) FROM search_index GROUP BY domain ORDER BY COUNT(*) DESC LIMIT 20")
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var domain string
		var count int
		if err := rows.Scan(&domain, &count); err == nil {
			fmt.Fprintf(f, "| %s | %d |\n", domain, count)
		}
	}
	fmt.Fprintf(f, "\n")
}

func writeRecentEntries(db *sql.DB, f *os.File) {
	fmt.Fprintf(f, "## 🆕 Últimos 10 Itens Adicionados\n\n")
	fmt.Fprintf(f, "*(Baseado na ordem de inserção - ROWID)*\n\n")

	rows, err := db.Query("SELECT title, url, type FROM search_index ORDER BY rowid DESC LIMIT 10")
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var title, url, tType string
		if err := rows.Scan(&title, &url, &tType); err == nil {
			if title == "" {
				title = "Sem Título"
			}
			fmt.Fprintf(f, "- **[%s]** [%s](%s)\n", tType, title, url)
		}
	}
	fmt.Fprintf(f, "\n")
}
