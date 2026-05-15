#!/bin/bash
# ==========================================
# CROM Engine - CI/CD Sync Script
# Execute este arquivo na VPS para atualizar o sistema
# ==========================================

# Cores
C_GREEN="\e[32m"
C_RED="\e[31m"
C_CYAN="\e[36m"
C_RESET="\e[0m"

echo -e "${C_CYAN}🔄 Iniciando Sincronização do CROM Engine...${C_RESET}"

# 1. Puxar código novo
echo "⬇️  Puxando alterações do GitHub (main)..."
git reset --hard HEAD
git pull origin main

# 2. Build Frontend
echo "📦 Compilando Frontend React (Vite Produção)..."
cd frontend
npm install
npm run build
cd ..

# 3. Build Backend
echo "🐹 Compilando Backend Go..."
cd backend
go build -o crom_api main.go
cd ..

# 4. Sincronização de Bancos Isolados (Correção SRE)
echo "📂 Verificando e unificando bancos de dados isolados..."
if [ -d "$PWD/crawler/data" ]; then
    mkdir -p "$PWD/data"
    cp -r "$PWD/crawler/data/"* "$PWD/data/" 2>/dev/null || true
    rm -rf "$PWD/crawler/data"
    echo " -> Bancos movidos com sucesso para a raiz."
fi

# 5. Reiniciar Serviços
echo "🚀 Reiniciando Serviços..."

# Mata a API antiga se estiver rodando via processo normal
pkill -f crom_api || true

# Inicia a API nova em background (nohup) e joga logs para backend.log
echo "Lançando Backend na porta 8098..."
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
nohup ./backend/crom_api > backend/backend.log 2>&1 &

# Reinicia Nginx
echo "🌐 Recarregando NGINX..."
sudo systemctl reload nginx || sudo service nginx reload

echo -e "${C_GREEN}✅ Deploy concluído com sucesso! O CROM está atualizado e online.${C_RESET}"
