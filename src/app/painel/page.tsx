import Link from "next/link";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { obterResumoDoPainel } from "@/lib/imoveis/repositorio";
import estilos from "./painel.module.css";

export default async function PaginaPainel() {
  const sessao = await exigirSessaoPainel();
  const { total, publicados, rascunhos } = await obterResumoDoPainel();

  return (
    <main className={estilos.inicio}>
      <header className={estilos.inicioCabecalho}>
        <div>
          <h1>Visão geral</h1>
          <p>Acompanhe o catálogo e continue de onde parou.</p>
        </div>
        <Link href="/painel/imoveis/novo" className="botao botao-primario">
          Adicionar imóvel
        </Link>
      </header>

      <section className={estilos.metricas} aria-label="Resumo do catálogo">
        <div className={estilos.metrica}>
          <span>Total de imóveis</span>
          <strong>{total}</strong>
        </div>
        <div className={estilos.metrica}>
          <span>Publicados</span>
          <strong>{publicados}</strong>
        </div>
        <div className={estilos.metrica}>
          <span>Rascunhos</span>
          <strong>{rascunhos}</strong>
        </div>
      </section>

      <section className={estilos.atalhosBloco} aria-labelledby="atalhos-painel">
        <h2 id="atalhos-painel">Acesso rápido</h2>
        <div className={estilos.atalhos}>
        <Link href="/painel/imoveis" className={estilos.atalho}>
          <strong>Ver imóveis</strong>
          <span>Consulte, edite ou remova imóveis do catálogo.</span>
        </Link>
        <Link href="/painel/imoveis/novo" className={estilos.atalho}>
          <strong>Novo imóvel</strong>
          <span>Cadastre um imóvel novo como rascunho ou publicado.</span>
        </Link>
        {sessao.desenvolvedor ? (
          <Link href="/painel/usuarios" className={estilos.atalho}>
            <strong>Usuários</strong>
            <span>Crie acessos e acompanhe o primeiro login.</span>
          </Link>
        ) : null}
        <Link href="/" className={estilos.atalho}>
          <strong>Abrir o site</strong>
          <span>Veja como o catálogo aparece para os visitantes.</span>
        </Link>
        </div>
      </section>
    </main>
  );
}
