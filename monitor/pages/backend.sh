#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

clear_screen
print_header "Gerenciador do Backend (Go API)"

echo "1. Iniciar Backend (Porta 8080)"
echo "2. Parar Backend"
echo "3. Ver Logs em Tempo Real"
echo "0. Voltar"
echo ""
echo -n -e "${C_BOLD}Escolha uma opção: ${C_RESET}"
read opcao

PID_FILE="$DIR/logs/backend.pid"
LOG_FILE="$DIR/logs/backend.log"

case $opcao in
    1)
        if ss -tlnp | grep -q ":8080"; then
            print_warning "Backend já está rodando na porta 8080."
        else
            print_info "Iniciando Backend..."
            cd "$PROJECT_ROOT" && go run backend/main.go > "$LOG_FILE" 2>&1 &
            echo $! > "$PID_FILE"
            print_success "Backend iniciado em background."
        fi
        pause
        ;;
    2)
        if [ -f "$PID_FILE" ]; then
            kill $(cat "$PID_FILE") 2>/dev/null
            rm "$PID_FILE"
            print_success "Backend parado via PID."
        elif ss -tlnp | grep -q ":8080"; then
            print_warning "Matando processo na porta 8080..."
            fuser -k 8080/tcp
            print_success "Processo morto."
        else
            print_error "Backend não parece estar rodando."
        fi
        pause
        ;;
    3)
        if [ -f "$LOG_FILE" ]; then
            echo -e "${C_CYAN}Exibindo logs (Pressione CTRL+C para voltar):${C_RESET}"
            tail -f "$LOG_FILE"
        else
            print_error "Arquivo de log não encontrado."
            pause
        fi
        ;;
    0) exit 0 ;;
    *) print_error "Opção inválida!"; sleep 1 ;;
esac
