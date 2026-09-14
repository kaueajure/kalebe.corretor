import Link from "next/link";
import { Ordenacao } from "@/componentes/filtroImoveis/Ordenacao";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { FiltroImoveis } from "@/componentes/filtroImoveis/FiltroImoveis";
import { listarImoveisPublicados } from "@/dados/imoveis";
import { filtrarImoveis, filtroInicial } from "@/lib/formatadores";
import type { FiltroImoveisEstado } from "@/tipos/imovel";
import estilos from "./imoveis.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imóveis à venda e para alugar",
  description:
    "Lista de imóveis em São José do Rio Preto, Mirassol e Bady Bassitt. Filtre por tipo, preço, quartos e bairro.",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function valorParam(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] || "";
  return valor || "";
}

export default async function PaginaImoveis({ searchParams }: Props) {
  const [params, imoveis] = await Promise.all([
    searchParams,
    listarImoveisPublicados(),
  ]);
  const filtro: FiltroImoveisEstado = {
    ...filtroInicial,
    finalidade: valorParam(params.finalidade) as FiltroImoveisEstado["finalidade"],
    tipo: valorParam(params.tipo) as FiltroImoveisEstado["tipo"],
    cidade: valorParam(params.cidade),
    bairro: valorParam(params.bairro),
    precoMin: valorParam(params.precoMin),
    precoMax: valorParam(params.precoMax),
    quartos: valorParam(params.quartos),
    banheiros: valorParam(params.banheiros),
    vagas: valorParam(params.vagas),
    areaMin: valorParam(params.areaMin),
    busca: valorParam(params.busca),
  };

  const resultados = filtrarImoveis(imoveis, filtro);
  const cidades = [...new Set(imoveis.map((i) => i.cidade))].sort();
  const bairros = [...new Set(imoveis.map((i) => i.bairro))].sort();
  const ordem = valorParam(params.ordem);
  resultados.sort((a, b) => {
    if (ordem === "menor-preco") return (a.preco ?? Infinity) - (b.preco ?? Infinity);
    if (ordem === "maior-preco") return (b.preco ?? -Infinity) - (a.preco ?? -Infinity);
    if (ordem === "recentes") return b.criadoEm.localeCompare(a.criadoEm);
    return (
      Number(b.status === "disponivel") - Number(a.status === "disponivel") ||
      Number(Boolean(b.destaque)) - Number(Boolean(a.destaque))
    );
  });

  const titulo = filtro.finalidade === "aluguel"
    ? "Imóveis para alugar"
    : filtro.finalidade === "venda"
      ? "Imóveis à venda"
      : "Imóveis";
  const local = filtro.cidade ? ` em ${filtro.cidade}` : " na região";

  return (
    <div className={estilos.pagina}>
      <div className="conteudo">
        <header className={estilos.cabecalho}>
          <h1 className="titulo-secao">
            {titulo}
            {local}
          </h1>
          <p className="texto-secao">
            Compare fotos, preço e metragem. Quando quiser visitar, fale com o
            Kalebe.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="mensagem-estado">
              <p>Carregando filtros…</p>
            </div>
          }
        >
          <FiltroImoveis
            cidades={cidades}
            bairros={bairros}
            total={resultados.length}
            localizacoes={imoveis.map(({ cidade, bairro }) => ({ cidade, bairro }))}
          />
        </Suspense>

        <div className={estilos.resultadoTopo}>
          <p className={estilos.totalDesktop}>
            <strong>{resultados.length}</strong>{" "}
            {resultados.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
          </p>
          <Suspense>
            <Ordenacao />
          </Suspense>
        </div>

        {resultados.length === 0 ? (
          <div className="mensagem-estado">
            <h2>Nenhum imóvel com esses filtros</h2>
            <p>Limpe a busca ou troque a cidade para ver as opções disponíveis.</p>
            <Link href="/imoveis" className="botao botao-secundario">
              Ver todos os imóveis
            </Link>
          </div>
        ) : (
          <div className="grade-imoveis">
            {resultados.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
