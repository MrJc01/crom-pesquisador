#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

clear_screen
print_header "🧪 Suíte de Testes QA (SRE)"

echo -e "${C_CYAN}Iniciando Testes da Camada: Backend (Banco de Dados & Governança)${C_RESET}"
cd "$PROJECT_ROOT/backend" || exit
if go test ./db -v; then
    print_success "Testes de Banco e Governança PASSARAM!"
else
    print_error "FALHA nos testes de Banco e Governança!"
fi

echo ""
echo -e "${C_CYAN}Iniciando Testes da Camada: Backend (API & Rotas)${C_RESET}"
if go test ./api -v; then
    print_success "Testes da API REST PASSARAM!"
else
    print_error "FALHA nos testes da API REST!"
fi

echo ""
echo -e "${C_CYAN}Iniciando Testes da Camada: Crawler (Extração & Redes)${C_RESET}"
cd "$PROJECT_ROOT/crawler" || exit
if go test . -v; then
    print_success "Testes do Crawler PASSARAM!"
else
    print_error "FALHA nos testes do Crawler!"
fi

echo ""
wait_keypress
