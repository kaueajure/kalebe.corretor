"use client";

import { usePathname } from "next/navigation";
import { Cabecalho } from "@/componentes/cabecalho/Cabecalho";

export function ShellSite({ children, rodape }: { children: React.ReactNode; rodape: React.ReactNode }) {
  const pathname = usePathname();
  const areaRestrita =
    pathname.startsWith("/painel") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/primeiro-acesso") ||
    pathname === "/manutencao";

  if (areaRestrita) {
    return <>{children}</>;
  }

  return (
    <>
      <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>
      <Cabecalho />
      <main id="conteudo-principal" className="pagina" tabIndex={-1}>{children}</main>
      {rodape}
    </>
  );
}
