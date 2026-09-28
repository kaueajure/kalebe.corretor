import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { empresa } from "@/dados/empresa";
import { manutencaoAtiva } from "@/lib/manutencao";
import { lerSessao } from "@/lib/sessao";
import { sairDaManutencao } from "./acoes";
import estilos from "./manutencao.module.css";

export const metadata: Metadata = {
  title: "Site em manutenção",
  robots: { index: false, follow: false },
};

export default async function AvisoManutencao() {
  if (!(await manutencaoAtiva())) redirect("/");
  const sessao = await lerSessao();

  return (
    <main className={estilos.pagina}>
      <div className={estilos.conteudo}>
        <p className={estilos.marca}>{empresa.nomeCurto}</p>
        <span className={estilos.linha} aria-hidden="true" />
        <h1>Site em manutenção</h1>
        <p className={estilos.descricao}>
          Estamos fazendo ajustes para melhorar sua experiência. Volte em breve.
        </p>
        {sessao && !sessao.desenvolvedor ? (
          <form action={sairDaManutencao} className={estilos.sair}>
            <button type="submit">Sair da conta</button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
