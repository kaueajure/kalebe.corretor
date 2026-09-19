# IMPLEMENTAÇÃO COMPLETA DE SEO — KALEBE CORRETOR

Repositório:

`https://github.com/kaueajure/kalebe.corretor`

## OBJETIVO

Quero transformar o site atual do **Kalebe Corretor** em um site realmente preparado para aquisição orgânica pelo Google, principalmente para pesquisas relacionadas a:

* corretor de imóveis em São José do Rio Preto;
* corretor em Rio Preto;
* imóveis à venda em São José do Rio Preto;
* imóveis em Rio Preto;
* casas à venda em Rio Preto;
* apartamentos à venda em Rio Preto;
* terrenos à venda em Rio Preto;
* sobrados à venda em Rio Preto;
* imóveis em Mirassol;
* imóveis em Bady Bassitt;
* casas em bairros específicos;
* apartamentos em bairros específicos;
* imóveis em condomínios específicos;
* imóveis com determinada quantidade de quartos;
* nome do corretor;
* nome dos imóveis cadastrados;
* pesquisas long-tail relacionadas ao catálogo.

O objetivo NÃO é fazer keyword stuffing, criar páginas artificiais em massa ou tentar manipular o Google.

O objetivo é implementar uma arquitetura profissional de SEO técnico + SEO local + SEO programático controlado, utilizando o conteúdo real do catálogo.

---

# REGRA PRINCIPAL

ANTES DE ALTERAR QUALQUER COISA:

1. Analise completamente a implementação atual.
2. Confirme os arquivos, funções e arquitetura existentes.
3. Não recrie sistemas que já existem.
4. Preserve:

   * painel administrativo;
   * banco MySQL;
   * cadastro de imóveis;
   * uploads;
   * autenticação;
   * favoritos;
   * URLs atuais de imóveis;
   * filtros;
   * componentes visuais;
   * segurança atual;
   * CSP;
   * proxy;
   * funcionamento da hospedagem Hostinger.
5. Faça alterações incrementais.
6. Não altere o design geral do site sem necessidade.
7. Não remova funcionalidades existentes em nome de SEO.
8. `npm run lint` e `npm run build` precisam continuar funcionando ao final.

NÃO faça uma reescrita geral do projeto.

---

# ESTADO ATUAL QUE DEVE SER CONSIDERADO

O projeto usa:

* Next.js 16;
* App Router;
* React 19;
* TypeScript;
* MySQL;
* `src/app`;
* catálogo carregado a partir do banco;
* rota de imóvel:
  `/imoveis/[slug]`;
* sitemap dinâmico;
* robots dinâmico;
* metadata usando API nativa do Next.js;
* páginas públicas renderizadas no servidor.

Já existem:

`src/app/layout.tsx`

`src/app/robots.ts`

`src/app/sitemap.ts`

`src/app/page.tsx`

`src/app/imoveis/page.tsx`

`src/app/imoveis/[slug]/page.tsx`

`src/app/sobre/page.tsx`

`src/app/contato/page.tsx`

`src/dados/empresa.ts`

`src/dados/imoveis.ts`

`src/lib/imoveis/publico.ts`

Também já existe JSON-LD `RealEstateListing` nas páginas de imóveis.

NÃO remover isso simplesmente. Melhorar onde necessário.

---

# PROBLEMA ATUAL Nº 1 — CANONICAL GLOBAL

Atualmente `src/app/layout.tsx` possui algo equivalente a:

```ts
alternates: {
  canonical: "/",
}
```

Isso NÃO deve permanecer no layout global.

## Alteração obrigatória

Remover:

```ts
alternates: { canonical: "/" }
```

do metadata global.

Cada página indexável deve declarar explicitamente seu próprio canonical.

O `metadataBase` deve continuar sendo:

```ts
metadataBase: new URL("https://kalebecorretor.com.br")
```

---

# HOME PAGE — METADATA PRÓPRIA

Adicionar metadata explícita para a home.

Pode ser diretamente em:

`src/app/page.tsx`

ou através da estrutura mais apropriada do App Router, desde que não transforme a página desnecessariamente em Client Component.

Usar aproximadamente:

## Title

`Corretor de Imóveis em São José do Rio Preto | Kalebe`

## Description

Algo natural aproximadamente nesta linha:

`Encontre casas, apartamentos, sobrados e terrenos à venda em São José do Rio Preto, Mirassol e Bady Bassitt. Atendimento direto com Kalebe, corretor CRECI-SP 322829 F.`

Não ultrapassar desnecessariamente o tamanho normal de description.

Adicionar:

```ts
alternates: {
  canonical: "/",
}
```

Adicionar Open Graph próprio.

Adicionar Twitter Card.

Utilizar uma imagem REAL já existente no projeto para Open Graph enquanto não existir um arquivo específico 1200x630.

Não inventar caminhos para arquivos inexistentes.

---

# PROBLEMA ATUAL Nº 2 — FILTROS NÃO DEVEM VIRAR PÁGINAS SEO

Hoje existem URLs como:

`/imoveis?tipo=casa`

`/imoveis?tipo=apartamento`

`/imoveis?cidade=São José do Rio Preto`

`/imoveis?bairro=...`

Essas URLs devem continuar funcionando normalmente para navegação e filtros.

