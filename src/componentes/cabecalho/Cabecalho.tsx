"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { empresa } from "@/dados/empresa";
import { useFavoritos } from "@/hooks/useFavoritos";
import { linkWhatsApp } from "@/lib/formatadores";
import { Icone } from "@/componentes/ui/Icone";
import estilos from "./cabecalho.module.css";

const links = [
  { href: "/imoveis", rotulo: "Imóveis" },
  { href: "/sobre", rotulo: "O corretor" },
  { href: "/contato", rotulo: "Contato" },
];

export function Cabecalho() {
  const pathname = usePathname();
  const { ids, pronto } = useFavoritos();
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const total = pronto ? ids.length : 0;

  useEffect(() => {
    const menu = menuRef.current;
    if (aberto) menu?.showModal();
    else menu?.close();
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  return (
    <header className={estilos.cabecalho}>
      <div className={`conteudo-largo ${estilos.interno}`}>
        <Link href="/" className={estilos.logo} aria-label="Kalebe Corretor — início">
          <span className={estilos.simbolo} aria-hidden="true">
            <Icone nome="casa" size={22} />
          </span>
          <span className={estilos.nome}>
            Kalebe
            <span>Corretor de imóveis</span>
          </span>
        </Link>

        <nav className={estilos.navDesktop} aria-label="Principal">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname.startsWith(link.href) ? "page" : undefined}
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
            className={estilos.favoritos}
            aria-label={`Imóveis favoritos${total ? `, ${total} salvos` : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
            {total ? <span className={estilos.contador}>{total}</span> : null}
          </Link>
          <a
            href={linkWhatsApp(empresa.whatsapp)}
            className={estilos.cta}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icone nome="mensagem" size={16} /> WhatsApp
          </a>
          <button
            type="button"
            className={estilos.menuBotao}
            aria-label="Abrir menu"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            onClick={() => setAberto(true)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      <dialog
        ref={menuRef}
        id="menu-mobile"
        className={estilos.menuMobile}
        onClose={() => setAberto(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setAberto(false);
        }}
        aria-label="Menu principal"
      >
        <div className={estilos.menuConteudo}>
          <div className={estilos.menuTopo}>
            <strong>Kalebe</strong>
            <button type="button" aria-label="Fechar menu" onClick={() => setAberto(false)}>
              ×
            </button>
          </div>
          <nav aria-label="Navegação no celular">
            <ul>
              {[{ href: "/", rotulo: "Início" }, ...links, { href: "/favoritos", rotulo: "Favoritos" }].map(
                (link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={() => setAberto(false)}>
                      {link.rotulo}
                      <Icone nome="seta" size={18} />
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
          <a
            href={linkWhatsApp(empresa.whatsapp)}
            className="botao botao-primario"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icone nome="mensagem" /> Conversar no WhatsApp
          </a>
          <p>{empresa.creci}</p>
        </div>
      </dialog>
    </header>
  );
}
