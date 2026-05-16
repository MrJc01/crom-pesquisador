# CROM Pesquisador (p.crom.run)

Bem-vindo ao repositório oficial do **CROM Engine**, a plataforma que empodera o buscador **[p.crom.run](https://p.crom.run)**.
Este é um mecanismo de busca descentralizado, construído sob os pilares da Soberania Digital, privacidade (Zero Tracking) e um indexador web altamente customizável.

## 🌟 O que é o CROM Pesquisador?

O CROM não é apenas uma interface gráfica, é um **Motor de Busca Full-Stack completo** operando de ponta a ponta. Ele possui seu próprio robô varredor (Crawler) que mapeia a web, um banco de dados ultrarrápido baseado em Full-Text Search (SQLite FTS5), um backend servindo resultados com latência mínima em Go, e um frontend moderno responsivo focado em usabilidade e beleza.

## 🏗️ Estrutura do Repositório (Arquitetura)

O sistema foi desenhado em camadas rigorosamente isoladas para garantir escalabilidade:

*   **`frontend/`**: Interface de usuário do buscador. Construído em React, Vite e TailwindCSS. Exibe os resultados separados por abas (Todos, Imagens, Vídeos, Notícias, Código). O design segue a linguagem visual do ecossistema CROM (Modo Noturno Glassmorphism).
*   **`backend/`**: O motor servidor escrito em Golang. Contém o roteador da API REST (pasta `api/`) e o gerenciador de banco de dados (pasta `db/`). É ele que entrega os dados para a interface, roda na porta interna e faz cache de requisições pesadas.
*   **`crawler/`**: O Robô Explorador (Crawler Engine). Também escrito em Go. Ele é acionado no terminal apontando para um arquivo em `targets/` e viaja de link em link extraindo informações textuais e de mídias, injetando diretamente no banco de dados com altíssima taxa de requisição e paralelismo.
*   **`data/`**: A "Mente" do CROM. Diretório de persistência onde reside o arquivo principal `global_index.db`. Nele estão as tabelas relacionais do índice de sites e os índices virtuais FTS usados na busca.

*(Dica: Cada pasta principal acima contém seu próprio arquivo `README.md` com explicações técnicas profundas sobre suas engrenagens).*

## 🚀 Como Subir o Projeto (Ambiente VPS / Produção)

O ambiente do `p.crom.run` funciona em uma VPS rodando debian e NGINX como proxy reverso. O deploy é feito de forma enxuta via scripts:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/MrJc01/crom-pesquisador.git
   cd crom-pesquisador
   ```

2. **Sincronização / Deploy:**
   O script principal `vps_sync.sh` deve ser rodado dentro do ambiente de produção.
   Ele fará o `git pull` da main, compilará o FrontEnd em Vite, compilará e unificará os serviços Go (Backend) e reiniciará o NGINX.
   ```bash
   ./vps_sync.sh
   ```

3. **Iniciando o Crawler (Exemplo):**
   Para alimentar a base de dados em tempo real, você roda o crawler com uma semente da pasta `targets/`.
   ```bash
   go run crawler/main.go --config crawler/targets/brasil_top.json
   ```

## 🛡️ Segurança e Privacidade

Este projeto orgulhosamente não retém dados de navegação de usuário, cumprindo a promessa do Zero Tracking da plataforma CROM. Além disso, as rotas que fazem modificações no banco de dados exigem a variável de ambiente `ADMIN_SECRET` para prevenir indexações maliciosas.

---
*Zero tracking · Soberania Digital · CROM Engine*
