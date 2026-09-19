# Relatório final — implementação SEO

Especificação de origem: `foco-seo.md`  
Data: 2026-09-19

---

## 1. Arquivos criados

| Arquivo | Função |
|---|---|
| `src/lib/seo/slug.ts` | Normalização de slug + bloqueio de prefixos reservados |
| `src/lib/seo/metadata.ts` | Helpers de metadata, título/descrição de imóvel, paths SEO |
| `src/lib/seo/dados-estruturados.ts` | JSON-LD (WebSite, Organization, Person, BreadcrumbList, ItemList, RealEstateListing) |
| `src/dados/seo.ts` | Mapa centralizado de tipos (casas, apartamentos, etc.) e regra de thin content |
| `src/componentes/seo/DadosEstruturados.tsx` | Renderização segura de JSON-LD com nonce CSP |
| `src/componentes/seo/Breadcrumbs.tsx` | Breadcrumb visual reutilizável |
| `src/componentes/seo/PaginaListagemSeo.tsx` | Layout compartilhado das landings SEO |
| `src/componentes/seo/paginaListagemSeo.module.css` | Estilos das landings (padrão do site) |
| `src/app/imoveis/cidade/[cidade]/page.tsx` | Landing por cidade |
| `src/app/imoveis/cidade/[cidade]/[tipo]/page.tsx` | Landing cidade + tipo |
| `src/app/imoveis/bairro/[bairro]/page.tsx` | Landing por bairro |
| `src/app/imoveis/condominio/[condominio]/page.tsx` | Landing por condomínio |
| `SEO_IMPLEMENTACAO.md` | Este relatório |

---

## 2. Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `src/app/layout.tsx` | Removido canonical global `/`; template `| Kalebe`; OG/Twitter defaults; verificação GSC opcional; WebSite + Organization JSON-LD |
| `src/app/page.tsx` | Metadata própria da home; atalhos/cidades → URLs SEO; H1 ajustado; seção editorial; imagens sem `unoptimized` |
| `src/app/imoveis/page.tsx` | `generateMetadata` com `noindex` em filtros; ItemList; atalhos SEO |
| `src/app/imoveis/[slug]/page.tsx` | Title/description inteligentes; breadcrumbs com links; RealEstateListing melhorado; links cidade/bairro/condomínio |
| `src/app/sobre/page.tsx` | Metadata melhorada + schema Person |
| `src/app/contato/page.tsx` | Metadata melhorada |
| `src/app/sitemap.ts` | Inclui landings indexáveis; remove priority/changeFrequency artificiais |
| `src/lib/imoveis/publico.ts` | Funções SEO + ranking de similares |
| `src/lib/imoveis/midias.ts` | Identificadores `cidade`/`bairro`/`condominio` passam a `*-2` |
| `src/dados/imoveis.ts` | Reexporta novas funções |
| `src/dados/empresa.ts` | `regioes` com `href` limpo |
| `src/componentes/rodape/Rodape.tsx` | Links SEO + seção Localidades |
| `src/componentes/atalhosFinalidade/ListaRegioes.tsx` | Aponta para landings |
| `src/componentes/cardImovel/CardImovel.tsx` | Alt descritivo; Image Optimization ligado |
| `src/componentes/galeriaImovel/GaleriaImovel.tsx` | Removido `unoptimized` no público |
| `src/app/inicio.module.css` | Estilo da seção editorial |
| `src/componentes/rodape/rodape.module.css` | Grade com 4 colunas |
| `next.config.ts` | `images.formats: avif/webp` |
| `.env.example` | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` |
| `README.md` | Seção “SEO e indexação” |

**Não alterados (preservados):** painel, banco/migrations, autenticação, uploads/`DIRETORIO_UPLOADS`, favoritos, filtros, CSP/`proxy.ts`, `robots.ts` (já adequado), URLs `/imoveis/[slug]`.

---

## 3. Novas rotas

```text
/imoveis/cidade/[cidade]
/imoveis/cidade/[cidade]/[tipo]
/imoveis/bairro/[bairro]
/imoveis/condominio/[condominio]
```

Exemplos:

```text
/imoveis/cidade/sao-jose-do-rio-preto
/imoveis/cidade/sao-jose-do-rio-preto/casas
/imoveis/bairro/jardim-arroio
/imoveis/condominio/...
```

Rotas reservadas (`cidade`, `bairro`, `condominio`) não podem ser identificadores de anúncio novos.

---

## 4. Metadata

- **Home:** title absoluto `Corretor de Imóveis em São José do Rio Preto | Kalebe`, description, OG, Twitter, canonical `/`
- **Catálogo `/imoveis`:** title/description específicos; indexável sem query
- **Filtros `/imoveis?...`:** mesma canonical `/imoveis` + `noindex, follow`
- **Imóvel:** título gerado por tipo/quartos/bairro/cidade; description só com dados reais
- **Sobre / Contato:** titles descritivos + OG próprios
- **Landings:** metadata dinâmica por entidade
- **Template global:** `%s | Kalebe` (evita `Kalebe | Kalebe Corretor`)

---

## 5. Canonical

| URL | Canonical |
|---|---|
| `/` | `/` |
| `/imoveis` | `/imoveis` |
| `/imoveis?...` | `/imoveis` |
| `/sobre` | `/sobre` |
| `/contato` | `/contato` |
| `/imoveis/[slug]` | ela mesma |
| landings SEO | elas mesmas |

Canonical global `/` **removido** do layout.

---

## 6. Indexação

**Indexáveis**

- `/`, `/imoveis` (sem query), `/sobre`, `/contato`
- `/imoveis/[slug]` publicados
- cidade / cidade+tipo com ao menos 1 imóvel disponível
- bairro / condomínio com **≥ 2** imóveis publicados

**noindex, follow**

- `/imoveis?...` (qualquer filtro ou `ordem`)
- bairro/condomínio com exatamente 1 imóvel (página útil, fora do sitemap)

**noindex, nofollow** (já existia)

- `/login`, `/primeiro-acesso`, `/painel`, `/favoritos`

**404 (`notFound`)**

- cidade/tipo/bairro/condomínio inexistentes
- cidade+tipo sem resultados disponíveis
- bairro/condomínio sem imóveis publicados

---

## 7. Dados estruturados

| Schema | Onde |
|---|---|
| `WebSite` | layout global |
| `Organization` | layout global |
| `Person` | `/sobre` |
| `BreadcrumbList` | landings + imóvel |
| `ItemList` | `/imoveis` (sem filtro) + landings |
| `RealEstateListing` + `Offer` + `PostalAddress` | página do imóvel |

Disponibilidade do Offer: `InStock` / `LimitedAvailability` / `SoldOut` / `OutOfStock` conforme status. Endereço completo só se `exibirEnderecoExato`. JSON-LD escapa `<` e usa nonce CSP.

---

## 8. Sitemap

Entram (absolutos em `https://kalebecorretor.com.br`):