Entretanto, NÃO quero que o Google tente indexar infinitas combinações como:

`?tipo=casa&quartos=3&precoMin=500000&...`

Isso gera risco de duplicidade e crawl desnecessário.

## Implementação

Transformar a metadata de:

`src/app/imoveis/page.tsx`

em metadata dinâmica utilizando `generateMetadata`, levando em consideração `searchParams`.

### Quando NÃO houver filtros

URL:

`/imoveis`

deve ser:

```text
index, follow
```

Canonical:

`/imoveis`

Title aproximadamente:

`Imóveis à Venda em São José do Rio Preto e Região`

Description específica.

### Quando houver QUALQUER filtro ou ordenação

Exemplos:

`?tipo=`

`?cidade=`

`?bairro=`

`?quartos=`

`?banheiros=`

`?vagas=`

`?precoMin=`

`?precoMax=`

`?areaMin=`

`?busca=`

`?ordem=`

deve retornar metadata:

```ts
robots: {
  index: false,
  follow: true,
}
```

E canonical:

`/imoveis`

IMPORTANTE:

NÃO bloquear essas URLs no `robots.txt`.

O Google precisa conseguir acessá-las para enxergar o `noindex`.

---

# NOVA ARQUITETURA DE LANDING PAGES SEO

Não criar páginas SEO através dos query parameters.

Criar URLs limpas específicas.

## MUITO IMPORTANTE SOBRE O ROTEAMENTO

Já existe:

`/imoveis/[slug]`

NÃO criar:

`/imoveis/[cidade]`

pois isso entra em conflito conceitual/estrutural com o `[slug]` dos imóveis.

Utilizar prefixos fixos.

Criar a seguinte arquitetura:

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

/imoveis/cidade/sao-jose-do-rio-preto/apartamentos

/imoveis/cidade/sao-jose-do-rio-preto/terrenos

/imoveis/cidade/sao-jose-do-rio-preto/sobrados

/imoveis/cidade/mirassol

/imoveis/cidade/bady-bassitt

/imoveis/bairro/jardim-arroio

/imoveis/bairro/sao-thomas

/imoveis/condominio/nome-do-condominio
```

NÃO modificar a URL atual dos anúncios:

`/imoveis/[slug]`

Ela já pode ter sido compartilhada ou indexada.

---

# SLUG SEO

Criar uma função reutilizável de normalização de slug.

Sugestão de arquivo:

`src/lib/seo/slug.ts`

Ela deve:

* converter para lowercase;
* remover acentos;
* converter espaços em `-`;
* remover caracteres inadequados;
* evitar `--`;
* remover hífens no começo/final;
* manter apenas caracteres seguros de URL.

Exemplo:

```text
São José do Rio Preto
→ sao-jose-do-rio-preto

