import Link from "next/link";
import { listarImoveisDoPainel } from "@/lib/imoveis/repositorio";
import estilos from "./painel.module.css";

export default async function PaginaPainel() {
  let total = 0;
  let publicados = 0;
  let rascunhos = 0;

  try {
    const imoveis = await listarImoveisDoPainel();
    total = imoveis.length;
    publicados = imoveis.filter((i) => i.situacao === "PUBLICADO").length;
    rascunhos = imoveis.filter((i) => i.situacao === "RASCUNHO").length;
  } catch {
    // Mantém zeros se o banco estiver indisponível.
  }

  return (
    <div className={estilos.inicio}>
      <header className={estilos.inicioCabecalho}>
        <h1>Bem-vindo ao painel</h1>
        <p>
          Gerencie o catálogo de imóveis publicados no site. Escolha um atalho
          abaixo para começar.
        </p>
      </header>

      <section className={estilos.metricas} aria-label="Resumo do catálogo">
        <div className={estilos.metrica}>
          <strong>{total}</strong>
          <span>Total de imóveis</span>
        </div>
        <div className={estilos.metrica}>
          <strong>{publicados}</strong>
          <span>Publicados</span>
        </div>
        <div className={estilos.metrica}>
          <strong>{rascunhos}</strong>
          <span>Rascunhos</span>
        </div>
      </section>

      <section className={estilos.atalhos} aria-label="Atalhos">
        <Link href="/painel/imoveis" className={estilos.atalho}>
          <strong>Ver imóveis</strong>
          <span>Consulte, edite ou remova imóveis do catálogo.</span>
        </Link>
        <Link href="/painel/imoveis/novo" className={estilos.atalho}>
          <strong>Novo imóvel</strong>
          <span>Cadastre um imóvel novo como rascunho ou publicado.</span>
        </Link>
        <Link href="/" className={estilos.atalho}>
          <strong>Abrir o site</strong>
          <span>Veja como o catálogo aparece para os visitantes.</span>
        </Link>
      </section>
    </div>
  );
}
