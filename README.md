# Kalebe Corretor — Site de imóveis à venda

Site e painel administrativo em Next.js para publicar imóveis à venda. O catálogo público é alimentado pelo MySQL e exibe somente os dados preenchidos no painel.

## Rotas principais

- `/` — página inicial
- `/imoveis` — catálogo com filtros
- `/imoveis/[slug]` — anúncio com fotos, vídeos e plantas
- `/sobre` e `/contato` — apresentação e atendimento
- `/favoritos` — imóveis salvos no navegador
- `/painel` — administração protegida

## Configuração

Copie `.env.example` para `.env` e preencha banco, sessão e diretório de mídia. A chave `sessao_secreta` deve ter pelo menos 32 caracteres. Em produção, `DIRETORIO_UPLOADS` deve apontar para armazenamento persistente e privado da aplicação; os arquivos públicos são entregues pela rota `/midias/imoveis/...`.

```bash
npm install
npm run banco:migrar
npm run dev
```

## Validação para produção

```bash
npm run lint
npm run build
npm start
```

O site gera `sitemap.xml` e `robots.txt`, impede a indexação do painel e aplica CSP com nonce e cabeçalhos de segurança. Cadastros, alterações e exclusões exigem uma sessão autorizada e uma requisição da própria origem.
