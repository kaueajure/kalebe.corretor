import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { empresa } from "@/dados/empresa";
import { obterConfiguracaoManutencao } from "@/lib/manutencao";
import { lerSessao } from "@/lib/sessao";
import { sairDaManutencao } from "./acoes";
import estilos from "./manutencao.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const configuracao = await obterConfiguracaoManutencao();
  return {
    title: { absolute: configuracao.titulo },
    robots: { index: false, follow: false },
  };
}

export default async function AvisoManutencao() {
  const configuracao = await obterConfiguracaoManutencao();
  if (!configuracao.ativa) redirect("/");
  const sessao = await lerSessao();

  return (
    <main className={estilos.pagina}>
      <div className={estilos.conteudo}>
        <p className={estilos.marca}>{empresa.nomeCurto}</p>
        <span className={estilos.linha} aria-hidden="true" />
        {configuracao.rotulo ? (
          <p className={estilos.rotulo}>{configuracao.rotulo}</p>
        ) : null}
        <h1>{configuracao.titulo}</h1>
        <p className={estilos.descricao}>
          {configuracao.mensagemPrincipal}
        </p>
        {configuracao.mensagemComplementar ? (
          <p className={estilos.complementar}>{configuracao.mensagemComplementar}</p>
        ) : null}
        {sessao && !sessao.desenvolvedor ? (
          <form action={sairDaManutencao} className={estilos.sair}>
            <button type="submit">Sair da conta</button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
