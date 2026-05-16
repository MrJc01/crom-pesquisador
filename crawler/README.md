# CROM Crawler Engine

O motor de coleta autônoma do CROM. Este é o robô que navega na "Rede Soberana" e alimenta o banco de dados.

## 📂 O que essa pasta deve ter?

Lógica de raspagem web, parseamento de HTML, identificação de mídia avançada (Imagens, Vídeos, Tags Meta, Códigos) e a orquestração do loop de rotina assíncrono.

## 📄 Descrição dos Arquivos

*   **`main.go`**: O cérebro do robô.
    *   **Como funciona:** Ele lê a flag `--config` (que carrega um arquivo JSON de `targets/`), levanta um exército de *goroutines* (Crawlers paralelos) seguindo as regras do Colly, e varre cada link extraído, respeitando `Robots.txt` e `Sitemaps`.
    *   **O que precisa fazer:** Ele abre uma página HTML, limpa o lixo (CSS, Scripts), identifica o tipo de nó (página normal, imagem de alta resolução, snippet de código ou iFrame/Vídeo), empacota esses metadados num objeto estruturado e envia silenciosamente para `backend/db/crud.go` para ser indexado no SQLite.
*   **`targets/`**: (Subdiretório). Contém arquivos `.json` classificados por nichos (ex: `brasil_top.json`, `crom_network.json`) listando as "sementes" (URLs base) por onde o Crawler vai começar a explorar.

## 🚀 Como funciona e o que precisa fazer

O crawler NUNCA para em produção. Ele roda continuamente puxando listas em *loop* ou executando scripts batch.
**Desafio principal:** Escapar de *Bot Protections* (Cloudflare/Akamai) enviando headers humanizados (User-Agents, Accept-Language), respeitar limites éticos para não derrubar os servidores alvos (implementando *Random Delays*) e não corromper o banco de dados ao salvar 5.000 nós por minuto (resolvido pela camada `backend/db`).
