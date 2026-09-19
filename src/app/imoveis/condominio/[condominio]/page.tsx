import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaListagemSeo } from "@/componentes/seo/PaginaListagemSeo";
import { MINIMO_INDEXAVEL_LOCAL, nomeCidadeCurto } from "@/dados/seo";
import {
  calcularEstatisticasListagem,
  listarImoveisPorCondominio,
  resolverCondominioPorSlug,
} from "@/dados/imoveis";
import {
  schemaBreadcrumbList,
  schemaItemList,
} from "@/lib/seo/dados-estruturados";
import {
  caminhoCidade,
  caminhoCondominio,
  criarMetadataPagina,
} from "@/lib/seo/metadata";
import { criarSlug } from "@/lib/seo/slug";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ condominio: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { condominio: slug } = await params;
  const resolvido = await resolverCondominioPorSlug(slug);
  if (!resolvido) {
    return {
      title: "Condomínio não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const imoveis = await listarImoveisPorCondominio(slug);
  const indexavel = imoveis.length >= MINIMO_INDEXAVEL_LOCAL;
  const cidadeCurta = resolvido.cidade
    ? nomeCidadeCurto(resolvido.cidade)
    : "Rio Preto";

  return criarMetadataPagina({
    title: `Imóveis à Venda no ${resolvido.nome}, ${cidadeCurta}`,
    description: `Veja imóveis à venda no condomínio ${resolvido.nome}${resolvido.cidade ? `, em ${resolvido.cidade}` : ""}. Fotos, valores e atendimento com Kalebe Corretor.`,
    canonical: caminhoCondominio(slug),
    index: indexavel,
    follow: true,
  });
}

export default async function PaginaCondominio({ params }: Props) {
  const { condominio: slug } = await params;
  if (!/^[a-z0-9-]{1,160}$/.test(slug)) notFound();

  const resolvido = await resolverCondominioPorSlug(slug);
  if (!resolvido) notFound();

  const imoveis = await listarImoveisPorCondominio(slug);
  const disponiveis = imoveis.filter((item) => item.status === "disponivel");
  if (disponiveis.length === 0) notFound();

  const stats = calcularEstatisticasListagem(imoveis);
  const caminho = caminhoCondominio(slug);
  const slugCidade = resolvido.cidade ? criarSlug(resolvido.cidade) : null;

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
      descricao={`${stats.total} ${stats.total === 1 ? "opção publicada" : "opções publicadas"} no condomínio${resolvido.cidade ? ` · ${resolvido.cidade}` : ""}.`}
      textoUtil={`Confira os imóveis disponíveis no condomínio ${resolvido.nome}${resolvido.cidade ? `, em ${resolvido.cidade}` : ""}. Veja fotos e valores e fale com o Kalebe para agendar uma visita.`}
      imoveis={imoveis}
      estatisticas={stats}
      linksRelacionados={[
        ...(slugCidade
          ? [{ href: caminhoCidade(slugCidade), rotulo: resolvido.cidade! }]
          : []),
        { href: "/imoveis", rotulo: "Catálogo completo" },
      ]}
      schemas={[
        schemaBreadcrumbList(breadcrumbs),
        schemaItemList(
          `Imóveis no ${resolvido.nome}`,
          caminho,
          disponiveis,
        ),
      ]}
      mensagemWhatsApp={`Olá, Kalebe! Quero ver imóveis no condomínio ${resolvido.nome}.`}
    />
  );
}
