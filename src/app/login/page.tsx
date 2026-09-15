import Link from "next/link";
import { redirect } from "next/navigation";
import { FormularioLogin } from "@/componentes/painel/FormularioLogin";
import { empresa } from "@/dados/empresa";
import { lerSessao } from "@/lib/sessao";
import estilos from "./login.module.css";

export default async function PaginaLogin() {
  const sessao = await lerSessao();
  if (sessao) {
    redirect(sessao.alterarSenha ? "/primeiro-acesso" : "/painel");
  }

  return (
    <div className={estilos.pagina}>
      <Link href="/" className={estilos.voltar}>
        <span aria-hidden="true">←</span>
        Voltar ao site
      </Link>

      <div className={estilos.caixa}>
        <p className={estilos.selo}>{empresa.nomeCurto}</p>
        <h1 className={estilos.marca}>Painel administrativo</h1>
        <p className={estilos.subtitulo}>
          Entre com sua conta para gerenciar o catálogo de imóveis.
        </p>
        <FormularioLogin />
      </div>
    </div>
  );
}
