package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`
		CREATE TABLE search_index (id TEXT, title TEXT);
		CREATE VIRTUAL TABLE search_fts USING fts5(title, content=search_index, content_rowid=rowid);
		CREATE TRIGGER search_index_ai AFTER INSERT ON search_index BEGIN
			INSERT INTO search_fts(rowid, title) VALUES (new.rowid, new.title);
		END;
	`)
	if err != nil { log.Fatal(err) }

	db.Exec("INSERT INTO search_index (id, title) VALUES ('1', 'americanas site de compras')")

	rows, err := db.Query("SELECT title FROM search_index JOIN search_fts ON search_index.rowid = search_fts.rowid WHERE search_fts MATCH ?", "a*")
	if err != nil {
		log.Fatal("Query error:", err)
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		var title string
		rows.Scan(&title)
		fmt.Println("Found:", title)
		count++
	}
	fmt.Println("Total found:", count)
}
