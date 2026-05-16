# CROM Backend (Go)

Bem-vindo à documentação da camada **Backend** do CROM Engine. 
Este diretório contém toda a lógica servidora da plataforma de busca descentralizada, desenvolvida em **Go**. O backend atua como o motor central que interage com o banco de dados e serve informações ultrarrápidas para o frontend.

## 📂 O que essa pasta deve ter?

Esta pasta deve focar **exclusivamente** na infraestrutura de serviços. Ela NÃO deve conter código do crawler ou do frontend. A responsabilidade do backend é expor a API HTTP, lidar com a paginação, buscas Full-Text Search (FTS) no SQLite, e garantir que as respostas sejam sanitizadas e armazenadas em cache.

## 📄 Estrutura de Arquivos

*   **`api/`**
    *   Este subdiretório contém o gerenciamento das rotas HTTP, webhooks, painel de admin e lógica principal de processamento de buscas. (Consulte o README na pasta `api` para detalhes).
*   **`db/`**
    *   Subdiretório vital que implementa a conexão direta com o SQLite (`global_index.db`). É aqui que a arquitetura *Singleton Connection Pool* gerencia concorrência e o CRUD (Create, Read, Update, Delete) do índice global. (Consulte o README na pasta `db` para detalhes).

## 🚀 Como funciona e o que precisa fazer

O Backend do CROM é instanciado na porta **`8098`** (via `backend/api/api.go` ou outro entrypoint). Ele precisa:

1.  **Hospedar a API**: Fornecer endpoints RESTFul que o frontend React consome (ex: `/search`, `/stats`).
2.  **Performance Máxima**: Fazer uso de `sync.Map` para caching em memória de requisições repetidas para evitar estresse no banco de dados.
3.  **Segurança e Governança**: Utilizar o `ADMIN_SECRET` para proteger rotas administrativas e realizar IP Hashing para auditoria anônima sem quebrar as regras de soberania digital (Zero Tracking).
4.  **Integração**: Servir como ponto de leitura do banco de dados `data/index/global_index.db`, que está sendo simultaneamente alimentado e escrito pela camada `crawler`.

> **⚠️ Regra de Ouro:**
> Nenhuma função nesta camada deve engasgar ou "lockar" o banco de dados. Leituras FTS (Full-Text Search) são priorizadas e todas as mutações no banco devem ser feitas preferencialmente via singleton em `db/`.
