import type { SVGProps } from "react";

type Nome = "seta" | "busca" | "local" | "casa" | "predio" | "chave" | "mensagem" | "area" | "quartos" | "carro" | "check" | "filtros";
const desenhos: Record<Nome, React.ReactNode> = {
  seta: <><path d="M4 12h16M13 5l7 7-7 7" /></>,
  busca: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  local: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  casa: <><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" /></>,
  predio: <><path d="M5 21V3h14v18M3 21h18M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3" /></>,
  chave: <><circle cx="8" cy="8" r="5" /><path d="m12 12 9 9m-3-3 3-3m-6 0 3-3" /></>,
  mensagem: <path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.3-4.5a9 9 0 1 1 16.7-5Z" />,
  area: <><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6" /></>,
  quartos: <><path d="M3 18V7m18 11V7M3 14h18M3 10h18M5 10V6h6v4m2 0V6h6v4" /></>,
  carro: <><path d="m5 8 2-5h10l2 5M3 9h18v9H3zM5 18v3m14-3v3M6 13h2m8 0h2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  filtros: <><path d="M3 6h18M3 12h18M3 18h18" /><circle cx="8" cy="6" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="9" cy="18" r="2" /></>,
};
export function Icone({ nome, size = 20, ...props }: SVGProps<SVGSVGElement> & { nome: Nome; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{desenhos[nome]}</svg>;
}
