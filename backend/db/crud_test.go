package db

import (
	"os"
	"testing"
	"time"
)

func setupTestDB() {
	// Garante que o diretório data/index existe para os testes
	os.MkdirAll("../../data/index", 0755)
	os.MkdirAll("../../data/sites", 0755)
	os.Remove("../../data/index/global_index.db")
	os.Remove("../../data/sites/testdomain.com.db")
}

func TestGlobalIndexSchema(t *testing.T) {
	setupTestDB()
	db, err := OpenGlobalIndex()
	if err != nil {
		t.Fatalf("OpenGlobalIndex() error = %v", err)
	}
	defer db.Close()

	// Verifica se a tabela search_index existe
	var exists int
	err = db.QueryRow("SELECT 1 FROM sqlite_master WHERE type='table' AND name='search_index'").Scan(&exists)
	if err != nil || exists != 1 {
		t.Errorf("Tabela search_index não foi criada")
	}

	// Verifica se a tabela banned_domains existe (Governança)
	err = db.QueryRow("SELECT 1 FROM sqlite_master WHERE type='table' AND name='banned_domains'").Scan(&exists)
	if err != nil || exists != 1 {
		t.Errorf("Tabela banned_domains não foi criada")
	}
}

func TestGovernanceSuggestURL(t *testing.T) {
	setupTestDB()
	err := SuggestURL("https://exemplo.com.br")
	if err != nil {
		t.Fatalf("SuggestURL failed: %v", err)
	}
	// Duplicata não deve dar erro
	err = SuggestURL("https://exemplo.com.br")
	if err != nil {
		t.Fatalf("SuggestURL duplicata não deve falhar: %v", err)
	}
}

func TestGovernanceBanDomain(t *testing.T) {
	setupTestDB()
	err := BanDomain("malware.com", "Conteúdo Malicioso")
	if err != nil {
		t.Fatalf("BanDomain failed: %v", err)
	}

	banned := IsDomainBanned("malware.com")
	if !banned {
		t.Errorf("IsDomainBanned retornou false para domínio banido")
	}

	banned = IsDomainBanned("seguro.com")
	if banned {
		t.Errorf("IsDomainBanned retornou true para domínio seguro")
	}
}

func TestGovernanceReportLink(t *testing.T) {
	setupTestDB()
	err := ReportLink("meta-123", "https://spam.com/1", "Phishing")
	if err != nil {
		t.Fatalf("ReportLink failed: %v", err)
	}
}

func TestSaveAndGetNode(t *testing.T) {
	setupTestDB()
	siteDB, err := OpenSiteDB("testdomain.com")
	if err != nil {
		t.Fatalf("OpenSiteDB error = %v", err)
	}
	defer siteDB.Close()

	node := &LinkDetail{
		URL:  "https://testdomain.com/page",
		Type: "page",
		Meta: LinkMeta{
			Title:         "Página de Teste",
			Description:   "Isso é um teste.",
			PublishedDate: time.Now().Format(time.RFC3339),
			Keywords:      []string{"teste", "go"},
		},
		Technical: LinkTechnical{
			Domain:     "testdomain.com",
			HTTPStatus: 200,
		},
		Analytics: LinkAnalytics{
			CromRank: 50,
		},
	}

	err = siteDB.SaveNode(node)
	if err != nil {
		t.Fatalf("SaveNode error = %v", err)
	}

	// Recuperar
	saved, err := siteDB.GetNode(node.ID)
	if err != nil {
		t.Fatalf("GetNode error = %v", err)
	}
	if saved == nil {
		t.Fatalf("Node não encontrado")
	}
	if saved.Meta.Title != "Página de Teste" {
		t.Errorf("Esperava título 'Página de Teste', obteve '%s'", saved.Meta.Title)
	}
}