Jardim São Thomas
→ jardim-sao-thomas
```

NÃO depender de uma biblioteca pesada somente para isso.

---

# RESERVAR PREFIXOS DE ROTA

Como existirão rotas estáticas dentro de `/imoveis`, considerar reservados os seguintes identificadores:

```text
cidade
bairro
condominio
```

Verificar o código responsável por criar `identificador` dos imóveis.

Atualmente o identificador é criado durante o cadastro.

Garantir que um anúncio NÃO possa receber exatamente:

```text
cidade
bairro
condominio
```

como identificador.

Se o slug base resultar em um reservado, adicionar um sufixo seguro.

Exemplo:

```text
cidade
→ cidade-2
```

Não alterar identificadores já existentes.

---

# CAMADA DE DADOS SEO

Expandir:

`src/lib/imoveis/publico.ts`

e:

`src/dados/imoveis.ts`

com funções apropriadas para SEO.

Não fazer SQL duplicado desnecessário.

Criar funções como:

```ts
listarImoveisPorCidade(...)
listarImoveisPorCidadeETipo(...)
listarImoveisPorBairro(...)
listarImoveisPorCondominio(...)
listarCidadesComImoveis(...)
listarBairrosComImoveis(...)
listarCondominiosComImoveis(...)
```

Os nomes podem ser adaptados ao padrão existente em português, mas precisam continuar claros.

Somente considerar imóveis:

```sql
situacao = 'PUBLICADO'
```

Aplicar as mesmas regras públicas existentes.

Não expor rascunhos.

---

# TIPOS DE IMÓVEL

Criar uma configuração SEO centralizada.

Sugestão:

`src/dados/seo.ts`

Mapear:

```text
casa → casas
apartamento → apartamentos
terreno → terrenos
sobrado → sobrados
comercial → imoveis-comerciais
```

Essa configuração deve possuir informações suficientes para gerar:

* slug;
* singular;
* plural;
* título SEO;
* texto natural.

Exemplo conceitual:

```ts
{
  tipo: "casa",
  slug: "casas",
  singular: "Casa",
  plural: "Casas",
}
```

Não espalhar esses mapeamentos por diversos componentes.

---

# PÁGINA SEO DE CIDADE

Criar:

`src/app/imoveis/cidade/[cidade]/page.tsx`

A página deve:

1. resolver o slug;
2. identificar a cidade real;
3. retornar `notFound()` para cidade inexistente;
4. carregar somente imóveis publicados daquela cidade;
5. renderizar Server Component;
6. ter H1 único;
7. possuir metadata própria;
8. possuir canonical próprio;
9. possuir breadcrumbs;
10. possuir dados estruturados;
11. listar imóveis;
12. criar links internos para tipos de imóvel daquela cidade;
13. conter conteúdo útil sobre a busca;
14. não parecer uma página criada apenas para SEO.

Exemplo para São José do Rio Preto:

## URL

`/imoveis/cidade/sao-jose-do-rio-preto`

## Title

`Imóveis à Venda em São José do Rio Preto | Kalebe`

## H1

`Imóveis à venda em São José do Rio Preto`

## Description

Gerar uma description natural citando casas, apartamentos, terrenos etc.

## Conteúdo

A página deve explicar de forma curta e útil que existem imóveis disponíveis naquela cidade e permitir navegar pelas categorias.

Não escrever um artigo genérico gigante.

O foco é catálogo + utilidade.

---

# PÁGINA SEO CIDADE + TIPO

Criar:

`src/app/imoveis/cidade/[cidade]/[tipo]/page.tsx`

Exemplos:

`/imoveis/cidade/sao-jose-do-rio-preto/casas`

`/imoveis/cidade/sao-jose-do-rio-preto/apartamentos`

`/imoveis/cidade/sao-jose-do-rio-preto/terrenos`

Metadata deve variar conforme cidade e tipo.

Exemplo:

## Title

`Casas à Venda em São José do Rio Preto | Kalebe`

## H1

`Casas à venda em São José do Rio Preto`

## Description

Algo como:

`Veja casas à venda em São José do Rio Preto com fotos, valores, localização e informações completas. Fale diretamente com Kalebe Corretor.`

Não utilizar exatamente o mesmo texto em todas as páginas apenas substituindo uma palavra.

Criar templates naturais diferentes quando necessário.

---

# PÁGINAS DE BAIRRO

Criar:

`src/app/imoveis/bairro/[bairro]/page.tsx`

Resolver o bairro utilizando os dados reais existentes no banco.

Não inventar bairros.

Exemplo:

`/imoveis/bairro/jardim-arroio`

Metadata:

`Imóveis à Venda no Jardim Arroio, Rio Preto | Kalebe`

H1:

`Imóveis à venda no Jardim Arroio`

Mostrar:

* quantidade disponível;
* imóveis;
* tipos disponíveis;
* cidade;
* links para cidade;
* links para imóveis individuais.

## Regra contra thin content

Não criar milhares de páginas vazias.

Uma página de bairro somente deve ser indexável quando existir conteúdo real suficiente.

Implementar uma regra objetiva.

Sugestão inicial:

* se houver pelo menos 2 imóveis publicados relacionados ao bairro: `index, follow`;
* se houver apenas 1: a página pode funcionar para o usuário, mas marcar `noindex, follow`;
* se não houver nenhum: retornar `notFound()`.

Se durante a análise do catálogo atual uma regra ligeiramente diferente fizer mais sentido, documentar a decisão.

O sitemap deve conter somente páginas indexáveis.

---

# CONDOMÍNIOS

Criar:

`src/app/imoveis/condominio/[condominio]/page.tsx`

Utilizar:

`nome_condominio`

do banco.

Mesma lógica das páginas de bairro.

Exemplo:

```text
/imoveis/condominio/damha-1
```

Somente criar página indexável quando houver dados reais.

Nunca inventar condomínio.

---

# CIDADES PRINCIPAIS

As seguintes cidades são áreas de atendimento já definidas:

```text
São José do Rio Preto
Mirassol
Bady Bassitt
```

Elas estão em:

`src/dados/empresa.ts`

Manter isso centralizado.

Evitar duplicar nomes manualmente em vários arquivos.

---

# REGIOES EXISTENTES

Atualmente existe algo semelhante a:

```ts
export const regioes = [
  { nome: "São José do Rio Preto", slug: "sao-jose-do-rio-preto" },
  { nome: "Mirassol", slug: "mirassol" },
  { nome: "Bady Bassitt", slug: "bady-bassitt" },
  { nome: "Jardim Arroio", slug: "jardim-arroio", bairro: true },
  { nome: "São Thomas", slug: "sao-thomas", bairro: true },
  { nome: "Região Norte", slug: "regiao-norte", bairro: true },
];
```

E existe:

`ListaRegioes.tsx`

Hoje isso aponta para filtros.

Atualizar esse sistema para apontar para as novas landing pages SEO quando houver uma página limpa correspondente.

Não excluir a configuração sem analisar quem depende dela.

---

# LINKS DA HOME

Em:

`src/app/page.tsx`

substituir links SEO principais.

Hoje existe aproximadamente:

```text
/imoveis?tipo=casa
/imoveis?tipo=apartamento
/imoveis?cidade=São José do Rio Preto
```

Alterar os atalhos fixos principais para URLs limpas.

Exemplo:

```text
/imoveis/cidade/sao-jose-do-rio-preto/casas
/imoveis/cidade/sao-jose-do-rio-preto/apartamentos
/imoveis/cidade/sao-jose-do-rio-preto
```

Para cards das cidades:

São José do Rio Preto:

`/imoveis/cidade/sao-jose-do-rio-preto`

Mirassol:

`/imoveis/cidade/mirassol`

Bady Bassitt:

`/imoveis/cidade/bady-bassitt`

Os filtros do catálogo devem continuar funcionando.

---

# RODAPÉ

Atualizar:

`src/componentes/rodape/Rodape.tsx`

Os links:

`Casas`

`Apartamentos`

devem passar a apontar para páginas SEO limpas.

Adicionar uma seção pequena de localidades relevantes, sem transformar o footer em uma lista gigantesca de keywords.

Exemplo:

```text
Imóveis em Rio Preto
Imóveis em Mirassol
Imóveis em Bady Bassitt
```

Usar links reais.

---

# CABEÇALHO

Não precisa encher o cabeçalho com páginas SEO.

Preservar a navegação principal atual.

Não prejudicar UX.

---

# BREADCRUMBS

Criar breadcrumbs consistentes.

Exemplo página de cidade:

```text
Início
/
Imóveis
/
São José do Rio Preto
```

Cidade + tipo:

```text
Início
/
Imóveis
/
São José do Rio Preto
/
Casas
```

Bairro:

```text
Início
/
Imóveis
/
São José do Rio Preto
/
Jardim Arroio
```

Imóvel:

```text
Início
/
Imóveis
/
São José do Rio Preto
/
Casa...
```

O breadcrumb visual existente nos imóveis pode ser melhorado.

---

# STRUCTURED DATA — BREADCRUMBLIST

Criar JSON-LD `BreadcrumbList`.

Preferencialmente criar helper reutilizável.

Sugestão:

`src/lib/seo/dados-estruturados.ts`

ou estrutura semelhante.

Não copiar JSON-LD manualmente em 10 páginas.

---

# STRUCTURED DATA DO CORRETOR

Atualmente o site tem schema do imóvel, mas falta informação estruturada sobre o profissional/site.

Criar schema apropriado.

Informações reais disponíveis:

```text
Nome: Kalebe Corretor
Nome: Kalebe
CRECI-SP 322829 F
Cidade: São José do Rio Preto
Estado: SP
Telefone: (17) 99253-7365
Site: https://kalebecorretor.com.br
Área atendida:
- São José do Rio Preto
- Mirassol
- Bady Bassitt
```

Não inventar endereço.

Não inventar e-mail.

Não inventar redes sociais.

Não inventar avaliações.

Não inventar latitude/longitude.

Como atualmente não há um endereço comercial público cadastrado em `empresa.ts`, não fabricar um `LocalBusiness` completo com endereço falso.

Utilizar tipos Schema.org compatíveis com os dados reais, como `Person` e/ou `Organization`, conforme fizer mais sentido.

Pode indicar:

```text
jobTitle: Corretor de imóveis
telephone
url
areaServed
identifier / credential relacionado ao CRECI
```

Somente utilizar propriedades válidas semanticamente.

---

# ESTRUTURAR DADOS DO SITE

Adicionar também dados estruturados básicos do site quando apropriado:

`WebSite`

com:

```text
name
url
inLanguage
publisher
```

Não adicionar `SearchAction` apenas para tentar obter um recurso que o Google não utiliza mais.

---

# PÁGINA DE IMÓVEL — MELHORAR METADATA

Arquivo:

`src/app/imoveis/[slug]/page.tsx`

Hoje o title é basicamente:

```ts
title: imovel.titulo
```

e a description usa:

```text
título + localização + preço
```

Melhorar bastante.

Criar funções centralizadas para geração de SEO.

Exemplo:

Uma casa:

```text
Casa com 3 Quartos à Venda no Jardim Yolanda, Rio Preto | Kalebe
```

Apartamento:

```text
Apartamento com 2 Quartos à Venda na Redentora, Rio Preto | Kalebe
```

Terreno:

```text
Terreno à Venda no Jardim X, São José do Rio Preto | Kalebe
```

Utilizar quando existirem:

* tipo;
* quartos;
* bairro;
* cidade.

Não criar title gigantesco.

Se não houver algum dado, gerar uma variação válida.

Exemplo sem quartos:

`Casa à Venda no Jardim X, Rio Preto | Kalebe`

## Description do imóvel

Gerar a partir dos dados reais.

Exemplo:

`Casa à venda no Jardim Yolanda, São José do Rio Preto, com 3 quartos, 2 suítes, 4 vagas e 180 m². Veja fotos, valor e fale com Kalebe Corretor.`

Somente citar:

* suítes;
* vagas;
* metragem;
* preço;
* financiamento;

se o dado realmente existir.

Nunca escrever `undefined`, `null`, `0 quartos` etc.

---

# OPEN GRAPH DO IMÓVEL

Manter Open Graph.

Garantir:

```text
title
description
url
images
siteName
locale pt_BR
```

Se houver foto principal, usá-la.

Não duplicar URLs inconsistentes.

---

# REAL ESTATE LISTING

Manter o JSON-LD existente:

`RealEstateListing`

Melhorá-lo se necessário.

Validar:

```text
name
description
url
datePosted
dateModified
image
offers
address
```

Nunca inventar endereço exato quando:

`exibirEnderecoExato = false`

Se o endereço completo estiver oculto, continuar fornecendo somente cidade/estado e informações que já são públicas.

---

# STATUS DO IMÓVEL

Para disponibilidade:

```text
disponivel → InStock
```

Para vendido/indisponível/reservado/em negociação, escolher propriedade coerente com Schema.org.

Não marcar imóvel vendido como disponível.

Não excluir automaticamente páginas vendidas que já podem ter sido indexadas.

Manter URL 200 enquanto o anúncio continuar publicado no sistema, mostrando claramente o status.

---

# ITEMLIST NO CATÁLOGO

Adicionar dados estruturados `ItemList` nas páginas de listagem indexáveis:

* `/imoveis`;
* cidade;
* cidade + tipo;
* bairro;
* condomínio.

Cada item deve apontar para:

`/imoveis/[slug]`

Não colocar dados falsos.

---

# SITEMAP

Refatorar:

`src/app/sitemap.ts`

Manter:

```text
/
/imoveis
/sobre
/contato
/imoveis/[slug]
```

Adicionar:

```text
/imoveis/cidade/[cidade]

