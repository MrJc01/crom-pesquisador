# CROM Data Storage (SQLite)

O coração descentralizado da infraestrutura de informações do CROM. Aqui reside todo o conhecimento global da Rede Soberana.

## 📂 O que essa pasta deve ter?

APENAS arquivos brutos de banco de dados (`.db`, `.db-wal`, `.db-shm`). Esta pasta atua como o disco rígido da aplicação e não deve conter código fonte ou lógica de negócio.

## 📄 Estrutura de Arquivos

*   **`index/`** (Subdiretório Principal)
    *   `global_index.db`: O ÚNICO e Soberano banco de dados do sistema CROM Pesquisador. Ele contém a tabela relacional `search_index` e a tabela virtual `search_fts` (Full-Text Search Engine).
    *   `global_index.db-wal` e `global_index.db-shm`: Arquivos de log de "Write-Ahead" criados nativamente pelo motor SQLite para permitir leituras da API e escritas do Crawler no exato mesmo milissegundo sem bloqueios (`database is locked`).
*   **`sites/`** (Obsoleto/Legado)
    *   No passado da arquitetura, existia um DB por domínio. Essa abordagem foi consolidada para garantir paginação rápida e escalável na UI.

## 🚀 Como funciona e o que precisa fazer

Você **não mexe** nesses arquivos manualmente. As camadas `backend/db/` gerenciam as deleções e adições a este arquivo.
Ao realizar Backup do CROM, esta é a única pasta que importa. Se o CROM reiniciar, ele fará o `sync.Once` montando exatamente os arquivos encontrados aqui. E svocê apagar o `global_index.db`, estará realizando um Reset Universal (Big Bang) no buscador.
