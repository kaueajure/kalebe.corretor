import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioLogin } from "@/componentes/painel/FormularioLogin";
import { empresa } from "@/dados/empresa";
import { lerSessao } from "@/lib/sessao";
import { manutencaoAtiva } from "@/lib/manutencao";
import estilos from "./login.module.css";

export default async function PaginaLogin() {
  const sessao = await lerSessao();
  const ativa = await manutencaoAtiva();
  if (sessao) {
    if (ativa && !sessao.desenvolvedor) redirect("/manutencao");
    redirect(sessao.alterarSenha ? "/primeiro-acesso" : "/painel");
  }

  return (
    <div className={estilos.pagina}>
      {!ativa ? (
        <Link href="/" className={estilos.voltar}>
          <span aria-hidden="true">←</span>
          Voltar ao site
        </Link>
      ) : null}

      <main className={estilos.quadro}>
        <div className={estilos.apresentacao}>
          <p className={estilos.selo}>{empresa.nomeCurto}</p>
          <div>
            <p className={estilos.rotulo}>Área de trabalho</p>
            <h2 className={estilos.marca}>Seu catálogo, em ordem.</h2>
            <p>Cadastre imóveis, organize as fotos e acompanhe o que está publicado.</p>
          </div>
          <span>Corretor de imóveis · {empresa.creci}</span>
        </div>
        <div className={estilos.caixa}>
          <div>
            <p className={estilos.rotulo}>Acesso administrativo</p>
            <h1>Entrar no painel</h1>
            <p className={estilos.subtitulo}>Use seu e-mail e sua senha para continuar.</p>
          </div>
          <FormularioLogin />
        </div>
      </main>
    </div>
  );
}
