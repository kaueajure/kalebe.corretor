import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaListagemSeo } from "@/componentes/seo/PaginaListagemSeo";
import { TIPOS_SEO } from "@/dados/seo";
import {
  calcularEstatisticasListagem,
  listarImoveisPorCidade,
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
  params: Promise<{ cidade: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade: slug } = await params;
  const nome = await resolverCidadePorSlug(slug);
  if (!nome) return { title: "Cidade não encontrada", robots: { index: false, follow: false } };

  const imoveis = await listarImoveisPorCidade(slug);
  const disponiveisCount = totalDisponiveis(imoveis);
  const indexavel = disponiveisCount > 0;

  return criarMetadataPagina({
    title: `Imóveis à Venda em ${nome}`,
    description: `Encontre casas, apartamentos, sobrados e terrenos à venda em ${nome}. Veja fotos, valores e fale diretamente com Kalebe Corretor.`,
    canonical: caminhoCidade(slug),
    index: indexavel,
    follow: true,
  });
}

export default async function PaginaCidade({ params }: Props) {
  const { cidade: slug } = await params;
  if (!/^[a-z0-9-]{1,160}$/.test(slug)) notFound();

  const nome = await resolverCidadePorSlug(slug);
  if (!nome) notFound();

  const imoveis = await listarImoveisPorCidade(slug);
  const disponiveis = imoveis.filter((item) => item.status === "disponivel");
  const stats = calcularEstatisticasListagem(imoveis);
  const caminho = caminhoCidade(slug);

  const tiposPresentes = TIPOS_SEO.filter((tipo) =>
    disponiveis.some((item) => item.tipo === tipo.tipo),
  );

  const breadcrumbs = [
    { nome: "Início", url: "/" },
    { nome: "Imóveis", url: "/imoveis" },
    { nome },
  ];

  return (
    <PaginaListagemSeo
      breadcrumbs={breadcrumbs}
      titulo={`Imóveis à venda em ${nome}`}
      descricao={`Opções publicadas em ${nome}. Compare fotos, preço e metragem.`}
      textoUtil={`Encontre casas, apartamentos, terrenos e sobrados à venda em ${nome}. Consulte fotos, valores e detalhes dos imóveis disponíveis e fale diretamente com Kalebe para agendar uma visita.`}
      imoveis={imoveis}
      estatisticas={stats}
      linksRelacionados={tiposPresentes.map((tipo) => ({
        href: caminhoCidadeTipo(slug, tipo.slug),
        rotulo: tipo.plural,
      }))}
      schemas={[
        schemaBreadcrumbList(breadcrumbs),
        schemaItemList(`Imóveis em ${nome}`, caminho, disponiveis),
      ]}
      mensagemWhatsApp={`Olá, Kalebe! Quero ver imóveis em ${nome}.`}
    />
  );
}