/imoveis/cidade/[cidade]/[tipo]

/imoveis/bairro/[bairro]

/imoveis/condominio/[condominio]
```

SOMENTE adicionar páginas indexáveis.

Nunca adicionar URLs com query string.

Nunca adicionar:

```text
/login
/painel
/primeiro-acesso
/favoritos
/api
```

Para imóveis:

usar `atualizado_em` como `lastModified`.

Para páginas baseadas em conjuntos de imóveis, se possível usar a atualização mais recente dos imóveis daquela landing page.

Não utilizar `new Date()` simplesmente para fingir que páginas foram atualizadas.

Pode remover `priority` e `changeFrequency` se não houver valor real em mantê-los.

A prioridade é gerar sitemap correto e confiável.

---

# ROBOTS.TXT

Manter:

`src/app/robots.ts`

Continuar permitindo:

```text
/
```

Continuar bloqueando áreas administrativas.

Algo equivalente a:

```text
/login
/primeiro-acesso
/painel
/api/
```

`/favoritos` pode continuar fora de indexação.

IMPORTANTE:

não bloquear URLs filtradas de `/imoveis`.

Elas devem ser acessíveis ao crawler para receber `noindex`.

Manter:

```text
Sitemap: https://kalebecorretor.com.br/sitemap.xml
```

---

# SOBRE

Melhorar metadata de:

`src/app/sobre/page.tsx`

Title atual como `"O corretor"` é pouco descritivo.

Usar aproximadamente:

`Kalebe | Corretor de Imóveis em São José do Rio Preto`

Description natural com CRECI e área atendida.

Canonical:

`/sobre`

Open Graph próprio.

Adicionar Person structured data nessa página se essa for a localização mais semanticamente correta.

---

# CONTATO

Melhorar:

`src/app/contato/page.tsx`

Title:

`Contato | Kalebe Corretor de Imóveis em Rio Preto`

ou variação melhor dentro do limite razoável.

Description específica.

Canonical:

`/contato`

Open Graph.

Não indexar telefone em lugares desnecessários, mas o telefone público atual pode permanecer.

---

# PÁGINAS ADMINISTRATIVAS

Confirmar `noindex, nofollow` em:

```text
/login
/primeiro-acesso
/painel
/favoritos
```

Se `/primeiro-acesso` ainda não possuir metadata noindex própria, adicionar.

Não depender apenas do `robots.txt`.

---

# SEARCH CONSOLE — VERIFICAÇÃO

Preparar o projeto para aceitar verificação do Google Search Console sem hardcode.

Adicionar variável opcional no `.env.example`:

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

No metadata global, adicionar `verification.google` SOMENTE quando a variável estiver preenchida.

Não produzir:

```html
<meta ... content="undefined">
```

Se a verificação do domínio estiver sendo feita por DNS, isso continuará opcional.

Documentar no README.

---

# OPEN GRAPH / SOCIAL

Adicionar defaults globais coerentes:

```text
siteName
locale: pt_BR
type
```

Mas permitir que páginas substituam:

```text
title
description
url
images
```

Não deixar a home como `url` de Open Graph de todas as páginas.

Cada página precisa ter sua URL correspondente.

---

# TWITTER CARD

Adicionar:

```ts
twitter: {
  card: "summary_large_image",
  ...
}
```

onde apropriado.

Mesmo que não exista conta do Twitter/X.

Não inventar `creator`.

---

# LINKAGEM INTERNA

Melhorar a malha interna do site.

Cada imóvel deve possuir links clicáveis quando possível para:

* cidade;
* bairro;
* condomínio.

Exemplo em uma página:

`Jardim Yolanda, São José do Rio Preto - SP`

deve permitir:

`Jardim Yolanda`
→ landing de bairro.

`São José do Rio Preto`
→ landing de cidade.

Se existir condomínio:

`Damha`
→ landing de condomínio.

Não transformar todo texto em dezenas de links.

Usar de forma natural.

---

# IMÓVEIS SEMELHANTES

Melhorar a lógica sem prejudicar o sistema.

Prioridade para similares:

1. mesmo bairro;
2. mesmo tipo + mesma cidade;
3. mesma cidade;
4. mesmo tipo.

Continuar limitando a quantidade.

Isso também melhora linkagem interna temática.

---

# HOME — CONTEÚDO SEO

A home já possui H1:

`Encontre um imóvel em Rio Preto e região.`

Pode ser mantido ou ajustado para algo ligeiramente mais descritivo.

Exemplo:

`Imóveis à venda em São José do Rio Preto e região`

Porém preservar o tom comercial e visual atual.

Adicionar abaixo das áreas principais uma pequena seção editorial útil.

Exemplo de H2:

`Imóveis em São José do Rio Preto e região`

Com aproximadamente 2 ou 3 parágrafos curtos explicando:

* atendimento em Rio Preto;
* Mirassol;
* Bady Bassitt;
* casas;
* apartamentos;
* terrenos;
* atendimento direto com o corretor.

NÃO criar bloco enorme repetindo palavras.

NÃO escrever conteúdo artificial.

---

# HIERARQUIA DE HEADINGS

Auditar todas as páginas públicas.

Cada página deve possuir exatamente um H1 principal em contexto normal.

H2 para seções.

H3 dentro de cards/subseções quando apropriado.

Não usar headings apenas para estilo visual.

---

# IMAGENS

Auditar especialmente:

`src/app/page.tsx`

`src/componentes/cardImovel/CardImovel.tsx`

e galeria.

Atualmente existem imagens com:

```tsx
unoptimized
```

Não assumir automaticamente que precisa permanecer.

Testar o funcionamento com o Image Optimization do Next.

Se as imagens locais servidas por `/midias/...` funcionarem corretamente pelo otimizador:

remover `unoptimized`.

Configurar em:

`next.config.ts`

quando necessário:

```ts
images: {
  formats: ["image/avif", "image/webp"],
}
```

Não quebrar o armazenamento persistente atual da Hostinger.

Não mover uploads para dentro do build.

Preservar a lógica atual de:

`DIRETORIO_UPLOADS`.

---

# IMAGEM PRINCIPAL / LCP

A imagem principal da home pode continuar com `priority` se for realmente LCP.

Nos cards:

somente os primeiros imóveis acima da dobra devem usar prioridade.

Os demais devem fazer lazy loading padrão.

Não marcar 20 imagens como priority.

Manter `sizes` corretos.

Garantir atributos/estrutura que evitem CLS.

---

# ALT TEXT

Continuar utilizando descrições reais quando disponíveis.

Prioridade:

```text
midia.descricao
```

Fallback pode ser algo como:

```text
Casa à venda no Jardim X em São José do Rio Preto
```

quando os dados existirem.

Não usar:

```text
imagem
foto
foto1
SEO casa comprar Rio Preto
```

Não colocar keyword stuffing em `alt`.

---

# PERFORMANCE

Não sacrificar UX para SEO.

Auditar:

* LCP;
* imagens;
* quantidade de JS enviado;
* Client Components desnecessários;
* `use client`;
* fontes;
* CLS;
* carregamento das fotos.

Não transformar páginas SEO em Client Components.

Filtros interativos podem continuar client-side onde necessário.

Conteúdo SEO deve estar presente no HTML renderizado pelo servidor.

---

# COMPONENTES SEO REUTILIZÁVEIS

Evitar duplicação.

Pode criar uma estrutura semelhante a:

```text
src/lib/seo/
  slug.ts
  metadata.ts
  dados-estruturados.ts
