# Kalebe Corretor — Site de imóveis à venda

Site e painel administrativo em Next.js para publicar imóveis à venda. O catálogo público é alimentado pelo MySQL e exibe somente os dados preenchidos no painel.

## Rotas principais

- `/` — página inicial
- `/imoveis` — catálogo com filtros
- `/imoveis/[slug]` — anúncio com fotos, vídeos e plantas
- `/imoveis/cidade/[cidade]` — landing SEO por cidade
- `/imoveis/cidade/[cidade]/[tipo]` — landing SEO por cidade e tipo
- `/imoveis/bairro/[cidade]/[bairro]` — landing SEO por bairro
- `/imoveis/condominio/[cidade]/[condominio]` — landing SEO por condomínio
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

### Armazenamento de fotos na Hostinger

A Hostinger publica cada versão do aplicativo dentro de `hbuilds/versions/<id>` e troca o link `hbuilds/current` a cada deploy. Por isso, as fotos não podem ser gravadas dentro da versão do aplicativo.

Configure `DIRETORIO_UPLOADS` no hPanel com o caminho absoluto da pasta `uploads` do domínio, fora de `hbuilds` e de `public_html`:

```env
DIRETORIO_UPLOADS=/home/USUARIO/domains/DOMINIO/uploads
```

O sistema também reconhece automaticamente quando está sendo executado dentro de `hbuilds` e usa `<raiz-do-dominio>/uploads`. Ao solicitar uma foto ausente, ele procura a mídia nas versões antigas ainda preservadas pela Hostinger e a copia para a pasta persistente. Essa recuperação depende de o deploy antigo ainda existir; arquivos já excluídos pela hospedagem precisam ser enviados novamente pelo painel.

## SEO e indexação

O site gera `sitemap.xml` e `robots.txt` dinamicamente.

### URLs indexáveis

- `/`, `/imoveis`, `/sobre`, `/contato`
- `/imoveis/[slug]` (imóveis publicados)
- `/imoveis/cidade/...` e `/imoveis/cidade/.../[tipo]` com imóveis disponíveis
- `/imoveis/bairro/...` e `/imoveis/condominio/...` com pelo menos 2 imóveis **disponíveis**

### URLs com `noindex`

- `/imoveis?...` (qualquer filtro ou ordenação) — `noindex, follow`, canonical em `/imoveis`
- bairros/condomínios com exatamente 1 imóvel disponível — página útil, mas `noindex`
- `/login`, `/primeiro-acesso`, `/painel`, `/favoritos` — `noindex, nofollow`

Os filtros do catálogo **não** são bloqueados no `robots.txt`, para o Google conseguir ler o `noindex`.

### Exemplos de landing pages

```text
/imoveis/cidade/sao-jose-do-rio-preto
/imoveis/cidade/sao-jose-do-rio-preto/casas
/imoveis/bairro/sao-jose-do-rio-preto/jardim-arroio
/imoveis/condominio/sao-jose-do-rio-preto/nome-do-condominio
```

### Google Search Console

Para verificação por meta tag, preencha no `.env`:

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=seu_codigo_aqui
```

Se a verificação for por DNS, a variável pode ficar vazia.

## Validação para produção

```bash
npm run lint
npm run build
npm start
```

O site impede a indexação do painel e aplica CSP com nonce e cabeçalhos de segurança. Cadastros, alterações e exclusões exigem uma sessão autorizada e uma requisição da própria origem.
