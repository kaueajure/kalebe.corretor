"use client";

import { usePathname } from "next/navigation";
import { Cabecalho } from "@/componentes/cabecalho/Cabecalho";
import { Rodape } from "@/componentes/rodape/Rodape";

export function ShellSite({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const areaRestrita =
    pathname.startsWith("/painel") || pathname.startsWith("/login");

  if (areaRestrita) {
    return <>{children}</>;
  }

  return (
    <>
      <Cabecalho />
      <main className="pagina">{children}</main>
      <Rodape />
    </>
  );
}
