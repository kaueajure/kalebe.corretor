"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sairPainel } from "@/app/painel/acoes";
import { NavegacaoPainel } from "@/componentes/painel/NavegacaoPainel";
import estilos from "@/app/painel/painel.module.css";

type Propriedades = {
  nome: string;
  iniciais: string;
  desenvolvedor: boolean;
  children: React.ReactNode;
};

export function ShellPainel({
  nome,
  iniciais,
  desenvolvedor,
  children,
}: Propriedades) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (menuAberto) menu.showModal();
    else if (menu.open) menu.close();
    if (!menuAberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [menuAberto]);

  function fecharMenu() {
    setMenuAberto(false);
  }

  const blocoConta = (
    <div className={estilos.conta}>
      <div className={estilos.usuario}>
        <span className={estilos.avatar} aria-hidden="true">
          {iniciais || "K"}
        </span>
        <span className={estilos.identidade}>
          <strong title={nome}>{nome}</strong>
          <small>{desenvolvedor ? "Desenvolvedor" : "Administrador"}</small>
        </span>
      </div>
      <form action={sairPainel}>
        <button type="submit" className={estilos.sair}>
          Sair
        </button>
      </form>
    </div>
  );

  return (
    <div className={estilos.estrutura}>
      <header className={estilos.cabecalhoMobile}>
        <Link href="/painel" className={estilos.marcaMobile}>
          Kalebe
          <span>Painel</span>
        </Link>
        <div className={estilos.acoesMobile}>
          <Link href="/" className={estilos.verSiteCompacto}>
            Site
          </Link>
          <button
            type="button"
            className={estilos.menuBotao}
            aria-label="Abrir menu do painel"
            aria-expanded={menuAberto}
            aria-controls="menu-painel-mobile"
            onClick={() => setMenuAberto(true)}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      <aside className={estilos.lateral} aria-label="Navegação do painel">
        <div className={estilos.topoLateral}>
          <Link href="/painel" className={estilos.marca}>
            Kalebe
            <span>Painel</span>
          </Link>
          <Link href="/" className={estilos.verSite}>
            Ver site
          </Link>
        </div>

        <NavegacaoPainel desenvolvedor={desenvolvedor} />
        {blocoConta}
      </aside>

      <dialog
        ref={menuRef}
        id="menu-painel-mobile"
        className={estilos.menuMobile}
        onClose={fecharMenu}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fecharMenu();
        }}
        aria-label="Menu do painel"
      >
        <div className={estilos.menuConteudo}>
          <div className={estilos.menuTopo}>
            <strong>Menu</strong>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={fecharMenu}
            >
              ×
            </button>
          </div>
          <NavegacaoPainel
            desenvolvedor={desenvolvedor}
            aoNavegar={fecharMenu}
            variante="gaveta"
          />
          <Link href="/" className={estilos.verSiteMenu} onClick={fecharMenu}>
            Ver site público
          </Link>
          {blocoConta}
        </div>
      </dialog>

      <div className={estilos.conteudo}>{children}</div>
    </div>
  );
}
