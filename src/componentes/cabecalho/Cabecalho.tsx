"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { empresa } from "@/dados/empresa";
import { useFavoritos } from "@/hooks/useFavoritos";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./cabecalho.module.css";

const links = [
  { href: "/imoveis", rotulo: "Imóveis" },
  { href: "/lancamentos", rotulo: "Lançamentos" },
  { href: "/sobre", rotulo: "Sobre" },
  { href: "/contato", rotulo: "Contato" },
];

export function Cabecalho() {
  const pathname = usePathname();
  const { ids, pronto } = useFavoritos();
  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const totalFavoritos = pronto ? ids.length : 0;

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 12);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  return (
    <header className={`${estilos.cabecalho} ${rolou ? estilos.rolou : ""}`}>
      <div className={`conteudo-largo ${estilos.interno}`}>
        <Link href="/" className={estilos.logo} aria-label="Página inicial">
          KALEBE <span>CORRETOR</span>
        </Link>

        <nav className={estilos.navDesktop} aria-label="Principal">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    pathname.startsWith(link.href) ? estilos.ativo : undefined
                  }
                >
                  {link.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={estilos.acoes}>
          <Link
            href="/favoritos"
            className={`${estilos.favoritos} ${
              pathname.startsWith("/favoritos") ? estilos.favoritosAtivo : ""
            }`}
            aria-label={
              totalFavoritos > 0
                ? `Favoritos, ${totalFavoritos} salvos`
                : "Favoritos"
            }
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={totalFavoritos > 0 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
            </svg>
            {totalFavoritos > 0 ? (
              <span className={estilos.contador}>{totalFavoritos}</span>
            ) : null}
          </Link>

          <a
            href={linkWhatsApp(
              empresa.whatsapp,
              "Olá! Gostaria de atendimento."
            )}
            className={estilos.cta}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>

          <button
            type="button"
            className={estilos.menuBotao}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            onClick={() => setMenuAberto((v) => !v)}
          >
            <span className="sr-only">
              {menuAberto ? "Fechar menu" : "Abrir menu"}
            </span>
            <span
              className={`${estilos.linha} ${menuAberto ? estilos.x1 : ""}`}
            />
            <span
              className={`${estilos.linha} ${menuAberto ? estilos.x2 : ""}`}
            />
            <span
              className={`${estilos.linha} ${menuAberto ? estilos.x3 : ""}`}
            />
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        className={`${estilos.menuMobile} ${menuAberto ? estilos.aberto : ""}`}
      >
        <nav aria-label="Mobile">
          <ul>
            <li>
              <Link href="/">Início</Link>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.rotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={linkWhatsApp(empresa.whatsapp)}
          className="botao botao-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar no WhatsApp
        </a>
      </div>
    </header>
  );
}
