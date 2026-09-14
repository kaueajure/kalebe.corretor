"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import estilos from "./navegacaoPainel.module.css";

const itens = [
  { href: "/painel", rotulo: "Início", exato: true },
  { href: "/painel/imoveis", rotulo: "Imóveis", exato: false },
];

export function NavegacaoPainel() {
  const caminho = usePathname();

  return (
    <nav className={estilos.nav} aria-label="Painel">
      <ul className={estilos.lista}>
        {itens.map((item) => {
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
