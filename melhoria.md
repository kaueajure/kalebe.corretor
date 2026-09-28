Analise profundamente o repositório completo:

https://github.com/kaueajure/kalebe.corretor

Quero realizar uma **refatoração visual completa do sistema**, abrangendo tanto o site público quanto o painel administrativo.

IMPORTANTE: não quero uma simples troca de cores, fontes ou border-radius.

Quero uma análise crítica da experiência atual e, a partir dela, a criação de uma linguagem visual muito mais moderna, profissional, refinada, coerente e adequada a um corretor de imóveis.

O objetivo é fazer o projeto parecer um produto imobiliário profissional desenvolvido com alto nível de atenção a UX/UI, e não um template genérico de imobiliária nem um dashboard SaaS genérico.

---

# 1. PRIMEIRO: ANALISE O PROJETO ANTES DE ALTERAR

Antes de escrever ou modificar qualquer código, faça uma inspeção completa do repositório.

Analise principalmente:

- `src/app`;
- `src/componentes`;
- `src/componentes/cardImovel`;
- `src/componentes/buscaPrincipal`;
- `src/componentes/filtroImoveis`;
- `src/componentes/galeriaImovel`;
- `src/componentes/cabecalho`;
- `src/componentes/rodape`;
- `src/componentes/painel`;
- `src/componentes/ui`;
- páginas de imóveis;
- página individual do imóvel;
- home;
- favoritos;
- sobre;
- contato;
- login;
- painel;
- cadastro e edição de imóveis;
- gerenciamento de mídias;
- CSS global;
- CSS Modules;
- responsividade;
- tipografia;
- variáveis/tokens de design.

Não analise somente a home.

A refatoração precisa considerar o projeto como **um sistema visual completo**.

---

# 2. NÃO PRESUMA QUE O VISUAL ATUAL ESTÁ ERRADO

Faça uma avaliação crítica e independente.

Identifique claramente:

## O que está bom atualmente

Liste os elementos que já possuem boa solução visual ou estrutural e que devem ser:

- mantidos;
- refinados;
- reaproveitados;
- ou utilizados como base para o novo design system.

Considere, por exemplo:

- hierarquia;
- organização dos componentes;
- responsividade;
- clareza;
- acessibilidade;
- espaçamento;
- arquitetura de CSS;
- componentes reutilizáveis;
- navegação;
- experiência de busca;
- organização do painel;
- fluxo de cadastro;
- apresentação de imóveis.

Não altere alguma coisa simplesmente porque foi solicitado um redesign.

Se algo já estiver bem resolvido, preserve.

---

# 3. IDENTIFIQUE O QUE ESTÁ RUIM

Faça uma auditoria visual detalhada e aponte objetivamente os problemas encontrados.

Não utilize comentários vagos como:

- "pode ficar mais moderno";
- "melhorar UI";
- "melhorar UX";
- "deixar mais elegante".

Explique exatamente **o que está causando o problema e por quê**.

Analise:

### Identidade visual

- personalidade visual;
- consistência;
- percepção de qualidade;
- diferenciação;
- aparência genérica;
- aparência excessivamente SaaS;
- aparência excessivamente simples;
- relação entre site imobiliário e marca pessoal do corretor.

### Tipografia

Analise as fontes atualmente utilizadas.

O projeto atualmente utiliza uma combinação de tipografia display e corpo.

Avalie:

- se combinam com mercado imobiliário;
- legibilidade;
- personalidade;
- pesos;
- tamanhos;
- line-height;
- letter-spacing;
- hierarquia;
- uso em títulos;
- uso em valores;
- uso no painel;
- uso em formulários;
- uso em mobile.

Não troque a fonte simplesmente por trocar.

Caso proponha novas fontes, explique por que são superiores para este projeto.

---

# 4. ANALISE O DESIGN SYSTEM ATUAL

Examine os tokens existentes em `globals.css` e em outros arquivos.

Hoje existem conceitos como:

- cores de fundo;
- textos;
- bordas;
- sombras;
- raios;
- largura de conteúdo;
- botões;
- inputs;
- títulos;
- superfícies.

