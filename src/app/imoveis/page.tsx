import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Ordenacao } from "@/componentes/filtroImoveis/Ordenacao";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { FiltroImoveis } from "@/componentes/filtroImoveis/FiltroImoveis";
import { DadosEstruturados } from "@/componentes/seo/DadosEstruturados";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import { listarImoveisPublicados } from "@/dados/imoveis";
import { filtrarImoveis, filtroInicial, linkWhatsApp } from "@/lib/formatadores";
import { schemaItemList } from "@/lib/seo/dados-estruturados";
import {
  caminhoCidade,
  caminhoCidadeTipo,
  criarMetadataPagina,
} from "@/lib/seo/metadata";
import type { FiltroImoveisEstado } from "@/tipos/imovel";
import estilos from "./imoveis.module.css";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function valorParam(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] || "";
  return valor || "";
}

const CHAVES_FILTRO = [
  "tipo",
  "cidade",
  "bairro",
  "quartos",
  "banheiros",
  "vagas",
  "precoMin",
  "precoMax",
  "areaMin",
  "busca",
  "ordem",
] as const;

function temFiltroOuOrdenacao(
  params: Record<string, string | string[] | undefined>,
) {
  return CHAVES_FILTRO.some((chave) => {
    const valor = valorParam(params[chave]);
    return Boolean(valor);
  });
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const filtrado = temFiltroOuOrdenacao(params);

  if (filtrado) {
    return criarMetadataPagina({
      title: "Imóveis à Venda em São José do Rio Preto e Região",
      description:
        "Lista de imóveis em São José do Rio Preto, Mirassol e Bady Bassitt. Filtre por tipo, preço, quartos e bairro.",
      canonical: "/imoveis",
      index: false,
      follow: true,
    });
  }

  return criarMetadataPagina({
    title: "Imóveis à Venda em São José do Rio Preto e Região",
    description:
      "Casas, apartamentos, sobrados e terrenos à venda em São José do Rio Preto, Mirassol e Bady Bassitt. Filtre por tipo, preço, quartos e bairro.",
    canonical: "/imoveis",
    index: true,
    follow: true,
  });
}

export default async function PaginaImoveis({ searchParams }: Props) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const params = await searchParams;
  if (Object.hasOwn(params, "finalidade")) {
    const limpos = new URLSearchParams();
    for (const [chave, valor] of Object.entries(params)) {
      if (chave === "finalidade" || valor === undefined) continue;
      for (const item of Array.isArray(valor) ? valor : [valor]) {
        limpos.append(chave, item);
      }
    }
    redirect(`/imoveis${limpos.size ? `?${limpos}` : ""}`);
  }
  const imoveis = await listarImoveisPublicados();
  const filtro: FiltroImoveisEstado = {
    ...filtroInicial,
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
  const cidades = [
    ...new Set(
      imoveis
        .map((i) => i.cidade)
        .filter((item): item is string => Boolean(item)),
    ),
  ].sort();
  const bairros = [
    ...new Set(
      imoveis
        .map((i) => i.bairro)
        .filter((item): item is string => Boolean(item)),
    ),
  ].sort();
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

  const filtrado = temFiltroOuOrdenacao(params);
  const titulo = "Imóveis à venda";
  const local = filtro.cidade ? ` em ${filtro.cidade}` : " na região";

  return (
    <>
      {!filtrado ? (
        <DadosEstruturados
          nonce={nonce}
          dados={schemaItemList("Imóveis à venda", "/imoveis", resultados)}
        />
      ) : null}
      <div className="pagina-interna">
        <div className={`conteudo corpo-pagina ${estilos.corpo}`}>
          <header className="intro-pagina">
            <p className="rotulo-secao">Catálogo</p>
            <h1 className="titulo-secao">
              {titulo}
              {local}
            </h1>
            <p className="texto-secao">
              Compare fotos, preço e metragem. Quando quiser visitar, fale com o
              Kalebe.
            </p>
          </header>

          <div className={estilos.atalhos} aria-label="Buscas rápidas">
            <Link href={caminhoCidadeTipo("sao-jose-do-rio-preto", "casas")}>
              <Icone nome="casa" size={18} />
              Casas
            </Link>
            <Link
              href={caminhoCidadeTipo("sao-jose-do-rio-preto", "apartamentos")}
            >
              <Icone nome="predio" size={18} />
              Apartamentos
            </Link>
            <Link href={caminhoCidade("sao-jose-do-rio-preto")}>
              <Icone nome="local" size={18} />
              Rio Preto
            </Link>
          </div>

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
              localizacoes={imoveis.map(({ cidade, bairro }) => ({
                cidade,
                bairro,
              }))}
            />
          </Suspense>

          <div className={estilos.resultadoTopo}>
            <p className={estilos.totalDesktop}>
              <strong>{resultados.length}</strong>{" "}
              {resultados.length === 1
                ? "imóvel encontrado"
                : "imóveis encontrados"}
            </p>
            <Suspense>
              <Ordenacao />
            </Suspense>
          </div>

          {resultados.length === 0 ? (
            <div className="mensagem-estado">
              <h2>Nenhum imóvel com esses filtros</h2>
              <p>
                Limpe a busca ou troque a cidade para ver as opções disponíveis.
              </p>
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

      <section className="faixa-cta">
        <div className={`conteudo faixa-cta-interior`}>
          <div>
            <h2>Não achou o que procura?</h2>
            <p>
              Me diga a cidade, o tipo e a faixa de valor. Eu busco opções com
              você.
            </p>
          </div>
          <a
            href={linkWhatsApp(
              empresa.whatsapp,
              "Olá, Kalebe! Não encontrei o que procuro na lista e gostaria de ajuda.",
            )}
            className="botao botao-secundario"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir ajuda <Icone nome="seta" size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
