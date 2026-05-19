# Arquitetura Atual do Sistema (Maio 2026)

O Ecossistema CROM está dividido em quatro pilares fundamentais de alta resiliência e foco na "Soberania Digital", garantindo privacidade, escalabilidade e evasão de bloqueios.

## 1. Frontend (View Layer & Shield)
- **Stack**: React 19, Vite, TailwindCSS v4, Zustand.
- **Responsabilidade**: Camada de apresentação "Premium Minimalist". Renderiza buscas FTS segmentadas em abas nativas e painéis de Oráculo.
- **Geo-Blocking Integrado**: Implementado via `geojs.io` na raiz (`App.tsx`). Acesso originado fora do Brasil é imediatamente interceptado e bloqueado pela interface sem consumir I/O do servidor, servindo como uma primeira camada leve Anti-DDoS.

## 2. Backend API (CROM Engine & Oráculo)
- **Stack**: Go 1.25, `go-chi/chi`, `modernc.org/sqlite` (Pure Go).
- **Responsabilidade**: Concentra a API REST. Roda múltiplas consultas assíncronas (FTS5) no SQLite (`global_index.db`).
- **Oráculo Inteligente**: Intercepta intenções diretas (ex: Dólar, Bitcoin) e consulta corretoras (Binance) em tempo real, fornecendo os "Knowledge Panels".
- **Gatilho Autônomo**: Injeta pesquisas feitas por usuários (queries) em formato de URLs de sementes (Wikipedia, DuckDuckGo) na fila de processamento autônomo do Crawler.

## 3. Web Crawler Autônomo (O Aracnídeo Fantasma)
- **Stack**: Go, `goquery` (Parsing HTML), Colly.
- **Modus Operandi**:
  - **Mente Mestra (Autônomo)**: Consulta a tabela `crawler_queue` periodicamente. Desce nas páginas coletadas buscando Sitemaps e usando BFS para descobrir links externos e inseri-los de volta na fila.
  - **Proxy Pool Rotativo**: Baixa e avalia IPs brasileiros dinamicamente via `proxyscrape.com`. Ao acessar sites, rotaciona os IPs para evadir firewalls e Cloudflare básico.

## 4. CROM-OS (Tactical TUI Dashboard)
- **Atalho**: `./monitor.sh` na raiz.
- **Stack**: Shell Script avançado (`bash`, `trap`, `watch`, `sqlite3`).
- **Responsabilidade**: Dashboard visual de operações rodando direto no terminal da VPS. Exibe status do Backend, Frontend e leitura direta da Fila Autônoma do banco de dados (URLs pendentes, ativas e processadas).