Determine se o sistema atual apresenta excesso de repetição visual.

Por exemplo, investigue se:

- muitos componentes parecem caixas semelhantes;
- cards, formulários e seções utilizam tratamentos quase iguais;
- border-radius é utilizado excessivamente;
- bordas aparecem demais;
- sombras aparecem demais;
- existe pouca diferenciação entre níveis de informação;
- branco, cinza e preto estão sendo utilizados de maneira excessivamente uniforme;
- o layout parece uma coleção de componentes isolados em vez de uma composição editorial.

Não considere esses pontos como conclusões prévias.

Verifique no código se realmente acontecem.

---

# 5. CARDS DE IMÓVEIS

Faça uma análise específica do componente:

`CardImovel`

O card de imóvel é um dos elementos mais importantes de todo o sistema.

Ele não pode parecer um card genérico de dashboard ou e-commerce.

Avalie:

- proporção da fotografia;
- tamanho da fotografia;
- border-radius;
- borda externa;
- sombra;
- zoom no hover;
- preço;
- preço anterior;
- título;
- bairro/cidade;
- dormitórios;
- banheiros;
- vagas;
- área;
- status;
- finalidade;
- favoritos;
- hierarquia das informações;
- densidade;
- quantidade de ícones;
- espaçamento vertical.

A fotografia do imóvel deve ter protagonismo.

Analise se seria melhor utilizar:

- cards mais editoriais;
- menos bordas;
- imagens maiores;
- tipografia mais forte;
- informações secundárias mais discretas;
- melhor separação entre preço, localização e características.

Não copie literalmente os cards de nenhum site de referência.

Extraia os princípios.

---

# 6. HOME

Analise profundamente a home atual.

Avalie:

## Hero

- altura;
- fotografia;
- overlay;
- legibilidade;
- título;
- subtítulo;
- busca;
- espaçamento;
- posicionamento do conteúdo;
- comportamento mobile.

A busca por imóveis deve ser uma das principais ações da página.

Evite transformar o hero em uma landing page genérica com:

- título gigantesco;
- gradientes desnecessários;
- textos motivacionais;
- excesso de CTAs.

---

# 7. BUSCA DE IMÓVEIS

A busca deve ser simples para quem não entende termos imobiliários.

Analise:

- busca principal;
- filtros;
- filtros avançados;
- selects;
- inputs;
- chips;
- ordenação;
- estado ativo;
- limpar filtros;
- mobile;
- quantidade de informação simultânea.

O usuário deve conseguir responder rapidamente:

"Onde quero morar?"

"O que quero comprar?"

"Quanto quero gastar?"

"Quantos quartos preciso?"

Evite filtros tecnicamente corretos porém cansativos.

---

# 8. CATÁLOGO DE IMÓVEIS

Refatore a experiência de listagem.

Analise:

- largura do grid;
- quantidade de colunas;
- espaçamento;
- densidade;
- filtros;
- ordenação;
- cabeçalho da página;
- número de resultados;
- estados vazios;
- paginação, caso exista;
- mobile.

A página não deve parecer apenas:

filtro + grade de cards.

Crie uma experiência imobiliária mais refinada.

---

# 9. PÁGINA INDIVIDUAL DO IMÓVEL

Esta página merece atenção especial.

Analise:

- galeria;
- imagem principal;
- miniaturas;
- título;
- preço;
- localização;
- características;
- descrição;
- infraestrutura;
- informações do condomínio;
- documentação;
- vídeos;
- plantas;
- CTA de WhatsApp;
- informações do corretor;
- imóveis relacionados.

A galeria deve ser um dos elementos visualmente mais importantes da página.

A página deve privilegiar:

1. fotografia;
2. preço;
3. localização;
4. características principais;
5. contato.

Evite excesso de pequenas caixas.

Agrupe informações de forma editorial e lógica.

---

# 10. USO DA FOTOGRAFIA

Um site imobiliário depende muito mais das imagens do que um site institucional comum.

Por isso:

