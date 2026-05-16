# CROM Frontend (React + Vite)

A interface de usuário (UI) premium do CROM Pesquisador, focada em Velocidade, Beleza (UI Glassmorphism e Dark Mode) e Soberania Digital.

## 📂 O que essa pasta deve ter?

Todo o ecossistema Client-Side: HTML, CSS (Tailwind), React Hooks, Componentes UI, Store (Zustand para estado), e lógicas de roteamento (`react-router-dom`). Esta camada não toca em banco de dados; ela APENAS consome a API HTTP rodando no Backend.

## 📄 Estrutura de Arquivos

*   **`src/components/`**: Peças de montar (Lego) do design.
    *   `ResultCard.tsx`: O cartão que exibe a resposta textual.
    *   `SearchBar.tsx`: O input de texto central.
    *   `ThemeToggle.tsx`: Troca entre claro/escuro.
*   **`src/pages/`**: As telas inteiras da aplicação.
    *   `SearchPage.tsx`: A tela que mostra e pagina os resultados (Imagens, Vídeos, Código). Responsável por gerenciar o Scroll Infinito usando referências.
    *   `AdminPage.tsx`: Painel de controle para aprovação de URLs sugeridas (via Token Seguro).
*   **`src/services/`**: Camada de consumo.
    *   `api.ts`: Funções TypeScript (Axios/Fetch) para contatar o backend (porta 8098).
*   **`src/stores/`**: Gerenciamento de Estado.
    *   Arquivos Zustand para salvar modo dark, tamanho de fonte, configurações locais no `localStorage` sem usar cookies de rastreamento.

## 🚀 Como funciona e o que precisa fazer

Construído via `npm run build` (Vite) na hora do deploy, ele vira um pacote estático `dist/` hospedado no NGINX na porta 80.
O frontend deve manter a fluidez de design a todo custo. Deve garantir que abas como "Notícias", "Imagens" e "Todos" operem sem gargalos, carregando a paginação dinâmica conforme o usuário desce (Scroll Observer) e tratar todas as imagens através do Proxy do Backend se possível, caso hajam erros de CSP (Content Security Policy).
