import type { Metadata } from "next";
import Link from "next/link";
import { sairPainel } from "@/app/painel/acoes";
import { NavegacaoPainel } from "@/componentes/painel/NavegacaoPainel";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import estilos from "./painel.module.css";

export const metadata: Metadata = {
  title: "Painel",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await exigirSessaoPainel();
  const iniciais = sessao.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className={estilos.estrutura}>
      <aside className={estilos.lateral}>
        <div className={estilos.topoLateral}>
          <Link href="/painel" className={estilos.marca}>
            Kalebe
            <span>Painel</span>
          </Link>
          <Link href="/" className={estilos.verSite}>
            Ver site
          </Link>
        </div>

        <NavegacaoPainel />

        <div className={estilos.conta}>
          <div className={estilos.usuario}>
            <span className={estilos.avatar} aria-hidden="true">
              {iniciais || "K"}
            </span>
            <span className={estilos.identidade}>
              <strong title={sessao.nome}>{sessao.nome}</strong>
              <small>
                {sessao.desenvolvedor ? "Desenvolvedor" : "Administrador"}
              </small>
            </span>
          </div>
          <form action={sairPainel}>
            <button type="submit" className={estilos.sair}>
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className={estilos.conteudo}>{children}</div>
    </div>
  );
}
