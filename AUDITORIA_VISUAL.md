# Auditoria visual — Kalebe Corretor

Esta auditoria registra a leitura do site público e do painel antes da conclusão da refatoração descrita em `melhoria.md`. A comparação considera o código versionado e as alterações locais já iniciadas. A tarefa é visual; rotas, dados, autenticação e regras de publicação foram preservados.

## A. Soluções que funcionam

| Arquivo ou componente | Característica | Decisão |
| --- | --- | --- |
| `src/app/layout.tsx` e `src/app/globals.css` | Bricolage Grotesque identifica os títulos; Source Sans 3 mantém leitura confortável em textos e formulários. | Preservar as famílias e ajustar a escala e o contraste com tokens. |
| `src/componentes/buscaPrincipal` | Cidade, tipo, valor e quartos correspondem às primeiras perguntas de quem procura imóvel. | Preservar a ordem simples e a busca por formulário nativo. |
| `src/componentes/cardImovel` | Fotografia, preço, localização e atributos aparecem em uma ordem útil; favorito tem ação independente do link. | Ampliar a fotografia e retirar a moldura externa sem perder essa hierarquia. |
| `src/componentes/galeriaImovel` | Imagem principal, miniaturas e diálogo ampliado já existem; fotos têm texto alternativo. | Refinar proporções, controles e tamanhos de carregamento. |
| `src/app/imoveis/[slug]/page.tsx` | Localização, características, custo, corretor e contato já estão organizados por assunto. | Reduzir caixas pequenas e manter o contato disponível. |
| `src/componentes/painel/FormularioImovel.tsx` | Seções, validação, rascunho, publicação e ordenação de mídias já formam um fluxo completo. | Manter a lógica e tornar a navegação entre seções mais clara. |
| `src/app/imoveis` e `src/componentes/seo` | URLs de localidade, metadados e dados estruturados estão separados da apresentação. | Preservar integralmente. |

## B. Problemas observados

| Prioridade | Arquivo ou componente | Problema e consequência | Tratamento |
| --- | --- | --- | --- |
| Crítico | `src/app/painel/painel.module.css` | O botão de menu mobile tinha ícone branco sobre fundo quase branco; a navegação ficava difícil de descobrir. | Usar a cor de texto da barra lateral. |
| Importante | `src/componentes/galeriaImovel` | O mosaico não oferecia setas para percorrer a imagem principal, e “Ver galeria” era um texto com aparência de ação. | Mostrar a navegação para mais de uma mídia e transformar o texto em botão. |
| Importante | `src/componentes/galeriaImovel/GaleriaImovel.tsx` | Fotos laterais eram solicitadas com largura de miniatura, apesar de ocuparem uma coluna grande. | Informar ao Next.js o tamanho próprio da coluna lateral. |
| Importante | `src/componentes/cardImovel/cardImovel.module.css` | Foto pequena, moldura, sombra e deslocamento no hover concorriam com o imóvel; a regra de status estava duplicada. | Composição sem caixa externa, foto maior e uma única regra de status. |
| Importante | `src/componentes/filtroImoveis` | Muitos campos simultâneos cansavam a busca; chips ativos tinham alvo de toque baixo. | Priorizar três escolhas, guardar o resto em “Mais filtros” e ampliar os alvos. |
| Importante | `src/componentes/painel/formularioImovel.module.css` | Todas as seções pareciam cartões iguais, dificultando a leitura de um cadastro longo. | Cabeçalhos numerados, divisores, índice de seções e revisão final. |
| Refinamento | `src/app/primeiro-acesso` e `src/app/painel/usuarios` | Labels minúsculos em caixa alta diferiam dos outros formulários do painel. | Usar labels em frase e tamanho coerente. |
| Refinamento | `src/app/painel/imoveis` e `src/componentes/painel/galeriaMidias` | Algumas cores de fundo e borda continuavam literais, destoando dos tokens. | Aplicar tokens de superfície e borda existentes. |

## C. Inconsistências

- A área pública passou a usar fotografia ampla e bordas discretas, enquanto algumas telas secundárias ainda tinham cartões e sombras maiores.
- O catálogo, o formulário de imóvel e a lista do painel tinham ritmos verticais diferentes para informações equivalentes.
- Os rótulos de login, primeiro acesso e usuários tinham tratamentos diferentes entre si.
- O mosaico de fotos tinha um indicador visual de ação sem semântica de botão.

## D. Prioridades e direção

1. **Crítico:** legibilidade de controles, navegação por teclado e funções já existentes.
2. **Importante:** protagonismo da fotografia, busca clara, leitura da página do imóvel e fluxo do cadastro.
3. **Refinamento:** espaçamento, superfície, labels, estados e coerência entre telas.

Após a revisão solicitada, o site voltou ao padrão preto e branco: fundo branco (`#fff`), texto preto (`#111`) e cinzas para hierarquia; as fotos são a fonte de cor do catálogo. Bricolage Grotesque permanece nos títulos públicos e Source Sans 3 nos textos. O painel usa Source Sans 3 também nos títulos operacionais, com a marca em Bricolage. Ele organiza métricas em uma faixa, navegação em trilho lateral, imóveis em lista e formulários por seções com índice fixo. Bordas marcam estrutura ou estado; sombras ficam reservadas a elementos elevados como menus e diálogos. A escala de espaçamento e os raios estão em `globals.css`.

Na revisão do painel, o acesso recebeu uma composição preta e branca própria. A lista de imóveis ganhou filtros agrupados e ações explícitas; o cadastro ganhou divisão entre índice, título de seção e campos; mídias, usuários, manutenção e confirmação de exclusão seguem a mesma escala de texto, superfície e controles. A indicação de publicado usa fundo preto e texto branco, enquanto rascunho usa cinza, sempre com texto que informa o estado.

As referências foram usadas como princípios: [MBRAS](https://www.mbras.com.br/) para busca visível, [The Modern House](https://themodernhouse.com/journal/is-the-modern-house-the-perfect-alternative-to-rightmove) para fotografia e leitura editorial e [Linear](https://linear.app/now/behind-the-latest-design-refresh) para hierarquia operacional. Nenhum layout ou identidade foi copiado.

## Validação

`npm run lint`, `npm run build` e `git diff --check` passaram após as alterações. Foram inspecionadas capturas da home em 1440 px, catálogo em 320 px e 375 px, detalhe em 375 px e login em 320 px e 1440 px. As rotas internas do painel exigem sessão e redirecionam para `/login` sem autenticação; por isso a inspeção visual dessas telas em execução ainda depende de acesso autenticado.
