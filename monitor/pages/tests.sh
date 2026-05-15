#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

clear_screen
print_header "Suíte de Testes (QA)"

echo "1. Rodar Testes Unitários do Backend (Go)"
echo "2. Rodar Testes E2E do Frontend (Playwright)"
echo "0. Voltar"
echo ""
echo -n -e "${C_BOLD}Escolha uma opção: ${C_RESET}"
read opcao

case $opcao in
    1)
        print_info "Rodando testes em Go..."
        cd "$PROJECT_ROOT/backend" && go test -v ./tests/...
        pause
        ;;
    2)
        print_info "Rodando Playwright E2E Tests..."
        cd "$PROJECT_ROOT/frontend" && npx playwright test --project=chromium
        pause
        ;;
    0) exit 0 ;;
    *) print_error "Opção inválida!"; sleep 1 ;;
esac