- dê mais protagonismo às fotografias;
- evite comprimir fotos em cards pequenos demais;
- preserve proporções adequadas;
- crie galerias mais imersivas;
- utilize cropping consistente;
- evite overlays fortes quando desnecessários;
- trate imagens como parte principal da identidade.

---

# 11. SOBRE O CORRETOR

O projeto representa um corretor individual.

Não transforme a experiência em uma imobiliária corporativa gigantesca.

Kalebe precisa continuar aparecendo como a pessoa responsável pelo atendimento.

A seção deve transmitir:

- confiança;
- proximidade;
- profissionalismo;
- conhecimento da região;
- atendimento humano.

Evite clichês como:

"realizando sonhos";

"transformando sonhos em realidade";

"seu sonho começa aqui";

"encontre o lar dos seus sonhos".

Prefira comunicação direta e humana.

---

# 12. PAINEL ADMINISTRATIVO

O painel também deverá ser completamente revisado visualmente.

Ele não deve simplesmente reutilizar o estilo do site público.

O painel pode compartilhar:

- tipografia;
- tokens;
- princípios;
- componentes básicos;

mas precisa possuir sua própria linguagem de interface operacional.

Analise especificamente:

- `ShellPainel`;
- `NavegacaoPainel`;
- dashboard;
- métricas;
- atalhos;
- lista de imóveis;
- ações;
- criação de imóvel;
- edição;
- formulário;
- upload de fotos;
- galeria de mídias;
- login;
- manutenção;
- primeiro acesso;
- diálogos;
- mensagens;
- estados de erro e sucesso.

---

# 13. O PAINEL NÃO DEVE PARECER UM TEMPLATE ADMIN GENÉRICO

Evite o padrão:

sidebar escura + vários cards arredondados + sombra + dashboard cheio de caixas.

Use hierarquia real.

Nem toda informação precisa estar dentro de um card.

Utilize:

- agrupamento;
- divisores;
- espaçamento;
- títulos;
- superfícies;
- tabelas;
- listas;
- headers;
- barras de ação;
- estados;
- navegação.

Escolha o elemento correto para cada tipo de informação.

---

# 14. SIDEBAR DO PAINEL

Analise a sidebar atual.

Avalie:

- largura;
- contraste;
- navegação ativa;
- ícones;
- identificação do usuário;
- botão "Ver site";
- logout;
- hierarquia;
- mobile.

A sidebar deve parecer parte de uma ferramenta profissional.

Não deve chamar mais atenção do que o conteúdo que está sendo administrado.

---

# 15. FORMULÁRIO DE CADASTRO DE IMÓVEL

O formulário é grande e possui muitas informações.

Não reduza o problema apenas diminuindo fonte e espaçamento.

Crie uma experiência adequada para formulários extensos.

Avalie:

- divisão por seções;
- hierarquia;
- números das etapas;
- campos obrigatórios;
- campos opcionais;
- grid;
- labels;
- textos auxiliares;
- checkboxes;
- toggles;
- campos monetários;
- CEP;
- endereço;
- detalhes;
- características;
- condomínio;
- documentação;
- mídias;
- revisão;
- percentual de completude;
- ações de salvar/publicar.

O usuário deve conseguir percorrer dezenas de campos sem se perder.

---

# 16. MOBILE DO PAINEL

Não trate mobile como uma versão desktop comprimida.

Analise especificamente:

- navegação;
- formulário;
- campos;
- botões;
- barras fixas;
- upload;
- galeria;
- ações principais;
- espaçamento;
- altura útil da tela;
- teclado virtual;
- modais.

---

# 17. REFERÊNCIAS IMOBILIÁRIAS

Utilize os seguintes sites como referências de pesquisa.

IMPORTANTE:

**NÃO copie layouts inteiros.  
NÃO copie identidade visual.  
NÃO transforme o projeto em clone.**

Analise os princípios que tornam essas experiências boas.

## MBRAS — Brasil

Estudar:

- luxo sem exagero;
- grandes fotografias;
- busca imediatamente visível;
- bastante espaço em branco;
- hierarquia sofisticada;
- apresentação premium dos imóveis;
- quantidade reduzida de elementos disputando atenção.

