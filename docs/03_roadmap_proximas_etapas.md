# Roadmap e Próximas Etapas (Backlog SRE)

A infraestrutura base, o motor autônomo (Mente Mestra) e o painel Tático no terminal (CROM-OS) estão operacionais. O objetivo agora é focar em Escala Vertical e Governança do Ecossistema.

## Etapa 1: Clusterização e Resiliência (Scale-Out)
**Objetivo**: Distribuir a carga do robô.
- [ ] Mover a tabela `crawler_queue` de um SQLite local para um Redis ou Postgres caso o sistema exceda a capacidade de uma única máquina, permitindo múltiplos Crawlers em VPS distintas lendo a mesma Fila.
- [ ] Implementar integração do Backend com Docker Swarm/Dokploy para provisionamento horizontal fácil sob demanda de tráfego.

## Etapa 2: Aprimoramento Cognitivo (Oráculos Complexos)
**Objetivo**: Expandir o "Knowledge Panel".
- [ ] Conectar a API do OpenWeather (ou similar sem bloqueio) para entregar informações climáticas caso o usuário digite "clima em São Paulo".
- [ ] Injetar calculadora na própria barra de pesquisa (via Backend), interceptando operações matemáticas (`15 * 50`) e entregando a resposta no Oráculo.

## Etapa 3: Sistema de Reputação (Rankeamento Inteligente)
**Objetivo**: Tornar a Busca FTS5 imune a manipulação.
- [ ] Integrar o fator de pontuação `CromRank` no `ORDER BY` da busca. Páginas com HTTPS ganham +10 pontos, páginas com lentidão excessiva (-30 pontos), páginas com IPs limpos recebem bônus.
- [ ] Criar "Crawler de Verificação": Uma segunda etapa da Fila onde as páginas já raspadas são revisitadas mensalmente para detectar links quebrados (404), rebaixando o Rank delas no SQLite.

## Etapa 4: Moderador SRE Web UI
**Objetivo**: Visibilidade global web.
- [ ] Expor os relatórios de saúde gerados pelo `reports.sh` (e dashboard do `monitor.sh`) em uma aba oculta `/admin` no frontend React (Protegida por senha ou OAuth).
- [ ] Permitir a exclusão pontual de domínios (Banimento) direto por interface amigável.
