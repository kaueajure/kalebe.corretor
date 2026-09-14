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
- CSS Modules + design tokens (Marinho Institucional)
- next/font (Source Serif 4, Plus Jakarta Sans)
- MySQL + `mysql2` (`usuarios`)

## Banco de dados

1. Configure o `.env` com `host`, `usuario`, `senha`, `banco`, `porta` e `sessao_secreta`
2. Rode `npm run banco:migrar` (aplica os `.sql` de `/banco` via mysql2)
3. Conexão: `import { banco } from "@/lib/banco"`

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
