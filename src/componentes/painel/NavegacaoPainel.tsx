"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import estilos from "./navegacaoPainel.module.css";

const itens = [
  { href: "/painel", rotulo: "Início", exato: true },
  { href: "/painel/imoveis", rotulo: "Imóveis", exato: false },
];

export function NavegacaoPainel({ desenvolvedor }: { desenvolvedor: boolean }) {
  const caminho = usePathname();
  const itensVisiveis = desenvolvedor
    ? [...itens, { href: "/painel/usuarios", rotulo: "Usuários", exato: false }]
    : itens;

  return (
    <nav className={estilos.nav} aria-label="Painel">
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
