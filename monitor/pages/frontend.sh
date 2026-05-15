#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

clear_screen
print_header "Gerenciador do Frontend (React)"

echo "1. Iniciar Frontend Dev Server (Porta 3000)"
echo "2. Parar Frontend"
echo "3. Ver Logs em Tempo Real"
echo "0. Voltar"
echo ""
echo -n -e "${C_BOLD}Escolha uma opção: ${C_RESET}"
read opcao

PID_FILE="$DIR/logs/frontend.pid"
LOG_FILE="$DIR/logs/frontend.log"

case $opcao in
    1)
        if ss -tlnp | grep -q ":3000"; then
            print_warning "Frontend já está rodando na porta 3000."
        else
            print_info "Iniciando Frontend (Vite)..."
            cd "$PROJECT_ROOT/frontend" && npm run dev -- --host 127.0.0.1 > "$LOG_FILE" 2>&1 &
            echo $! > "$PID_FILE"
            print_success "Frontend iniciado em background."
        fi
        pause
        ;;
    2)
        if [ -f "$PID_FILE" ]; then
            kill $(cat "$PID_FILE") 2>/dev/null
            rm "$PID_FILE"
            print_success "Frontend parado via PID."
        elif ss -tlnp | grep -q ":3000"; then
            print_warning "Matando processo na porta 3000..."
            fuser -k 3000/tcp
            print_success "Processo morto."
        else
            print_error "Frontend não parece estar rodando."
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
