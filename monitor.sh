#!/bin/bash
# Atalho rápido para iniciar o CROM-OS Monitor
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$DIR/monitor/crom.sh" ]; then
    bash "$DIR/monitor/crom.sh"
else
    echo "Erro: O script principal em monitor/crom.sh não foi encontrado."
    exit 1
fi
