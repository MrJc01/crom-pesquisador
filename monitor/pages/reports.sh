#!/bin/bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$DIR/libs/ui.sh"
PROJECT_ROOT="$DIR/.."
REPORTS_DIR="$PROJECT_ROOT/reports"

mkdir -p "$REPORTS_DIR"

clear_screen
print_header "Gerador de Relatórios Analíticos"

REPORT_FILE="${REPORTS_DIR}/relatorio_$(date +%Y%m%d_%H%M%S).md"
echo -e "${C_BLUE}Analisando sistema e gerando relatório em $REPORT_FILE...${C_RESET}"

# Iniciar Markdown
echo "# Relatório SRE - CROM Engine" > "$REPORT_FILE"
echo "**Data:** $(date)" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"

echo "## 1. Status dos Serviços" >> "$REPORT_FILE"
if ss -tln | grep -q ":8080"; then
    echo "- **Backend Go**: ONLINE" >> "$REPORT_FILE"
else
    echo "- **Backend Go**: OFFLINE" >> "$REPORT_FILE"
fi

if ss -tln | grep -q ":3000"; then
    echo "- **Frontend React**: ONLINE" >> "$REPORT_FILE"
else
    echo "- **Frontend React**: OFFLINE" >> "$REPORT_FILE"
fi

echo "## 2. Crawlers Ativos" >> "$REPORT_FILE"
echo "\`\`\`bash" >> "$REPORT_FILE"
ps aux | grep "crawler/main.go" | grep -v grep >> "$REPORT_FILE" || echo "Nenhum crawler rodando." >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

echo "## 3. Armazenamento de Dados (Sites)" >> "$REPORT_FILE"
echo "| Domínio | Arquivo DB | Tamanho |" >> "$REPORT_FILE"
echo "|---|---|---|" >> "$REPORT_FILE"
for db_file in "$PROJECT_ROOT/data/sites"/*.db; do
    if [ -f "$db_file" ]; then
        size=$(ls -lh "$db_file" | awk '{print $5}')
        name=$(basename "$db_file")
        domain=${name%.db}
        echo "| $domain | $name | $size |" >> "$REPORT_FILE"
    fi
done

print_success "Relatório criado com sucesso!"
echo -e "${C_GRAY}Conteúdo:${C_RESET}"
cat "$REPORT_FILE" | head -n 15
echo "..."

pause
