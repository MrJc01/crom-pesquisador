#!/bin/bash

# Cores UI
export C_RESET='\033[0m'
export C_RED='\033[0;31m'
export C_GREEN='\033[0;32m'
export C_YELLOW='\033[1;33m'
export C_BLUE='\033[0;34m'
export C_CYAN='\033[0;36m'
export C_GRAY='\033[1;30m'
export C_BOLD='\033[1m'

# Helpers
clear_screen() {
    clear
}

print_header() {
    local title="$1"
    echo -e "\n${C_CYAN}=================================================${C_RESET}"
    echo -e "${C_BOLD}${C_GREEN}    CROM-OS: ${title} ${C_RESET}"
    echo -e "${C_CYAN}=================================================${C_RESET}\n"
}

print_success() {
    echo -e "${C_GREEN}[OK]${C_RESET} $1"
}

print_error() {
    echo -e "${C_RED}[ERRO]${C_RESET} $1"
}

print_info() {
    echo -e "${C_BLUE}[INFO]${C_RESET} $1"
}

print_warning() {
    echo -e "${C_YELLOW}[AVISO]${C_RESET} $1"
}

pause() {
    echo -e "\n${C_GRAY}Pressione [Enter] para continuar...${C_RESET}"
    read -r
}
