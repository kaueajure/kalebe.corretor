import type { Metadata } from "next";
import { Suspense } from "react";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { FiltroImoveis } from "@/componentes/filtroImoveis/FiltroImoveis";
import {
  listarBairros,
  listarCidades,
  listarImoveisPublicados,
} from "@/dados/imoveis";
import { filtrarImoveis, filtroInicial } from "@/lib/formatadores";
import type { FiltroImoveisEstado } from "@/tipos/imovel";
import estilos from "./imoveis.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imóveis à venda e para alugar",
  description:
    "Lista de imóveis em São José do Rio Preto, Mirassol e região. Filtre por tipo, preço, quartos e bairro.",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function valorParam(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] || "";
  return valor || "";
}

export default async function PaginaImoveis({ searchParams }: Props) {
  const params = await searchParams;
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

  const imoveis = await listarImoveisPublicados();
  const resultados = filtrarImoveis(imoveis, filtro);
  const [cidades, bairros] = await Promise.all([
    listarCidades(),
    listarBairros(filtro.cidade || undefined),
  ]);

  return (
    <div className={estilos.pagina}>
      <div className="conteudo">
        <header className={estilos.cabecalho}>
          <p className="rotulo-secao">Catálogo</p>
          <h1 className="titulo-secao">Imóveis</h1>
          <div className="divisor" />
          <p className="texto-secao">
            Use os filtros para encontrar opções por finalidade, localização e
            características.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="mensagem-estado">
              <p>Carregando filtros...</p>
            </div>
          }
        >
          <FiltroImoveis
            cidades={cidades}
            bairros={bairros}
            total={resultados.length}
          />
        </Suspense>

        <p className={estilos.totalDesktop}>
          <strong>{resultados.length}</strong>{" "}
          {resultados.length === 1
            ? "imóvel encontrado"
            : "imóveis encontrados"}
        </p>

        {resultados.length === 0 ? (
          <div className="mensagem-estado">
            <h2>Nenhum imóvel encontrado</h2>
            <p>
              Ajuste os filtros ou limpe a busca para ver todas as opções
              disponíveis.
            </p>
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