```

E componentes quando necessário:

```text
src/componentes/seo/
  DadosEstruturados.tsx
  Breadcrumbs.tsx
```

Não criar abstrações exageradas.

---

# SEGURANÇA DO JSON-LD

Ao renderizar JSON-LD, manter proteção semelhante à já existente:

```ts
JSON.stringify(dados).replace(/</g, "\\u003c")
```

Não introduzir XSS através de campos cadastrados no painel.

---

# CANONICAL DE TODAS AS PÁGINAS

Auditar explicitamente:

```text
/
→ /

/imoveis
→ /imoveis

/sobre
→ /sobre

/contato
→ /contato

/imoveis/[slug]
→ /imoveis/[slug]

/imoveis/cidade/sao-jose-do-rio-preto
→ ela mesma

/imoveis/cidade/sao-jose-do-rio-preto/casas
→ ela mesma

/imoveis/bairro/x
→ ela mesma

/imoveis/condominio/x
→ ela mesma
```

URLs de filtro:

```text
/imoveis?... 
```

canonical:

```text
/imoveis
```

e:

```text
noindex, follow
```

---

# NÃO CRIAR TAG META KEYWORDS

Não adicionar:

```html
<meta name="keywords">
```

Não é necessário.

Não fazer sistema de keywords artificiais.

---

# NÃO FAZER KEYWORD STUFFING

Não repetir frases como:

```text
corretor rio preto corretor imóveis rio preto imóveis rio preto
```

Textos precisam ser naturais.

SEO deve vir principalmente de:

* arquitetura;
* conteúdo;
* titles;
* headings;
* entidades;
* localização;
* linkagem interna;
* páginas específicas;
* catálogo real.

---

# LINKS EXTERNOS

Preservar WhatsApp e telefone.

Não adicionar links artificiais de backlinks.

Não inventar parceiros.

---

# README

Atualizar `README.md`.

Adicionar seção:

`SEO e indexação`

Documentar:

* sitemap;
* robots;
* landing pages;
* URLs SEO;
* Search Console;
* variável de verificação;
* política de páginas filtradas;
* páginas `noindex`.

Adicionar exemplos.

---

# NÃO ALTERAR BANCO SEM NECESSIDADE

Nesta etapa, NÃO criar colunas como:

```text
seo_title
seo_description
keywords
```

Os imóveis já possuem informações suficientes para gerar metadata de maneira inteligente.

Somente criar migration se surgir uma necessidade técnica objetiva e inevitável.

Não criar migration apenas porque "SEO costuma ter campos".

---

# SEO LOCAL

A aplicação deve reforçar consistentemente a entidade:

```text
Kalebe Corretor
Corretor de imóveis
São José do Rio Preto - SP
CRECI-SP 322829 F
```

Mas de forma natural.

Manter consistência de:

* nome;
* telefone;
* cidade;
* CRECI.

Não inventar endereço comercial.

---

# CONTEÚDO DAS LANDING PAGES

As páginas SEO NÃO devem ser somente:

```text
H1
grade de imóveis
```

Adicionar conteúdo curto e útil antes ou depois do catálogo.

Exemplo para cidade:

```text
Encontre casas, apartamentos, terrenos e sobrados à venda em São José do Rio Preto. Consulte fotos, valores e detalhes dos imóveis disponíveis e fale diretamente com Kalebe para agendar uma visita.
```

Para tipo:

```text
Confira casas disponíveis em São José do Rio Preto, com opções em diferentes bairros, faixas de preço e metragens.
```

Gerar naturalmente com base na página.

Não afirmar características que não existam no catálogo.

---

# ESTATÍSTICAS ÚTEIS

Nas landing pages, pode mostrar informações reais como:

```text
12 imóveis disponíveis
8 bairros
faixa de preços de X a Y
```

SOMENTE quando os cálculos forem feitos com dados reais.

Nunca criar números fictícios.

---

# URLs COM ZERO RESULTADOS

Landing SEO com entidade inexistente:

`notFound()`.

Landing válida mas sem imóvel publicado:

evitar mantê-la como página indexável vazia.

Dependendo do contexto:

* `notFound()`;
  ou
* página útil + `noindex`.

Não adicionar ao sitemap.

---

# 404

Confirmar que:

* slugs inválidos;
* cidade inexistente;
* tipo inválido;
* bairro inexistente;
* condomínio inexistente;

retornam HTTP/estado equivalente correto através de `notFound()`.

Não retornar página 200 dizendo apenas:

`Nenhum resultado`.

para URL completamente inexistente.

---

# PAGINAÇÃO

Se o catálogo ainda for pequeno, NÃO adicionar paginação apenas por SEO.

Se durante a análise ficar evidente que existe volume grande, implementar paginação server-side adequada.

Não implementar infinite scroll que esconda conteúdo do HTML sem necessidade.

---

# FILTROS

Preservar completamente os filtros atuais.

As novas landing pages podem reaproveitar:

`CardImovel`

e outros componentes existentes.

Não duplicar interface de catálogo.

---

# CSS

Reaproveitar estilos existentes sempre que possível.

Criar CSS Modules novos somente quando necessário.

Landing pages devem parecer parte do mesmo site.

Nada de criar páginas com aparência diferente apenas porque são páginas SEO.

---

# TITLE TEMPLATE

Preservar um template global coerente.

Evitar títulos duplicando:

```text
Kalebe | Kalebe Corretor
```

Verificar como o `title.template` interage com titles fornecidos pelas páginas.

Se necessário alterar o template para evitar duplicações.

Exemplo esperado final:

```text
Corretor de Imóveis em São José do Rio Preto | Kalebe

