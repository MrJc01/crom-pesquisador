#!/bin/bash

# ==========================================
# CROM-OS: Central de Moderação SRE
# ==========================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/../libs/ui.sh"
PROJECT_ROOT="$DIR/../.."

DB_INDEX="$PROJECT_ROOT/data/index/global_index.db"

while true; do
    clear_screen
    print_header "🛡️ Central de Moderação SRE"
    
    echo "1. 🔨 Banir Domínio (Remove do Buscador e Apaga Arquivos)"
    echo "2. 📋 Ver URLs Sugeridas pela Comunidade"
    echo "3. 🚨 Ver Denúncias de Conteúdo (Reports)"
    echo "4. 📜 Ver Domínios Banidos"
    echo "0. Voltar ao Menu Principal"
    echo ""
    echo -n -e "${C_BOLD}Escolha uma ação SRE: ${C_RESET}"
    read acao

    case $acao in
        1)
            echo ""
            echo -n -e "${C_YELLOW}Digite o domínio exato para banir (ex: blaze.com): ${C_RESET}"
            read domain
            if [ -n "$domain" ]; then
                echo -n -e "${C_RED}Motivo do banimento: ${C_RESET}"
                read reason
                
                # Insert into banned_domains
                sqlite3 "$DB_INDEX" "INSERT INTO banned_domains (domain, reason, banned_at) VALUES ('$domain', '$reason', datetime('now')) ON CONFLICT(domain) DO UPDATE SET reason=excluded.reason;"
                
                # Delete from FTS5 index
                sqlite3 "$DB_INDEX" "DELETE FROM search_index WHERE domain = '$domain';"
                
                # Delete SQLite File
                rm -f "$PROJECT_ROOT/data/sites/$domain.db"
                
                print_success "Domínio $domain banido com sucesso e arquivos apagados!"
            fi
            read -p "Pressione Enter para continuar..."
            ;;
        2)
            echo ""
            print_header "URLs Sugeridas (Aguardando Crawler)"
            sqlite3 -header -column "$DB_INDEX" "SELECT url, status, suggested_at FROM suggested_urls ORDER BY suggested_at DESC LIMIT 20;"
            echo ""
            read -p "Pressione Enter para continuar..."
            ;;
        3)
            echo ""
            print_header "🚨 Central de Denúncias"
            sqlite3 -header -column "$DB_INDEX" "SELECT url, reason, reported_at FROM reports ORDER BY reported_at DESC LIMIT 20;"
            echo ""
            read -p "Pressione Enter para continuar..."
            ;;
        4)
            echo ""
            print_header "🔨 Mural da Vergonha (Banidos)"
            sqlite3 -header -column "$DB_INDEX" "SELECT domain, reason, banned_at FROM banned_domains;"
            echo ""
            read -p "Pressione Enter para continuar..."
            ;;
        0) break ;;
        *) print_error "Opção inválida!"; sleep 1 ;;
    esac
done
