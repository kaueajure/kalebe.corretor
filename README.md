# Kalebe Corretor — Site Imobiliário

Site imobiliário completo inspirado na identidade visual do material de referência (fundo escuro, dourado, tipografia Playfair Display + DM Sans), estruturado como produto real de imobiliária/corretor.

## Páginas

- `/` — Início
- `/imoveis` — Listagem com filtros
- `/imoveis/[slug]` — Detalhe do imóvel
- `/lancamentos` — Empreendimentos
- `/lancamentos/[slug]` — Detalhe do lançamento
- `/sobre` — Institucional
- `/contato` — Contato e formulário
- `/favoritos` — Imóveis salvos (localStorage)

## Stack

- Next.js (App Router)
- TypeScript
- CSS Modules + design tokens
- next/font (Playfair Display, DM Sans)

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Conteúdo

Os imóveis e lançamentos partem dos dados reais do material de referência (CRECI, WhatsApp, Rio Preto e região). Não há depoimentos, estatísticas ou endereços inventados.
