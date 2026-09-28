import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ControleManutencao } from "@/componentes/painel/ControleManutencao";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { manutencaoAtiva } from "@/lib/manutencao";
import estilos from "./manutencao.module.css";

export const metadata: Metadata = { title: "Manutenção", robots: { index: false, follow: false } };

export default async function PaginaManutencao() {
  const sessao = await exigirSessaoPainel();
  if (!sessao.desenvolvedor) notFound();
  const ativa = await manutencaoAtiva();

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecalho}>
        <h1>Manutenção</h1>
        <p>Controle o acesso ao site enquanto realiza ajustes.</p>
      </header>

      <ControleManutencao ativaInicial={ativa} />
    </main>
  );
}
