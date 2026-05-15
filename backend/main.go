package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/crom-pesquisador/backend/api"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := api.SetupRouter()

	fmt.Printf("CROM Engine Backend running on port %s\n", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
