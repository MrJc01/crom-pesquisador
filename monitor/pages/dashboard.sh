#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

# Garantir que os serviços essenciais subam se não estiverem rodando
ensure_services() {
    local started_something=0
    # Backend
    if ! ss -tlnp 2>/dev/null | grep -q ":8080"; then
        print_info "Auto-Iniciando Backend..."
        cd "$PROJECT_ROOT" && go run backend/main.go > "$DIR/logs/backend.log" 2>&1 &
        echo $! > "$DIR/logs/backend.pid"
        started_something=1
    fi

    # Frontend
    if ! ss -tlnp 2>/dev/null | grep -q ":3000"; then
        print_info "Auto-Iniciando Frontend..."
        cd "$PROJECT_ROOT/frontend" && npm run dev -- --host 127.0.0.1 > "$DIR/logs/frontend.log" 2>&1 &
        echo $! > "$DIR/logs/frontend.pid"
        started_something=1
    fi

    if [ $started_something -eq 1 ]; then
        sleep 2 # Dá um tempinho pros serviços subirem
    fi
}

ensure_services

# Loop de refresh focado na compatibilidade
while true; do
    # Usando clear ansi para limpeza de tela sem ghosting
    printf "\033c"
    
    echo -e "${C_CYAN}================================================================${C_RESET}"
    echo -e "${C_BOLD}${C_GREEN} 🌐 CROM-OS TACTICAL DASHBOARD - Pressione QUALQUER TECLA para voltar ${C_RESET}"
    echo -e "${C_CYAN}================================================================${C_RESET}"
    
    # Status Serviços
    echo -e "\n${C_BOLD}[STATUS DOS SERVIÇOS]${C_RESET}"
    if ss -tln 2>/dev/null | grep -q ":8080"; then echo -e "Backend Go (API)  : ${C_GREEN}ONLINE (Porta 8080)${C_RESET}"; else echo -e "Backend Go (API)  : ${C_RED}OFFLINE${C_RESET}"; fi
    if ss -tln 2>/dev/null | grep -q ":3000"; then echo -e "Frontend React    : ${C_GREEN}ONLINE (Porta 3000)${C_RESET}"; else echo -e "Frontend React    : ${C_RED}OFFLINE${C_RESET}"; fi
    
    crawlers_count=$(ps aux | grep "crawler/main.go" | grep -v grep | wc -l)
    echo -e "Crawlers Ativos   : ${C_YELLOW}${crawlers_count}${C_RESET} bots coletando"

    # Últimos Logs Backend
    echo -e "\n${C_BOLD}[ÚLTIMOS LOGS BACKEND]${C_RESET}"
    if [ -f "$DIR/logs/backend.log" ]; then
        tail -n 6 "$DIR/logs/backend.log" | awk '{printf "  %s\n", $0}'
    else
        echo -e "  Sem logs gerados."
    fi

    # Uso de Rede e IPs Conectados
    echo -e "\n${C_BOLD}[CONEXÕES ATIVAS (Porta 8080)]${C_RESET}"
    conn_count=$(ss -tnp 2>/dev/null | grep ":8080" | wc -l)
    if [ "$conn_count" -gt 0 ]; then
        ss -tnp 2>/dev/null | grep ":8080" | awk '{printf "  %s <-> %s\n", $4, $5}' | head -5
    else
        echo -e "  Nenhuma conexão remota ativa agora."
    fi

    # Fila Autônoma
    echo -e "\n${C_BOLD}[FILA AUTÔNOMA (Mente Mestra)]${C_RESET}"
    if [ -f "$PROJECT_ROOT/data/index/global_index.db" ]; then
        queue_pending=$(sqlite3 "$PROJECT_ROOT/data/index/global_index.db" "SELECT COUNT(*) FROM crawler_queue WHERE status = 'pending';" 2>/dev/null || echo "0")
        queue_processing=$(sqlite3 "$PROJECT_ROOT/data/index/global_index.db" "SELECT COUNT(*) FROM crawler_queue WHERE status = 'processing';" 2>/dev/null || echo "0")
        queue_completed=$(sqlite3 "$PROJECT_ROOT/data/index/global_index.db" "SELECT COUNT(*) FROM crawler_queue WHERE status = 'completed';" 2>/dev/null || echo "0")
        
        echo -e "  Pendentes   : ${C_YELLOW}${queue_pending}${C_RESET} URLs aguardando"
        echo -e "  Processando : ${C_BLUE}${queue_processing}${C_RESET} URLs ativas"
        echo -e "  Concluídas  : ${C_GREEN}${queue_completed}${C_RESET} URLs finalizadas"
    else
        echo -e "  Banco Global não inicializado."
    fi

    # Bancos de Dados
    echo -e "\n${C_BOLD}[TOP 5 SITES INDEXADOS (Arquivos DB)]${C_RESET}"
    ls_count=$(ls -1 "$PROJECT_ROOT/data/sites"/*.db 2>/dev/null | wc -l)
    if [ "$ls_count" -gt 0 ]; then
        ls -lhS "$PROJECT_ROOT/data/sites"/*.db 2>/dev/null | awk '{printf "  %-10s - %s\n", $5, $9}' | head -5
    else
        echo -e "  Nenhum banco de dados criado ainda."
    fi
    
    echo -e "\n${C_GRAY}Atualizado em: $(date +"%H:%M:%S")${C_RESET}"

    # Espera 1.5 segundo por qualquer tecla
    if read -t 1.5 -n 1 key; then
        # Se uma tecla foi pressionada, sai do dashboard (volta pro menu)
        break
    fi
done

# Limpa a tela antes de voltar pro menu principal
printf "\033c"
