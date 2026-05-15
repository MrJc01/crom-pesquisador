# Histórico e Visão do Projeto CROM

## A Visão Central
O objetivo principal é modernizar o **CROM Search Engine**, transformando-o de um protótipo em um motor de busca "Soberano", aderente aos princípios da Web3/Semantic Web, focado em alta escalabilidade, segurança e privacidade do usuário.

## Diretrizes Universais de Engenharia
Todas as ações no projeto CROM devem seguir o "Meta-Prompt do Orquestrador de Inteligência":
1. **Atuação Híbrida**: Simular mentalmente 200 especialistas (Arquitetura, QA, DevOps, Legal/LGPD) antes de qualquer tomada de decisão.
2. **Mentalidade SRE**: Abordar erros com uma estrutura de Diagnóstico em 4 camadas (Rede, Backend, Persistência, Ambiente).
3. **Mínima Fricção**: Todo o sistema deve ser executável localmente via CLI sem dependências pesadas de terceiros (ex: uso de SQLite Pure-Go).

## Decisões Históricas (Até Maio de 2026)
- **Migração do Frontend**: Substituição do HTML/JS legado por uma SPA em React + Vite + TailwindCSS.
- **O Conceito de "Node" (LinkDetailPage)**: Em vez de apenas redirecionar, o buscador agora permite "radiografar" os links (ver SSL, latência, OpenGraph e comentários) sem precisar visitar a página insegura.
- **LGPD by Design**: Os comentários não exigem cadastro. Eles utilizam um sistema de **Mascaramento e Hash Criptográfico (SHA-256)** do endereço IP TCP originário para manter o anonimato civil.
- **Isolamento de Banco de Dados**: Adoção do modelo "One-File-Per-Site", onde o Crawler cria um arquivo `.db` isolado para cada domínio (ex: `wikipedia.org.db`), garantindo portabilidade extrema.
