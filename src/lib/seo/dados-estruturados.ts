import { empresa } from "@/dados/empresa";
import { SITE_URL } from "@/lib/seo/metadata";
import type { Imovel } from "@/tipos/imovel";

export interface ItemBreadcrumb {
  nome: string;
  url?: string;
}

export function schemaWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: empresa.nome,
    url: SITE_URL,
    inLanguage: "pt-BR",
    publisher: {
      "@type": "Person",
      name: empresa.nomeCurto,
      url: SITE_URL,
    },
  };
}

export function schemaPerson() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: empresa.nomeCurto,
    alternateName: empresa.nome,
    jobTitle: "Corretor de imóveis",
    telephone: `+${empresa.telefoneLink}`,
    url: `${SITE_URL}/sobre`,
    image: `${SITE_URL}/imagens/sobre/kalebe.webp`,
    identifier: empresa.creci,
    knowsAbout: ["Imóveis à venda", "Financiamento habitacional"],
    areaServed: empresa.cidadesAtendimento.map((cidade) => ({
      "@type": "City",
      name: cidade,
      containedInPlace: {
        "@type": "State",
        name: "São Paulo",
        addressCountry: "BR",
      },
    })),
    worksFor: {
      "@type": "Organization",
      name: empresa.nome,
      url: SITE_URL,
    },
  };
}

export function schemaOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: empresa.nome,
    url: SITE_URL,
    logo: `${SITE_URL}/imagens/sobre/kalebe.webp`,
    telephone: `+${empresa.telefoneLink}`,
    areaServed: empresa.cidadesAtendimento.map((cidade) => ({
      "@type": "City",
      name: cidade,
    })),
  };
}

export function schemaBreadcrumbList(itens: ItemBreadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: item.nome,
      ...(item.url
        ? { item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}` }
        : {}),
    })),
  };
}

export function schemaItemList(
  nome: string,
  caminho: string,
  imoveis: Imovel[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: nome,
    url: `${SITE_URL}${caminho}`,
    numberOfItems: imoveis.length,
    itemListElement: imoveis.slice(0, 30).map((imovel, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      url: `${SITE_URL}/imoveis/${imovel.slug}`,
      name: imovel.titulo,
    })),
  };
}

function disponibilidadeSchema(status: Imovel["status"]) {
  switch (status) {
    case "disponivel":
      return "https://schema.org/InStock";
    case "reservado":
    case "em_negociacao":
      return "https://schema.org/LimitedAvailability";
    case "vendido":
      return "https://schema.org/SoldOut";
    default:
      return "https://schema.org/OutOfStock";
  }
}

export function schemaRealEstateListing(imovel: Imovel) {
  const url = `${SITE_URL}/imoveis/${imovel.slug}`;
  const imagens = imovel.midias
    .filter((midia) => midia.tipo === "imagem")
    .map((midia) =>
      midia.url.startsWith("http") ? midia.url : `${SITE_URL}${midia.url}`,
    );

  const endereco: Record<string, string> = {
    "@type": "PostalAddress",
    addressCountry: "BR",
  };
  if (imovel.cidade) endereco.addressLocality = imovel.cidade;
  if (imovel.estado) endereco.addressRegion = imovel.estado;
  if (imovel.exibirEnderecoExato && imovel.logradouro) {
    endereco.streetAddress = [imovel.logradouro, imovel.numero]
      .filter(Boolean)
      .join(", ");
  } else if (imovel.bairro) {
    // Bairro público sem inventar rua exata.
    endereco.streetAddress = imovel.bairro;
  }

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: imovel.titulo,
    ...(imovel.descricao ? { description: imovel.descricao } : {}),
    url,
    datePosted: imovel.criadoEm,
    dateModified: imovel.atualizadoEm,
    ...(imagens.length ? { image: imagens } : {}),
    ...(imovel.preco !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: imovel.preco,
            url,
            availability: disponibilidadeSchema(imovel.status),
          },
        }
      : {}),
    ...((imovel.cidade || imovel.estado || imovel.bairro)
      ? { address: endereco }
      : {}),
  };
}

export function serializarJsonLd(dados: unknown): string {
  return JSON.stringify(dados).replace(/</g, "\\u003c");
}
