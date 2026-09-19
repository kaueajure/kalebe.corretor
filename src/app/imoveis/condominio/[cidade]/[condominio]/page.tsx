import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaListagemSeo } from "@/componentes/seo/PaginaListagemSeo";
import { MINIMO_INDEXAVEL_LOCAL, nomeCidadeCurto } from "@/dados/seo";
import {
  calcularEstatisticasListagem,
  listarImoveisPorCondominio,
  resolverCondominioPorSlug,
  totalDisponiveis,
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

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ cidade: string; condominio: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade: slugCidade, condominio: slugCondominio } = await params;
  const resolvido = await resolverCondominioPorSlug(slugCidade, slugCondominio);
  if (!resolvido || resolvido.total === 0) {
    return {
      title: "Condomínio não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const cidadeCurta = nomeCidadeCurto(resolvido.cidade);

  return criarMetadataPagina({
    title: `Imóveis à Venda no ${resolvido.nome}, ${cidadeCurta}`,
    description: `Veja imóveis à venda no condomínio ${resolvido.nome}, em ${resolvido.cidade}. Fotos, valores e atendimento com Kalebe Corretor.`,
    canonical: caminhoCondominio(slugCidade, slugCondominio),
    index: resolvido.total >= MINIMO_INDEXAVEL_LOCAL,
    follow: true,
  });
}

export default async function PaginaCondominio({ params }: Props) {
  const { cidade: slugCidade, condominio: slugCondominio } = await params;
  if (
    !/^[a-z0-9-]{1,160}$/.test(slugCidade) ||
    !/^[a-z0-9-]{1,160}$/.test(slugCondominio)
  ) {
    notFound();
  }

  const resolvido = await resolverCondominioPorSlug(slugCidade, slugCondominio);
  if (!resolvido || resolvido.total === 0) notFound();

  const imoveis = await listarImoveisPorCondominio(slugCidade, slugCondominio);
  const disponiveis = totalDisponiveis(imoveis);
  if (disponiveis === 0) notFound();

  const stats = calcularEstatisticasListagem(imoveis);
  const caminho = caminhoCondominio(slugCidade, slugCondominio);
  const imoveisDisponiveis = imoveis.filter(
    (item) => item.status === "disponivel",
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
      descricao={`${stats.total} ${stats.total === 1 ? "opção disponível" : "opções disponíveis"} no condomínio · ${resolvido.cidade}.`}
      textoUtil={`Confira os imóveis disponíveis no condomínio ${resolvido.nome}, em ${resolvido.cidade}. Veja fotos e valores e fale com o Kalebe para agendar uma visita.`}
      imoveis={imoveis}
      estatisticas={stats}
      linksRelacionados={[
        { href: caminhoCidade(slugCidade), rotulo: resolvido.cidade },
        { href: "/imoveis", rotulo: "Catálogo completo" },
      ]}
      schemas={[
        schemaBreadcrumbList(breadcrumbs),
        schemaItemList(
          `Imóveis no ${resolvido.nome}`,
          caminho,
          imoveisDisponiveis,
        ),
      ]}
      mensagemWhatsApp={`Olá, Kalebe! Quero ver imóveis no condomínio ${resolvido.nome}, ${resolvido.cidade}.`}
    />
  );
}