Principal aprendizado:

**fotografia + espaço + hierarquia.**

---

## Compass — Estados Unidos

Estudar:

- experiência de busca;
- descoberta rápida;
- localização como elemento central;
- cards;
- informações essenciais dos imóveis;
- interface de produto;
- clareza.

Principal aprendizado:

**a busca é o produto, não apenas um campo no hero.**

---

## The Modern House — Reino Unido

Estudar profundamente.

Possui uma abordagem muito mais editorial que os portais imobiliários tradicionais.

Estudar:

- tipografia;
- composição;
- fotografia;
- espaços vazios;
- páginas de imóveis;
- ritmo vertical;
- ausência de caixas desnecessárias;
- storytelling visual.

Principal aprendizado:

**um imóvel pode ser apresentado como arquitetura e estilo de vida, e não somente como ficha técnica.**

---

## Axpe — Brasil

Estudar:

- linguagem boutique;
- branding;
- curadoria;
- apresentação dos imóveis;
- conteúdo;
- equilíbrio entre comercial e editorial.

Principal aprendizado:

**evitar sensação de catálogo genérico.**

---

## Bossa Nova Sotheby's International Realty — Brasil

Estudar:

- alto padrão;
- página de imóvel;
- filtros;
- fotografia;
- favoritos;
- lançamentos;
- organização de características.

Principal aprendizado:

**apresentar bastante informação sem destruir a sofisticação.**

---

## SERHANT. — Estados Unidos

Estudar:

- branding forte;
- composição visual;
- vídeo;
- mídia;
- tipografia;
- movimento;
- apresentação imobiliária contemporânea.

Principal aprendizado:

**uma imobiliária pode possuir identidade marcante sem perder funcionalidade.**

Não exagerar esse conceito no Kalebe.

---

## Inigo — Reino Unido

Estudar:

- editorial;
- imóveis históricos;
- tipografia;
- narrativa;
- fotografia;
- composição das páginas.

Principal aprendizado:

**informações do imóvel não precisam estar sempre dentro de cards.**

---

## The Agency — Estados Unidos

Estudar:

- lifestyle;
- propriedades;
- regiões;
- branding;
- apresentação premium;
- integração entre corretor, imóvel e região.

---

## Coelho da Fonseca — Brasil

Estudar:

- organização da home;
- busca;
- coleções;
- imóveis;
- lançamentos;
- estrutura institucional;
- apresentação brasileira de alto padrão.

---

## Douglas Elliman — Estados Unidos

Estudar:

- grandes fotografias;
- mercados/regiões;
- hierarquia;
- páginas de propriedades;
- conteúdo editorial.

---

## QuintoAndar — Brasil

Não utilizar como principal referência estética.

Utilizar como referência de **usabilidade**.

Estudar:

- busca;
- filtros;
- clareza;
- fluxos;
- UX;
- linguagem;
- redução de fricção.

Principal aprendizado:

**o usuário sempre entende qual é o próximo passo.**

---

## Christie's International Real Estate

Estudar:

- luxo minimalista;
- fotografia;
- grid;
- busca;
- equilíbrio entre conteúdo e imóveis;
- páginas individuais.

---

## Judice & Araujo — Brasil

Estudar:

- jornada de comprador;
- jornada de proprietário;
- captação de imóveis;
- apresentação institucional;
- prova social;
- CTAs.

---

## Knight Frank — Reino Unido / Internacional

Estudar:

- arquitetura de informação;
- navegação;
- localização;
- propriedades;
- organização de grande volume de informação.

---

## Hilton & Hyland — Estados Unidos

Estudar principalmente:

- fotografia;
- vídeo;
- imóveis de alto padrão;
- baixa densidade visual;
- páginas de propriedade.

Principal aprendizado:

**em imóveis, imagens boas devem ocupar espaço.**

---

# 18. REFERÊNCIAS ESPECÍFICAS PARA O PAINEL ADMINISTRATIVO

Os sites imobiliários acima ajudam principalmente na área pública.

Para o painel administrativo, estude também:

