# CROM API Layer

Esta camada contém a lógica de roteamento e endpoints HTTP do CROM Pesquisador.

## 📂 O que essa pasta deve ter?

A pasta `api/` abriga os "Controladores" (Controllers) da aplicação. Ela recebe requisições da web (Frontend), entende o que foi pedido, fala com o banco de dados (`db/`) para resgatar os dados, empacota tudo em JSON e envia de volta ao cliente.

## 📄 Descrição dos Arquivos

*   **`api.go`**: O coração da API. 
    *   **Como funciona:** Ele inicializa as rotas HTTP (como `/search`, `/suggest`, `/admin/stats`, `/admin/action`). 
    *   **O que precisa fazer:** Receber os parâmetros de busca (`q=query&page=N`), consultar as tabelas FTS de páginas, imagens, vídeos e códigos através do `db`, unificar a resposta garantindo paginação individual por mídia, gerenciar o cache em memória (TTL de 5 min) para buscas rápidas, e validar autenticação para as rotas administrativas através do cabeçalho `Authorization`.

## 🚀 Como funciona e o que precisa fazer

Sempre que uma nova rota ou funcionalidade for criada para o frontend (exemplo: Favoritos, Sugestão de Sites, Banimento), a rota HTTP, o middleware de CORS e as validações JSON deverão ser implementados no `api.go`. A API é o escudo de segurança do sistema e nunca deve confiar no input do usuário sem devida sanitização de dados.
