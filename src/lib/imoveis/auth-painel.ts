import { redirect } from "next/navigation";
import { lerSessao, type SessaoPainel } from "@/lib/sessao";

export function sessaoPainelAutorizada(
  sessao: SessaoPainel | null,
): sessao is SessaoPainel {
  return Boolean(sessao && (sessao.administrador || sessao.desenvolvedor));
}

export async function exigirSessaoPainel(): Promise<SessaoPainel> {
  const sessao = await lerSessao();
  if (!sessaoPainelAutorizada(sessao)) {
    redirect("/login");
  }
  return sessao;
}

export async function obterSessaoPainelAutorizada(): Promise<SessaoPainel | null> {
  const sessao = await lerSessao();
  return sessaoPainelAutorizada(sessao) ? sessao : null;
}
