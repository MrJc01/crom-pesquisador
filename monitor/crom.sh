#!/bin/bash

# Define absolute paths
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

export LOGS_DIR="$DIR/logs"
mkdir -p "$LOGS_DIR"

# Impede que o CTRL+C feche o menu principal acidentalmente
trap '' SIGINT

while true; do
    clear_screen
    print_header "Visão Geral do CROM-OS"

    # Mini Overview no Menu
    echo -e "${C_CYAN}[STATUS RÁPIDO]${C_RESET}"
    if ss -tlnp 2>/dev/null | grep -q ":8098"; then
        echo -e " Backend Go (API)  : ${C_GREEN}ONLINE${C_RESET} (Porta 8098)"
    else
        echo -e " Backend Go (API)  : ${C_RED}OFFLINE${C_RESET}"
    fi

    if ss -tlnp 2>/dev/null | grep -q ":3000"; then
        echo -e " Frontend React    : ${C_GREEN}ONLINE${C_RESET} (Porta 3000)"
    else
        echo -e " Frontend React    : ${C_RED}OFFLINE${C_RESET}"
    fi
    
    crawlers_count=$(ps aux | grep "crawler/main.go" | grep -v grep | wc -l)
    if [ "$crawlers_count" -gt 0 ]; then
        echo -e " Crawlers Ativos   : ${C_YELLOW}${crawlers_count} em execução${C_RESET}"
    else
        echo -e " Crawlers Ativos   : ${C_GRAY}Nenhum${C_RESET}"
    fi

    db_count=$(ls -1 "$PROJECT_ROOT/data/sites"/*.db 2>/dev/null | wc -l)
    echo -e " Bancos de Dados   : ${C_BLUE}${db_count} sites indexados${C_RESET}\n"

    echo -e "${C_CYAN}[MENU DE AÇÕES]${C_RESET}"
    echo "1. 🌐 Abrir Dashboard Real-Time (Monitoramento Tático)"
    echo "2. ⚙️  Gerenciar Backend (Iniciar / Parar / Logs)"
    echo "3. 🖥️  Gerenciar Frontend (Iniciar / Parar / Logs)"
    echo "4. 🕷️  Gerenciar Crawlers (Iniciar Bot / Matar / Status)"
    echo "5. 🧪 Suíte de Testes (QA E2E e Unitários)"
    echo "6. 📊 Gerar Relatórios Analíticos (Markdown)"
    echo "7. 🤖 Comandar Frota de Crawlers (JSON IaD)"
    echo "8. 🛡️  Moderação SRE (Banimentos / Sugestões)"
    echo "0. Sair do CROM-OS"
    echo ""
    echo -n -e "${C_BOLD}Escolha uma opção: ${C_RESET}"
    read opcao

    case $opcao in
        1) bash "$DIR/pages/dashboard.sh" ;;
        2) bash "$DIR/pages/backend.sh" ;;
        3) bash "$DIR/pages/frontend.sh" ;;
        4) bash "$DIR/pages/crawlers.sh" ;;
        5) bash "$DIR/pages/tests.sh" ;;
        6) bash "$DIR/pages/reports.sh" ;;
        7) bash "$DIR/pages/fleet.sh" ;;
        8) bash "$DIR/pages/sre.sh" ;;
        0) print_success "CROM-OS Encerrado."; exit 0 ;;
        *) print_error "Opção inválida!"; sleep 1 ;;
    esac
done
