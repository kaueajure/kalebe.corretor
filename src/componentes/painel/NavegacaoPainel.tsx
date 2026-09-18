"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import estilos from "./navegacaoPainel.module.css";

const itens = [
  { href: "/painel", rotulo: "Início", exato: true },
  { href: "/painel/imoveis", rotulo: "Imóveis", exato: false },
];

type Propriedades = {
  desenvolvedor: boolean;
  aoNavegar?: () => void;
  variante?: "lateral" | "gaveta";
};

export function NavegacaoPainel({
  desenvolvedor,
  aoNavegar,
  variante = "lateral",
}: Propriedades) {
  const caminho = usePathname();
  const itensVisiveis = desenvolvedor
    ? [...itens, { href: "/painel/usuarios", rotulo: "Usuários", exato: false }]
    : itens;

  return (
    <nav
      className={`${estilos.nav} ${variante === "gaveta" ? estilos.navGaveta : ""}`}
      aria-label="Painel"
    >
      <ul className={estilos.lista}>
        {itensVisiveis.map((item) => {
          const ativo = item.exato
            ? caminho === item.href
            : caminho.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${estilos.link} ${ativo ? estilos.ativo : ""}`}
                aria-current={ativo ? "page" : undefined}
                onClick={aoNavegar}
              >
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
