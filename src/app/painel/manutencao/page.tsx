import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ControleManutencao } from "@/componentes/painel/ControleManutencao";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { obterConfiguracaoManutencao } from "@/lib/manutencao";
import estilos from "./manutencao.module.css";

export const metadata: Metadata = { title: "Manutenção", robots: { index: false, follow: false } };

export default async function PaginaManutencao() {
  const sessao = await exigirSessaoPainel();
  if (!sessao.desenvolvedor) notFound();
  const configuracao = await obterConfiguracaoManutencao();

  return (
    <main className={estilos.pagina}>
      <header className={estilos.cabecalho}>
        <h1>Manutenção</h1>
        <p>Defina o aviso e controle quando ele aparece no site.</p>
      </header>

      <ControleManutencao configuracao={configuracao} />
    </main>
  );
}
