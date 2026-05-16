# CROM Crawler Targets

Este diretório contém os mapas de navegação, ou "Seeds" (Sementes), que ditam o rumo que o CROM Crawler vai seguir.

## 📂 O que essa pasta deve ter?

Exclusivamente arquivos JSON estruturados contendo listas de domínios base agrupados por nicho. A governança descentralizada do CROM pode enviar requisições de sites (sugestões da comunidade) que acabam virando alvos nestes arquivos.

## 📄 Arquivos Principais

*   **`brasil_top.json`**: Lista manual e higienizada com os maiores e mais vitais sites do Brasil (UOL, Globo, Inpe, Jusbrasil, Magalu, DIO). Serve para o "Core Crawler" manter a malha nacional sempre aquecida e fresca.
*   **`crom_network.json`**: Sites da aliança ou infraestrutura base CROM (CROMIA, Crom.chat, sites da Guardiões), varridos primeiro para prioridade de ecossistema.

## 🚀 Como funciona e o que precisa fazer

Ao rodar o crawler via terminal:
`go run crawler/main.go --config crawler/targets/brasil_top.json`
O código em Go lê este JSON, carrega todas as URLs e inicia o motor de raspagem em árvore, saltando de link em link respeitando o mesmo domínio. Para adicionar novas bolhas de conteúdo, basta criar um novo arquivo `.json` nesta pasta seguindo o mesmo padrão e acionar uma rotina de varredura no terminal.