Imóveis à Venda em São José do Rio Preto | Kalebe

Casas à Venda em São José do Rio Preto | Kalebe
```

Não:

```text
Casas à Venda ... | Kalebe | Kalebe Corretor
```

---

# METADATA HELPERS

Criar helpers para evitar title/description inconsistentes.

Exemplos conceituais:

```ts
criarMetadataPagina(...)
criarMetadataImovel(...)
criarTituloImovel(...)
criarDescricaoImovel(...)
```

Não exagerar na abstração.

---

# TESTES MANUAIS DE HTML

Depois de implementar, conferir o HTML retornado para:

```text
/
```

```text
/imoveis
```

```text
/imoveis?tipo=casa
```

```text
/imoveis/cidade/sao-jose-do-rio-preto
```

```text
/imoveis/cidade/sao-jose-do-rio-preto/casas
```

uma página de bairro real;

uma página de condomínio real, se houver;

um imóvel real.

Conferir:

```text
<title>
<meta name="description">
<link rel="canonical">
<meta name="robots">
og:title
og:description
og:url
og:image
twitter:card
JSON-LD
H1
```

---

# TESTAR SITEMAP

Abrir:

`/sitemap.xml`

Confirmar que:

1. todas as páginas importantes aparecem;
2. nenhum filtro aparece;
3. painel não aparece;
4. login não aparece;
5. favoritos não aparece;
6. imóveis publicados aparecem;
7. landing pages indexáveis aparecem;
8. URLs inexistentes não aparecem;
9. URLs são absolutas em `https://kalebecorretor.com.br`.

