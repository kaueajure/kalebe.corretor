import type { Metadata } from "next";
import { empresa } from "@/dados/empresa";
import { obterTipoSeoPorTipo, nomeCidadeCurto } from "@/dados/seo";
import { formatarArea, formatarPreco, formatarTipo } from "@/lib/formatadores";
import type { Imovel } from "@/tipos/imovel";

export const SITE_URL = "https://kalebecorretor.com.br";
export const IMAGEM_OG_PADRAO = "/imagens/sobre/kalebe.webp";

interface OpcoesMetadataPagina {
  title: string;
  description: string;
  canonical: string;
  index?: boolean;
  follow?: boolean;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** Quando true, o title não recebe o template global (`| Kalebe`). */
  titleAbsoluto?: boolean;
}

export function criarMetadataPagina({
  title,
  description,
  canonical,
  index = true,
  follow = true,
  image = IMAGEM_OG_PADRAO,
  imageAlt = `${empresa.nome} — corretor de imóveis em ${empresa.cidade}`,
  type = "website",
  titleAbsoluto = false,
}: OpcoesMetadataPagina): Metadata {
  const tituloSocial = titleAbsoluto
    ? title
    : `${title} | ${empresa.nomeCurto}`;
  return {
    title: titleAbsoluto ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: { index, follow },
    openGraph: {
      type,
      locale: "pt_BR",
      siteName: empresa.nome,
      title: tituloSocial,
      description,
      url: canonical,
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: tituloSocial,
      description,
      images: [image],
    },
  };
}

function cidadeTitulo(cidade: string | null | undefined) {
  if (!cidade) return empresa.cidade;
  return nomeCidadeCurto(cidade) === cidade ? cidade : nomeCidadeCurto(cidade);
}

export function criarTituloImovel(imovel: Imovel): string {
  const tipo = obterTipoSeoPorTipo(imovel.tipo);
  const cidade = imovel.cidade ? cidadeTitulo(imovel.cidade) : null;
  const bairro = imovel.bairro?.trim() || null;
  const quartos =
    imovel.tipo !== "terreno" && imovel.quartos != null && imovel.quartos > 0
      ? imovel.quartos
      : null;

  const local = bairro
    ? cidade
      ? `no ${bairro}, ${cidade}`
      : `no ${bairro}`
    : cidade
      ? `em ${cidade}`
      : null;

  if (imovel.tipo === "terreno") {
    return local
      ? `Terreno à Venda ${local}`
      : "Terreno à Venda";
  }

  if (quartos != null) {
    return local
      ? `${tipo.singular} com ${quartos} ${quartos === 1 ? "Quarto" : "Quartos"} à Venda ${local}`
      : `${tipo.singular} com ${quartos} ${quartos === 1 ? "Quarto" : "Quartos"} à Venda`;
  }

  return local
    ? `${tipo.singular} à Venda ${local}`
    : `${tipo.singular} à Venda`;
}

export function criarDescricaoImovel(imovel: Imovel): string {
  const tipo = obterTipoSeoPorTipo(imovel.tipo);
  const partes: string[] = [];

  const localBase = [
    imovel.bairro ? `no ${imovel.bairro}` : null,
    imovel.cidade ? `em ${imovel.cidade}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  let abertura = `${tipo.singular} à venda`;
  if (localBase) abertura += ` ${localBase}`;
  partes.push(abertura);

  const detalhes: string[] = [];
  if (imovel.quartos != null && imovel.quartos > 0) {
    detalhes.push(
      `${imovel.quartos} ${imovel.quartos === 1 ? "quarto" : "quartos"}`,
    );
  }
  if (imovel.suites != null && imovel.suites > 0) {
    detalhes.push(
      `${imovel.suites} ${imovel.suites === 1 ? "suíte" : "suítes"}`,
    );
  }
  if (imovel.vagas != null && imovel.vagas > 0) {
    detalhes.push(
      `${imovel.vagas} ${imovel.vagas === 1 ? "vaga" : "vagas"}`,
    );
  }
  if (imovel.area != null && imovel.area > 0) {
    detalhes.push(formatarArea(imovel.area));
  } else if (imovel.areaTerreno != null && imovel.areaTerreno > 0) {
    detalhes.push(formatarArea(imovel.areaTerreno));
  }
  if (detalhes.length) {
    partes[0] = `${partes[0]}, com ${detalhes.join(", ")}`;
  }

  if (imovel.preco != null && imovel.preco > 0) {
    partes.push(`Valor: ${formatarPreco(imovel.preco)}`);
  }
  if (imovel.aceitaFinanciamento === true) {
    partes.push("Aceita financiamento");
  }

  partes.push("Veja fotos e fale com Kalebe Corretor.");
  return partes.join(". ").replace(/\.\./g, ".");
}

export function criarMetadataImovel(imovel: Imovel): Metadata {
  const title = criarTituloImovel(imovel);
  const description = criarDescricaoImovel(imovel);
  const caminho = `/imoveis/${imovel.slug}`;
  const foto = imovel.midias.find((midia) => midia.tipo === "imagem");
  return criarMetadataPagina({
    title,
    description,
    canonical: caminho,
    image: foto?.url ?? IMAGEM_OG_PADRAO,
    imageAlt:
      foto?.descricao ||
      `${formatarTipo(imovel.tipo)} à venda${imovel.bairro ? ` no ${imovel.bairro}` : ""}${imovel.cidade ? ` em ${imovel.cidade}` : ""}`,
    type: "article",
  });
}

export function caminhoCidade(slugCidade: string) {
  return `/imoveis/cidade/${slugCidade}`;
}

export function caminhoCidadeTipo(slugCidade: string, slugTipo: string) {
  return `/imoveis/cidade/${slugCidade}/${slugTipo}`;
}

export function caminhoBairro(slugCidade: string, slugBairro: string) {
  return `/imoveis/bairro/${slugCidade}/${slugBairro}`;
}

export function caminhoCondominio(slugCidade: string, slugCondominio: string) {
  return `/imoveis/condominio/${slugCidade}/${slugCondominio}`;
}

export function altImovel(imovel: Pick<Imovel, "tipo" | "bairro" | "cidade" | "titulo">, descricao?: string | null) {
  if (descricao?.trim()) return descricao.trim();
  const tipo = obterTipoSeoPorTipo(imovel.tipo).singular;
  const local = [
    imovel.bairro ? `no ${imovel.bairro}` : null,
    imovel.cidade ? `em ${imovel.cidade}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return local ? `${tipo} à venda ${local}` : imovel.titulo;
}
