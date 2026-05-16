# CROM Database Layer (CRUD)

O cérebro de armazenamento do CROM Engine. Toda a comunicação com os bancos de dados SQLite locais passa por aqui.

## 📂 O que essa pasta deve ter?

Scripts, configurações, *migrations* e lógicas de CRUD (Create, Read, Update, Delete). Esta é a única camada autorizada a disparar código SQL.

## 📄 Descrição dos Arquivos

*   **`db.go`**: O Gerenciador de Conexões.
    *   **Como funciona:** Ele implementa o padrão *Singleton Connection Pool* (`sync.Once`) e os Pragmas do SQLite (como WAL Mode e Synchronous=NORMAL). 
    *   **O que precisa fazer:** Garantir que o `global_index.db` não entre em `SQLITE_BUSY` (Database locked) quando múltiplos crawlers tentam escrever centenas de dados simultaneamente. Ele enfileira e serializa as requisições (`SetMaxOpenConns(1)`).
*   **`crud.go`**: O Mapeador de Objetos (ORM "feito em casa").
    *   **Como funciona:** Possui funções de abstração como `IndexNode()`, `SuggestURL()`, e `BanDomain()`.
    *   **O que precisa fazer:** Validar e inserir dados massivos provindos do Crawler (nós de texto, imagens, vídeos, códigos), populando simultaneamente a tabela relacional `search_index` e o índice virtual nativo `search_fts` para proporcionar buscas Full-Text ultrarrápidas na API.

## 🚀 Como funciona e o que precisa fazer

Sempre que a estrutura do banco mudar (ex: adicionar uma nova coluna "autor" no índice), você deve modificar a string SQL de criação de tabelas em `db.go` (`CREATE TABLE IF NOT EXISTS...`) e adaptar o `IndexNode` em `crud.go` para inserir essa nova variável.
