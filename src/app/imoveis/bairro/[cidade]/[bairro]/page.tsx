import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaListagemSeo } from "@/componentes/seo/PaginaListagemSeo";
import { MINIMO_INDEXAVEL_LOCAL, TIPOS_SEO, nomeCidadeCurto } from "@/dados/seo";
import {
  calcularEstatisticasListagem,
  listarImoveisPorBairro,
  resolverBairroPorSlug,
  totalDisponiveis,
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

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ cidade: string; bairro: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade: slugCidade, bairro: slugBairro } = await params;
  const resolvido = await resolverBairroPorSlug(slugCidade, slugBairro);
  if (!resolvido || resolvido.total === 0) {
    return {
      title: "Bairro não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const cidadeCurta = nomeCidadeCurto(resolvido.cidade);

  return criarMetadataPagina({
    title: `Imóveis à Venda no ${resolvido.nome}, ${cidadeCurta}`,
    description: `Veja imóveis à venda no ${resolvido.nome}, ${resolvido.cidade}. Fotos, valores e atendimento direto com Kalebe Corretor.`,
    canonical: caminhoBairro(slugCidade, slugBairro),
    index: resolvido.total >= MINIMO_INDEXAVEL_LOCAL,
    follow: true,
  });
}

export default async function PaginaBairro({ params }: Props) {
  const { cidade: slugCidade, bairro: slugBairro } = await params;
  if (
    !/^[a-z0-9-]{1,160}$/.test(slugCidade) ||
    !/^[a-z0-9-]{1,160}$/.test(slugBairro)
  ) {
    notFound();
  }

  const resolvido = await resolverBairroPorSlug(slugCidade, slugBairro);
  if (!resolvido || resolvido.total === 0) notFound();

  const imoveis = await listarImoveisPorBairro(slugCidade, slugBairro);
  const disponiveis = totalDisponiveis(imoveis);
  if (disponiveis === 0) notFound();

  const stats = calcularEstatisticasListagem(imoveis);
  const caminho = caminhoBairro(slugCidade, slugBairro);
  const imoveisDisponiveis = imoveis.filter(
    (item) => item.status === "disponivel",
  );

  const tiposPresentes = TIPOS_SEO.filter((tipo) =>
    imoveisDisponiveis.some((item) => item.tipo === tipo.tipo),
  );

  const breadcrumbs = [
    { nome: "Início", url: "/" },
    { nome: "Imóveis", url: "/imoveis" },
    { nome: resolvido.cidade, url: caminhoCidade(slugCidade) },
    { nome: resolvido.nome },
  ];

  return (
    <PaginaListagemSeo
      breadcrumbs={breadcrumbs}
      titulo={`Imóveis à venda no ${resolvido.nome}`}
      descricao={`${stats.total} ${stats.total === 1 ? "opção disponível" : "opções disponíveis"} em ${resolvido.cidade}.`}
      textoUtil={`Confira os imóveis disponíveis no ${resolvido.nome}, em ${resolvido.cidade}. Compare fotos, valores e detalhes antes de agendar uma visita com o Kalebe.`}
      imoveis={imoveis}
      estatisticas={stats}
      linksRelacionados={[
        { href: caminhoCidade(slugCidade), rotulo: resolvido.cidade },
        ...tiposPresentes.slice(0, 3).map((tipo) => ({
          href: caminhoCidadeTipo(slugCidade, tipo.slug),
          rotulo: tipo.plural,
        })),
      ]}
      schemas={[
        schemaBreadcrumbList(breadcrumbs),
        schemaItemList(
          `Imóveis no ${resolvido.nome}`,
          caminho,
          imoveisDisponiveis,
        ),
      ]}
      mensagemWhatsApp={`Olá, Kalebe! Quero ver imóveis no ${resolvido.nome}, ${resolvido.cidade}.`}
    />
  );
}
