# Roadmap e Próximas Etapas (Backlog SRE)

A infraestrutura base está consolidada. Para convertermos o sistema atual em um Mínimo Produto Viável (MVP) produtivo, devemos atacar as seguintes etapas, estritamente nesta ordem:

## Etapa 1: A Ponte (Integração Frontend-Backend)
**Objetivo**: Remover as ilusões de dados do Frontend.
- [ ] No arquivo `frontend/src/services/api.ts`, deletar todas as lógicas de `setTimeout` e mocks estáticos.
- [ ] Implementar a função `getLinkDetail` usando `fetch("http://localhost:8080/api/link/...").
- [ ] Implementar a função `postComment` enviando um JSON válido para a API Go.
- [ ] Validar se o Frontend renderiza corretamente os dados puxados da base SQLite em tempo real.

## Etapa 2: O Motor de Busca (Global Index API)
**Objetivo**: Fazer a barra de pesquisa do React funcionar com links reais.
- [ ] Criar o banco de dados mestre no Go: `/data/index/global_index.db`.
- [ ] Toda vez que o Crawler coletar uma página, ele deve inserir uma cópia leve (URL + Título) nesse índice global.
- [ ] Modificar o endpoint `GET /api/search` (que atualmente devolve vazio) para realizar uma query SQL com a cláusula `LIKE %busca%` neste banco global.

## Etapa 3: Defesa Cibernética (LGPD e Rate Limiting)
**Objetivo**: Proteger o SQLite de ser inundado por ataques de DDoS de comentários.
- [ ] Adicionar um Middleware de Limite de Taxa (Rate Limiter) na rota `POST /api/link/:id/comment`.
- [ ] Regra sugerida: Limitar a 5 comentários por IP/Hash a cada 10 minutos. Retornar status HTTP `429 Too Many Requests`.

## Etapa 4: Expansão Neural do Crawler (Spider Mode)
**Objetivo**: Dar autonomia real ao robô de coleta.
- [ ] O Crawler atual só coleta a URL raiz (`--site`). Precisamos implementar a fila avançada (Breadth-First Search).
- [ ] Ele deve ler todos os `<a href>` da página, adicionar as URLs do mesmo domínio à fila na memória, e continuar rastreando recursivamente até o `--limit` ser alcançado.