---

# TESTAR ROBOTS

Abrir:

`/robots.txt`

Confirmar o sitemap.

Confirmar que áreas administrativas estão bloqueadas.

Não bloquear páginas públicas importantes.

---

# TESTAR DADOS ESTRUTURADOS

Garantir JSON válido.

Não permitir vírgulas inválidas, `undefined`, HTML quebrado etc.

Tipos esperados onde fizer sentido:

```text
Person
Organization
WebSite
BreadcrumbList
ItemList
RealEstateListing
Offer
PostalAddress
```

Não é necessário colocar todos em todas as páginas.

Usar semanticamente.

---

# TESTES OBRIGATÓRIOS

Executar no final:

```bash
npm run lint
```

Depois:

```bash
npm run build
```

Resolver todos os erros.

Não considerar concluído se o build falhar.

---

# VERIFICAR ALTERAÇÕES COM GIT

No final executar:

```bash
git diff
```

Revisar todas as alterações.

Garantir que nenhum arquivo de configuração sensível ou `.env` foi commitado.

---

# NÃO FAZER COMMIT AUTOMÁTICO SEM NECESSIDADE

Implemente tudo e mostre o resultado.

Se você estiver autorizado no ambiente para realizar commit, não faça commit até terminar todos os testes e revisar o diff.

