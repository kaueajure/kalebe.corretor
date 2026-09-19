import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaListagemSeo } from "@/componentes/seo/PaginaListagemSeo";
import { obterTipoSeoPorSlug } from "@/dados/seo";
import {
  calcularEstatisticasListagem,
  listarImoveisPorCidadeETipo,
  resolverCidadePorSlug,
  totalDisponiveis,
} from "@/dados/imoveis";
import {
  schemaBreadcrumbList,
  schemaItemList,
} from "@/lib/seo/dados-estruturados";
import {
  caminhoCidade,
  caminhoCidadeTipo,
  criarMetadataPagina,
} from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ cidade: string; tipo: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade: slugCidade, tipo: slugTipo } = await params;
  const nome = await resolverCidadePorSlug(slugCidade);
  const tipoSeo = obterTipoSeoPorSlug(slugTipo);
  if (!nome || !tipoSeo) {
    return { title: "Página não encontrada", robots: { index: false, follow: false } };
  }

  const imoveis = await listarImoveisPorCidadeETipo(slugCidade, tipoSeo.tipo);
  const disponiveisCount = totalDisponiveis(imoveis);

  return criarMetadataPagina({
    title: `${tipoSeo.tituloLista} em ${nome}`,
    description: tipoSeo.descricaoLista(nome),
    canonical: caminhoCidadeTipo(slugCidade, slugTipo),
    index: disponiveisCount > 0,
    follow: true,
  });
}

export default async function PaginaCidadeTipo({ params }: Props) {
  const { cidade: slugCidade, tipo: slugTipo } = await params;
  if (
    !/^[a-z0-9-]{1,160}$/.test(slugCidade) ||
    !/^[a-z0-9-]{1,80}$/.test(slugTipo)
  ) {
    notFound();
  }

  const nome = await resolverCidadePorSlug(slugCidade);
  const tipoSeo = obterTipoSeoPorSlug(slugTipo);
  if (!nome || !tipoSeo) notFound();

  const imoveis = await listarImoveisPorCidadeETipo(slugCidade, tipoSeo.tipo);
  const disponiveis = imoveis.filter((item) => item.status === "disponivel");
  if (disponiveis.length === 0) notFound();

  const stats = calcularEstatisticasListagem(imoveis);
  const caminho = caminhoCidadeTipo(slugCidade, slugTipo);

  const breadcrumbs = [
    { nome: "Início", url: "/" },
    { nome: "Imóveis", url: "/imoveis" },
    { nome, url: caminhoCidade(slugCidade) },
    { nome: tipoSeo.plural },
  ];

  return (
    <PaginaListagemSeo
      breadcrumbs={breadcrumbs}
      titulo={`${tipoSeo.plural} à venda em ${nome}`}
      descricao={`Compare as opções de ${tipoSeo.plural.toLowerCase()} publicadas em ${nome}.`}
      textoUtil={tipoSeo.textoIntro(nome)}
      imoveis={imoveis}
      estatisticas={stats}
      linksRelacionados={[
        { href: caminhoCidade(slugCidade), rotulo: `Todos em ${nome}` },
        { href: "/imoveis", rotulo: "Catálogo completo" },
      ]}
      schemas={[
        schemaBreadcrumbList(breadcrumbs),
        schemaItemList(
          `${tipoSeo.plural} em ${nome}`,
          caminho,
          disponiveis,
        ),
      ]}
      mensagemWhatsApp={`Olá, Kalebe! Quero ver ${tipoSeo.plural.toLowerCase()} em ${nome}.`}
    />
  );
}