## Linear

Observar:

- densidade;
- hierarquia;
- navegação;
- estados;
- ações;
- atalhos;
- ausência de decoração desnecessária.

## Vercel Dashboard

Observar:

- organização;
- uso de superfícies;
- formulários;
- tabelas;
- navegação lateral;
- páginas de configuração.

## Stripe Dashboard

Observar:

- dashboards;
- filtros;
- tabelas;
- formulários;
- feedback;
- estados;
- informação complexa apresentada de forma clara.

IMPORTANTE:

Não copie a estética dessas plataformas literalmente.

O painel continua sendo um **CMS imobiliário**, não uma ferramenta para desenvolvedores.

---

# 19. DIREÇÃO VISUAL DESEJADA

Busque um equilíbrio entre:

**The Modern House**
+
**Axpe**
+
**MBRAS**
+
**Compass**

para a área pública.

Isso significa:

- editorial;
- sofisticado;
- contemporâneo;
- humano;
- fotografia forte;
- busca excelente;
- muito organizado;
- não excessivamente luxuoso;
- não genérico.

Para o painel:

**Linear**
+
**Vercel**
+
**Stripe**

apenas em princípios de interface e organização.

---

# 20. EVITE "DESIGN DE IA"

Não quero um site com aparência claramente gerada por IA.

Evite:

- dezenas de cards flutuantes;
- glassmorphism;
- gradientes roxos/azuis;
- blobs;
- glow;
- sombras exageradas;
- border-radius enorme em tudo;
- ícones dentro de círculos em todas as seções;
- badges desnecessários;
- números gigantes apenas para preencher espaço;
- excesso de microtextos explicativos;
- CTAs em toda seção;
- títulos gigantes;
- textos genéricos;
- animações em absolutamente tudo.

O projeto deve parecer desenhado por um designer de produto experiente.

---

# 21. ANIMAÇÕES

Use animações apenas quando melhorarem percepção de qualidade ou compreensão.

São aceitáveis:

- transições discretas;
- hover de imagem;
- abertura de menus;
- galeria;
- filtros;
- feedback de botões;
- loading;
- mudança de estado;
- microinterações.

Evite animações simplesmente decorativas.

Respeite:

`prefers-reduced-motion`.

---

# 22. RESPONSIVIDADE

Analise no mínimo:

- 320px;
- 375px;
- 430px;
- tablet;
- notebooks;
- 1366px;
- 1440px;
- telas grandes.

Não considere mobile apenas no final.

A solução deve ser pensada mobile-first quando fizer sentido.

---

# 23. ACESSIBILIDADE

Preserve e melhore:

- HTML semântico;
- navegação por teclado;
- focus-visible;
- labels;
- contraste;
- áreas de toque;
- aria quando necessário;
- diálogos acessíveis;
- textos alternativos;
- reduced motion.

Não destrua os cuidados de acessibilidade já existentes apenas para melhorar estética.

---

# 24. SEO E FUNCIONALIDADES EXISTENTES

Esta tarefa é principalmente visual.

Portanto, não quebre ou remova:

- rotas;
- URLs indexáveis;
- sitemap;
- robots;
- metadata;
- JSON-LD;
- páginas SEO por cidade;
- páginas por bairro;
- páginas por condomínio;
- canonical;
- favoritos;
- filtros;
- autenticação;
- banco MySQL;
- upload;
- gerenciamento de mídias;
- manutenção;
- CSP;
- segurança;
- validações;
- integrações existentes.

Não altere regra de negócio apenas para facilitar o redesign.

---

# 25. ARQUITETURA

Não faça uma reescrita desnecessária.

O projeto já utiliza:

- Next.js;
- React;
- TypeScript;
- CSS Modules;
- CSS global;
- componentes reutilizáveis.

Aproveite essa arquitetura.

Caso encontre problemas estruturais de CSS ou componentes, refatore somente quando trouxer vantagem concreta.

---

# 26. CRIE UM DESIGN SYSTEM COERENTE

Depois da auditoria, estabeleça um sistema visual consistente para o projeto.

