#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

clear_screen
print_header "Gerenciador de Crawlers (Bots)"

echo "1. Iniciar novo Crawler"
echo "2. Listar Crawlers rodando"
echo "3. Matar um Crawler (via PID)"
echo "4. Matar TODOS os Crawlers"
echo "0. Voltar"
echo ""
echo -n -e "${C_BOLD}Escolha uma opção: ${C_RESET}"
read opcao

case $opcao in
    1)
        read -p "Digite a URL alvo (ex: https://crom.me): " url
        if [ -z "$url" ]; then exit 0; fi
        read -p "Limite de páginas (default 10): " limit
        limit=${limit:-10}
        
        cd "$PROJECT_ROOT" && go run crawler/main.go --site="$url" --limit="$limit" > "$DIR/logs/crawler_${limit}_$(date +%s).log" 2>&1 &
        PID=$!
        print_success "Crawler iniciado para $url (PID: $PID)"
        pause
        ;;
    2)
        echo -e "\n${C_CYAN}Processos Crawler Ativos:${C_RESET}"
        ps aux | grep "crawler/main.go" | grep -v grep || echo "Nenhum crawler rodando."
        pause
        ;;
    3)
        read -p "Digite o PID do crawler para parar: " pid
        if [ -n "$pid" ]; then
            kill $pid && print_success "Processo $pid morto." || print_error "Falha ao matar processo."
        fi
        pause
        ;;
    4)
        print_warning "Matando todos os processos crawler/main.go..."
        pkill -f "crawler/main.go" && print_success "Todos os crawlers mortos." || print_info "Nenhum crawler rodando."
        pause
        ;;
    0) exit 0 ;;
    *) print_error "Opção inválida!"; sleep 1 ;;
esac
