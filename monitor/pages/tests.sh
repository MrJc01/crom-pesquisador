#!/bin/bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."

while true; do
    clear_screen
    print_header "🧪 CROM-OS: Central de Qualidade (QA & Stress)"
    
    echo "1. 🛠️  Rodar Testes Unitários (Pipeline CI/CD - Banco, API, Crawler)"
    echo "2. 💣 Engenharia do Caos: Canhão FTS5 (API de Busca)"
    echo "3. 💣 Engenharia do Caos: Canhão de Oráculo (Binance API)"
    echo "4. 🛡️  Teste de Defesa LGPD (Rate Limit Anti-Spam)"
    echo "0. Voltar ao Menu Principal"
    echo ""
    echo -n -e "${C_BOLD}Escolha um teste para disparar: ${C_RESET}"
    read opcao_teste

    case $opcao_teste in
        1)
            echo -e "\n${C_CYAN}Iniciando Testes da Camada: Backend (Banco de Dados & Governança)${C_RESET}"
            cd "$PROJECT_ROOT/backend" || exit
            if go test ./db -v; then
                print_success "Testes de Banco e Governança PASSARAM!"
            else
                print_error "FALHA nos testes de Banco e Governança!"
            fi

            echo -e "\n${C_CYAN}Iniciando Testes da Camada: Backend (API & Rotas)${C_RESET}"
            if go test ./api -v; then
                print_success "Testes da API REST PASSARAM!"
            else
                print_error "FALHA nos testes da API REST!"
            fi

            echo -e "\n${C_CYAN}Iniciando Testes da Camada: Crawler (Extração & Redes)${C_RESET}"
            cd "$PROJECT_ROOT/crawler" || exit
            if go test . -v; then
                print_success "Testes do Crawler PASSARAM!"
            else
                print_error "FALHA nos testes do Crawler!"
            fi
            echo ""
            pause
            ;;
        2)
            echo -e "\n${C_RED}PREPARANDO CANHÃO FTS5...${C_RESET}"
            echo -n "Digite a URL alvo (padrão: http://127.0.0.1:8098/api/search?q=dolar): "
            read target
            target=${target:-http://127.0.0.1:8098/api/search?q=dolar}
            cd "$PROJECT_ROOT/tests/prod" || exit
            go run stress_api.go -url "$target" -c 100 -d 10
            echo ""
            pause
            ;;
        3)
            echo -e "\n${C_RED}PREPARANDO CANHÃO DE ORÁCULO...${C_RESET}"
            echo -n "Digite a URL alvo (padrão: http://127.0.0.1:8098/api/search?q=bitcoin): "
            read target
            target=${target:-http://127.0.0.1:8098/api/search?q=bitcoin}
            cd "$PROJECT_ROOT/tests/prod" || exit
            go run stress_oraculo.go -url "$target" -c 50 -d 10
            echo ""
            pause
            ;;
        4)
            echo -e "\n${C_RED}PREPARANDO BOMBA DE SPAM (LGPD)...${C_RESET}"
            echo -n "Digite a URL de comentários alvo (padrão: http://127.0.0.1:8098/api/link/test_domain|test_id/comment): "
            read target
            target=${target:-http://127.0.0.1:8098/api/link/test_domain|test_id/comment}
            cd "$PROJECT_ROOT/tests/prod" || exit
            go run test_rate_limit.go -url "$target" -n 25
            echo ""
            pause
            ;;
        0) break ;;
        *) print_error "Opção inválida!"; sleep 1 ;;
    esac
done
