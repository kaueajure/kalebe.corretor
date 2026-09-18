import type { Metadata } from "next";
import { ShellPainel } from "@/componentes/painel/ShellPainel";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";

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
    <ShellPainel
      nome={sessao.nome}
      iniciais={iniciais}
      desenvolvedor={sessao.desenvolvedor}
    >
      {children}
    </ShellPainel>
  );
}