Defina:

### Cores

- fundo principal;
- superfícies;
- texto primário;
- texto secundário;
- texto terciário;
- bordas;
- estados;
- ações;
- WhatsApp;
- erro;
- sucesso.

### Tipografia

- display;
- body;
- tamanhos;
- pesos;
- line-height;
- letter-spacing;
- hierarquia.

### Espaçamento

Crie escala coerente.

### Raios

Utilize poucos níveis.

Não arredonde tudo indiscriminadamente.

### Bordas

Defina quando devem e quando não devem existir.

### Sombras

Utilize somente onde houver relação real de elevação.

### Componentes

Padronize:

- botão;
- input;
- select;
- textarea;
- checkbox;
- radio;
- toggle;
- chip;
- badge;
- card;
- modal;
- menu;
- dropdown;
- estado vazio;
- alerta;
- skeleton;
- tooltip.

---

# 27. HIERARQUIA MAIS IMPORTANTE QUE DECORAÇÃO

Sempre prefira resolver problemas através de:

1. espaçamento;
2. proporção;
3. alinhamento;
4. tipografia;
5. fotografia;
6. contraste;
7. agrupamento;

antes de recorrer a:

- bordas;
- backgrounds;
- sombras;
- cards;
- ícones.

---

# 28. ENTREGA DA ANÁLISE

ANTES de implementar, apresente uma auditoria contendo:

### A. O que está bom

Informe:

- arquivo/componente;
- característica;
- por que funciona;
- se deve ser preservada ou refinada.

### B. O que está ruim

Informe:

- arquivo/componente;
- problema;
- consequência visual/UX;
- solução recomendada.

### C. Inconsistências

Liste diferenças injustificadas entre páginas/componentes.

### D. Prioridades

Classifique os problemas como:

- crítico;
- importante;
- refinamento.

### E. Nova direção visual

Explique claramente a direção escolhida.

Não comece a mudar código antes de entender o sistema.

---

# 29. DEPOIS DA ANÁLISE, IMPLEMENTE

Após concluir a auditoria, realize a refatoração.

Não pare apenas na análise.

Faça as alterações necessárias no código.

Trabalhe componente por componente e mantenha consistência global.

---

# 30. ORDEM RECOMENDADA

Prefira trabalhar nesta sequência:

1. design tokens;
2. tipografia;
3. componentes UI básicos;
4. header;
5. busca;
6. card de imóvel;
7. catálogo;
8. página individual;
9. home;
10. páginas institucionais;
11. favoritos;
12. login;
13. estrutura do painel;
14. sidebar;
15. dashboard;
16. formulários;
17. galeria de mídias;
18. dialogs;
19. mobile;
20. revisão global.

---

# 31. VALIDAÇÃO FINAL

Depois da refatoração, revise todo o projeto novamente.

Verifique:

- consistência visual;
- desktop;
- mobile;
- overflow;
- grids;
- imagens;
- tipografia;
- foco;
- hover;
- estados;
- formulários;
- galeria;
- cards;
- sidebar;
- modais;
- vazios;
- loading;
- erros.

Execute também os comandos de validação já existentes no projeto, incluindo:

`npm run lint`

e

`npm run build`

Corrija os problemas encontrados.

---

# RESULTADO ESPERADO

Quero que, ao terminar, a diferença seja significativa.

O projeto deve deixar de parecer simplesmente:

"um site funcional de corretor de imóveis"

e passar a transmitir:

**uma plataforma imobiliária moderna, profissional, autoral e confiável, criada especificamente para o Kalebe e para os imóveis da região.**

O resultado deve possuir qualidade visual comparável às melhores referências do setor, mas sem perder simplicidade, desempenho, SEO, acessibilidade ou facilidade de manutenção.

A personalidade final deve ser:

**moderna, editorial, minimalista, imobiliária, humana, profissional e refinada.**

Não quero luxo artificial.

Não quero aparência de template.

Não quero aparência de site feito por IA.

Quero um produto visualmente coerente e profissional, no qual fotografia, imóveis, busca e atendimento sejam os protagonistas.