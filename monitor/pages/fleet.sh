#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/../libs/ui.sh"
PROJECT_ROOT="$DIR/../.."
TARGETS_DIR="$PROJECT_ROOT/crawler/targets"

list_fleet() {
    echo -e "${C_CYAN}[FROTA CROM-BOT - Infrastructure as Data]${C_RESET}"
    if ! command -v jq &> /dev/null; then
        echo -e "${C_RED}[ERRO CRÍTICO] O pacote 'jq' não está instalado!${C_RESET}"
        echo -e "${C_YELLOW}Por favor, rode no seu VPS: sudo apt-get update && sudo apt-get install jq -y${C_RESET}"
        return
    fi
    
    if [ ! -d "$TARGETS_DIR" ] || [ -z "$(ls -A "$TARGETS_DIR"/*.json 2>/dev/null)" ]; then
        echo -e "${C_GRAY}Nenhum arquivo JSON de alvo encontrado em $TARGETS_DIR${C_RESET}"
        return
    fi

    echo -e "${C_BOLD}Alvos Disponíveis:${C_RESET}"
    for file in "$TARGETS_DIR"/*.json; do
        if [ -f "$file" ]; then
            name=$(jq -r '.name' "$file" 2>/dev/null)
            urls_count=$(jq -r '.urls | length' "$file" 2>/dev/null)
            limit=$(jq -r '.limit_per_site' "$file" 2>/dev/null)
            filename=$(basename "$file")
            
            # Check if running
            is_running=$(ps aux | grep "crawler/main.go --config.*$filename" | grep -v grep | wc -l)
            status="${C_GRAY}OFFLINE${C_RESET}"
            if [ "$is_running" -gt 0 ]; then
                status="${C_GREEN}ONLINE${C_RESET}"
            fi

            echo -e " 📄 ${C_YELLOW}$filename${C_RESET} -> $name | Alvos: $urls_count | Limite/Site: $limit | Status: $status"
        fi
    done
}

deploy_fleet() {
    echo -e "\n${C_CYAN}[DEPL0Y DA FROTA]${C_RESET}"
    if ! command -v jq &> /dev/null; then
        print_error "O pacote 'jq' não está instalado. Instale-o com: sudo apt-get install jq -y"
        return
    fi

    for file in "$TARGETS_DIR"/*.json; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            is_running=$(ps aux | grep "crawler/main.go --config.*$filename" | grep -v grep | wc -l)
            
            if [ "$is_running" -eq 0 ]; then
                echo -e " Lançando CROM-Bot para: ${C_YELLOW}$filename${C_RESET}..."
                nohup bash -c "cd '$PROJECT_ROOT/crawler' && go run main.go --config 'targets/$filename' >> '$LOGS_DIR/fleet_$filename.log' 2>&1" &>/dev/null &
                sleep 0.5
            else
                echo -e " ${C_GRAY}$filename já está rodando. Ignorado.${C_RESET}"
            fi
        fi
    done
    print_success "Deploy concluído! Acompanhe via Dashboard."
}

kill_fleet() {
    echo -e "\n${C_RED}[RECOLHENDO FROTA]${C_RESET}"
    pids=$(ps aux | grep "crawler/main.go --config" | grep -v grep | awk '{print $2}')
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9
        print_success "Todos os bots da frota foram desligados."
    else
        echo -e "${C_GRAY}Nenhum bot da frota rodando.${C_RESET}"
    fi
}

while true; do
    clear_screen
    list_fleet
    echo ""
    echo "1. 🚀 Lançar Frota (Iniciar todos os JSONs desligados)"
    echo "2. 🛑 Parar Frota (Matar todos os processos da frota)"
    echo "3. 📝 Ver logs da frota (Últimas 20 linhas)"
    echo "0. Voltar"
    echo ""
    echo -n -e "${C_BOLD}Opção: ${C_RESET}"
    read opcao

    case $opcao in
        1) deploy_fleet; pause ;;
        2) kill_fleet; pause ;;
        3) 
            clear_screen
            echo -e "${C_CYAN}--- Últimos Logs da Frota ---${C_RESET}"
            tail -n 20 "$LOGS_DIR"/fleet_*.log 2>/dev/null || echo "Sem logs ainda."
            pause
            ;;
        0) break ;;
        *) print_error "Inválido!"; sleep 1 ;;
    esac
done
