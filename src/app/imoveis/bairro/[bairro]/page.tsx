import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaListagemSeo } from "@/componentes/seo/PaginaListagemSeo";
import { MINIMO_INDEXAVEL_LOCAL, TIPOS_SEO, nomeCidadeCurto } from "@/dados/seo";
import {
  calcularEstatisticasListagem,
  listarImoveisPorBairro,
  resolverBairroPorSlug,
} from "@/dados/imoveis";
import {
  schemaBreadcrumbList,
  schemaItemList,
} from "@/lib/seo/dados-estruturados";
import {
  caminhoBairro,
  caminhoCidade,
  caminhoCidadeTipo,
  criarMetadataPagina,
} from "@/lib/seo/metadata";
import { criarSlug } from "@/lib/seo/slug";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ bairro: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bairro: slug } = await params;
  const resolvido = await resolverBairroPorSlug(slug);
  if (!resolvido) {
    return { title: "Bairro não encontrado", robots: { index: false, follow: false } };
  }

  const imoveis = await listarImoveisPorBairro(slug);
  const indexavel = imoveis.length >= MINIMO_INDEXAVEL_LOCAL;
  const cidadeCurta = resolvido.cidade
    ? nomeCidadeCurto(resolvido.cidade)
    : "Rio Preto";

  return criarMetadataPagina({
    title: `Imóveis à Venda no ${resolvido.nome}, ${cidadeCurta}`,
    description: `Veja imóveis à venda no ${resolvido.nome}${resolvido.cidade ? `, ${resolvido.cidade}` : ""}. Fotos, valores e atendimento direto com Kalebe Corretor.`,
    canonical: caminhoBairro(slug),
    index: indexavel,
    follow: true,
  });
}

export default async function PaginaBairro({ params }: Props) {
  const { bairro: slug } = await params;
  if (!/^[a-z0-9-]{1,160}$/.test(slug)) notFound();

  const resolvido = await resolverBairroPorSlug(slug);
  if (!resolvido) notFound();

  const imoveis = await listarImoveisPorBairro(slug);
  const disponiveis = imoveis.filter((item) => item.status === "disponivel");
  if (disponiveis.length === 0) notFound();

  const stats = calcularEstatisticasListagem(imoveis);
  const caminho = caminhoBairro(slug);
  const slugCidade = resolvido.cidade ? criarSlug(resolvido.cidade) : null;

  const tiposPresentes = TIPOS_SEO.filter((tipo) =>
    disponiveis.some((item) => item.tipo === tipo.tipo),
  );

  const breadcrumbs = [
    { nome: "Início", url: "/" },
    { nome: "Imóveis", url: "/imoveis" },
    ...(resolvido.cidade && slugCidade
      ? [{ nome: resolvido.cidade, url: caminhoCidade(slugCidade) }]
      : []),
    { nome: resolvido.nome },
  ];

  return (
    <PaginaListagemSeo
      breadcrumbs={breadcrumbs}
      titulo={`Imóveis à venda no ${resolvido.nome}`}
      descricao={`${stats.total} ${stats.total === 1 ? "opção publicada" : "opções publicadas"}${resolvido.cidade ? ` em ${resolvido.cidade}` : ""}.`}
      textoUtil={`Confira os imóveis disponíveis no ${resolvido.nome}${resolvido.cidade ? `, em ${resolvido.cidade}` : ""}. Compare fotos, valores e detalhes antes de agendar uma visita com o Kalebe.`}
      imoveis={imoveis}
      estatisticas={stats}
      linksRelacionados={[
        ...(slugCidade
          ? [{ href: caminhoCidade(slugCidade), rotulo: resolvido.cidade! }]
          : []),
        ...tiposPresentes.slice(0, 3).map((tipo) => ({
          href: slugCidade
            ? caminhoCidadeTipo(slugCidade, tipo.slug)
            : `/imoveis?tipo=${tipo.tipo}`,
          rotulo: tipo.plural,
        })),
      ]}
      schemas={[
        schemaBreadcrumbList(breadcrumbs),
        schemaItemList(`Imóveis no ${resolvido.nome}`, caminho, disponiveis),
      ]}
      mensagemWhatsApp={`Olá, Kalebe! Quero ver imóveis no ${resolvido.nome}.`}
    />
  );
}