---

# RELATÓRIO FINAL OBRIGATÓRIO

Ao terminar, não responda simplesmente:

`SEO implementado.`

Quero um relatório dividido em:

## 1. Arquivos criados

Mostrar todos.

## 2. Arquivos alterados

Mostrar todos.

## 3. Novas rotas

Mostrar todas.

## 4. Metadata

Explicar o que mudou.

## 5. Canonical

Explicar as regras.

## 6. Indexação

Explicar quais páginas são `index` e quais são `noindex`.

## 7. Dados estruturados

Listar os schemas implementados.

## 8. Sitemap

Explicar quais URLs entram.

## 9. Robots

Explicar alterações.

## 10. Links internos

Explicar alterações.

## 11. Performance

Explicar o que foi efetivamente alterado em imagens e carregamento.

## 12. Testes

Informar o resultado exato de:

```text
npm run lint
npm run build
```

## 13. Pontos que ainda dependem de ação externa

Exemplo:

```text
Google Search Console
Perfil da Empresa no Google
avaliações reais
backlinks
conteúdo futuro
```

---

# CRITÉRIOS DE ACEITAÇÃO

A implementação somente pode ser considerada concluída quando:

* a home possui metadata própria;
* não há canonical `/` global aplicado incorretamente;
* `/imoveis` é indexável;
* URLs de filtros são `noindex, follow`;
* filtros continuam funcionando;
* URLs SEO limpas existem;
* cidades possuem páginas próprias;
* tipos por cidade possuem páginas próprias;
* bairros podem possuir páginas SEO;
* condomínios podem possuir páginas SEO;
* não existem páginas vazias em massa;
* imóvel continua em `/imoveis/[slug]`;
* páginas de imóvel têm title e description melhores;
* páginas possuem canonical correto;
* breadcrumb visual existe onde necessário;
* `BreadcrumbList` existe;
* dados estruturados utilizam somente dados reais;
* sitemap contém URLs SEO;
* sitemap não contém filtros;
* áreas privadas permanecem fora do Google;
* links da home apontam para URLs SEO limpas;
* links do rodapé apontam para URLs SEO limpas;
* cidade/bairro/condomínio possuem linkagem interna;
* Search Console pode ser verificado;
* imagens foram auditadas;
* `npm run lint` passa;
* `npm run build` passa;
* painel continua funcionando;
* cadastro de imóveis continua funcionando;
* uploads continuam funcionando;
* segurança/CSP continuam funcionando.

---

# IMPORTANTE: NÃO PROMETER POSIÇÃO NO GOOGLE

Essa implementação deve preparar tecnicamente e semanticamente o site para competir no Google.

Não colocar no código ou conteúdo afirmações como:

```text
número 1 no Google
melhor corretor de Rio Preto
corretor mais bem avaliado
```

sem evidência real.

---

# PRIORIDADE DAS BUSCAS

A arquitetura deve favorecer principalmente estas intenções:

```text
corretor de imóveis em São José do Rio Preto
corretor de imóveis Rio Preto
Kalebe Corretor
imóveis à venda em São José do Rio Preto
imóveis em Rio Preto
casas à venda em Rio Preto
apartamentos à venda em Rio Preto
terrenos à venda em Rio Preto
sobrados à venda em Rio Preto
imóveis em Mirassol
casas em Mirassol
imóveis em Bady Bassitt
casas em Bady Bassitt
imóveis + bairro
casas + bairro
apartamentos + bairro
imóveis + condomínio
tipo de imóvel + bairro + Rio Preto
```

Isso deve ser conseguido através da arquitetura e do conteúdo real, não através de repetição artificial.

---

# PRINCÍPIO FINAL

Faça uma implementação profissional.

Prefira:

```text
20 páginas realmente úteis
```

a:

```text
2.000 páginas automáticas sem conteúdo
```

Preserve a qualidade do site atual.

SEO deve ser integrado ao produto, e não parecer uma camada artificial colocada por cima.

Antes de encerrar, revise novamente todo o fluxo:

```text
Google encontra
→ consegue rastrear
→ entende a página
→ encontra canonical correto
→ encontra conteúdo real
→ encontra links internos
→ encontra dados estruturados
→ encontra a página no sitemap
→ consegue distinguir cidade/tipo/bairro/imóvel
→ não desperdiça crawl com filtros
```

Implemente a solução completa seguindo essas regras.
