# Arquitetura Atual do Sistema

O Ecossistema CROM está dividido em quatro pilares fundamentais, todos desacoplados, mas interconectados.

## 1. Frontend (View Layer)
- **Caminho**: `/frontend`
- **Stack**: React 19, Vite, TailwindCSS v4, Zustand.
- **Responsabilidade**: Camada de apresentação "Premium Minimalist". Gerencia o estado visual (Dark Mode persistente), histórico local de buscas e rotas (via React Router).
- **Testes**: Playwright configurado para CI/CD (`npm run preview`).

## 2. Backend API (CROM Engine)
- **Caminho**: `/backend`
- **Stack**: Go 1.25, `go-chi/chi`, `modernc.org/sqlite` (Pure Go).
- **Responsabilidade**: Expor os dados para o Frontend. Contém as rotas REST (`/api/link/:id`, `/api/search`) com suporte a CORS. Lida com a criptografia de IPs para LGPD antes de tocar no disco.
- **Porta Padrão**: 8080.

## 3. Web Crawler (Bot Indexador)
- **Caminho**: `/crawler`
- **Stack**: Go, `goquery` (Parsing HTML).
- **Responsabilidade**: Binário autônomo que pode ser acionado para escanear uma URL. Ele extrai metadados, infere tags, valida SSL e cria/popula o arquivo SQLite (`.db`) do respectivo site.
- **CLI**: Suporta flags de limite de coleta (`--limit`) e taxa de atraso (`--delay`) para evitar congestionamento na rede.

## 4. CROM-OS (TUI Monitor)
- **Caminho**: `/monitor` e atalho `./monitor.sh` na raiz.
- **Stack**: Shell Script avançado (`bash`, `trap`, `tput`, `ss`).
- **Responsabilidade**: Abstrair a gestão de infraestrutura. Permite ao desenvolvedor (ou DevOps):
  - Iniciar/Parar serviços via menu interativo.
  - Ver consumo de rede e processos num "Dashboard Real-time" ultra-fluido (anti-ghosting).
  - Executar testes automatizados (Playwright e Go Unit tests).
  - Gerar relatórios SRE de status de arquivos em Markdown (`/reports`).