- `/`, `/imoveis`, `/sobre`, `/contato`
- imóveis publicados (`lastModified` = `atualizado_em`)
- cidades e cidade+tipo com imóveis disponíveis
- bairros/condomínios com ≥ 2 publicados

**Não entram:** query strings, login, painel, favoritos, api, landings vazias/thin.

---

## 9. Robots

`src/app/robots.ts` mantido:

- `Allow: /`
- `Disallow: /login`, `/primeiro-acesso`, `/painel`, `/api/`, `/favoritos`
- `Sitemap: https://kalebecorretor.com.br/sitemap.xml`

Filtros de `/imoveis` **não** são bloqueados no robots (precisam do `noindex` no HTML).

---

## 10. Links internos

- Home: casas/apartamentos/Rio Preto → landings limpas; cards de cidade → `/imoveis/cidade/...`
- Rodapé: Casas/Apartamentos + Localidades (Rio Preto, Mirassol, Bady Bassitt)
- `ListaRegioes`: hrefs SEO
- Página do imóvel: links clicáveis para cidade, bairro e condomínio
- Landings: links entre tipos/cidade e cards do catálogo
- Similares: prioridade bairro → tipo+cidade → cidade → tipo

---

## 11. Performance

- Removido `unoptimized` em home, cards e galeria pública (painel mantém)
- `next.config.ts`: `formats: ["image/avif", "image/webp"]`
- `priority` só no hero e nos 3 primeiros cards
- Landings e conteúdo SEO em Server Components
- Uploads/`DIRETORIO_UPLOADS` intactos

---

## 12. Testes

```text
npm run lint
→ exit 0 (eslint src --max-warnings=0)

npm run build
→ exit 0
→ Next.js 16.3.5 compilou; TypeScript ok
→ rotas SEO presentes no output do build
→ /sitemap.xml e /robots.txt gerados
```

---

## 13. Pontos que ainda dependem de ação externa

1. **Google Search Console** — cadastrar propriedade e (opcional) preencher `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` no `.env` de produção, ou verificar por DNS.
2. **Perfil da Empresa no Google** — não há endereço comercial no código; não foi inventado LocalBusiness com endereço falso.
3. **Avaliações reais** — nenhum schema de review/rating inventado.
4. **Backlinks / autoridade** — fora do escopo técnico do site.
5. **Conteúdo futuro** — landings crescem com o catálogo real; thin content continua bloqueado pela regra de ≥ 2 em bairro/condomínio.
6. **Imagem OG dedicada 1200×630** — hoje usa `/imagens/sobre/kalebe.webp` (arquivo real existente).
7. **Deploy Hostinger** — validar Image Optimization em produção com a rota `/midias/...` e volume persistente.

---

## Critérios de aceitação (checklist)

- [x] Home com metadata própria  
- [x] Sem canonical `/` global incorreto  
- [x] `/imoveis` indexável  
- [x] Filtros `noindex, follow` e funcionando  
- [x] URLs SEO limpas (cidade / tipo / bairro / condomínio)  
- [x] Sem páginas vazias em massa  
- [x] Imóvel em `/imoveis/[slug]` preservado  
- [x] Titles/descriptions de imóvel melhorados  
- [x] Canonicals corretos  
- [x] Breadcrumb visual + `BreadcrumbList`  
- [x] Structured data só com dados reais  
- [x] Sitemap com SEO e sem filtros  
- [x] Áreas privadas fora do Google  
- [x] Links home/rodapé para URLs limpas  
- [x] Linkagem cidade/bairro/condomínio  
- [x] Search Console preparado  
- [x] Imagens auditadas  
- [x] `npm run lint` e `npm run build` passando  
- [x] Painel, cadastro, uploads, segurança/CSP preservados  
