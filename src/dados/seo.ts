import type { TipoImovel } from "@/tipos/imovel";

export interface TipoSeo {
  tipo: TipoImovel;
  slug: string;
  singular: string;
  plural: string;
  tituloLista: string;
  descricaoLista: (cidade: string) => string;
  textoIntro: (cidade: string) => string;
}

export const TIPOS_SEO: TipoSeo[] = [
  {
    tipo: "casa",
    slug: "casas",
    singular: "Casa",
    plural: "Casas",
    tituloLista: "Casas à Venda",
    descricaoLista: (cidade) =>
      `Veja casas à venda em ${cidade} com fotos, valores, localização e informações completas. Fale diretamente com Kalebe Corretor.`,
    textoIntro: (cidade) =>
      `Confira casas disponíveis em ${cidade}, com opções em diferentes bairros, faixas de preço e metragens.`,
  },
  {
    tipo: "apartamento",
    slug: "apartamentos",
    singular: "Apartamento",
    plural: "Apartamentos",
    tituloLista: "Apartamentos à Venda",
    descricaoLista: (cidade) =>
      `Apartamentos à venda em ${cidade}: compare fotos, metragem, vagas e valores. Atendimento direto com Kalebe, corretor CRECI-SP 322829 F.`,
    textoIntro: (cidade) =>
      `Encontre apartamentos à venda em ${cidade}. Veja as opções publicadas e converse com o Kalebe para agendar uma visita.`,
  },
  {
    tipo: "terreno",
    slug: "terrenos",
    singular: "Terreno",
    plural: "Terrenos",
    tituloLista: "Terrenos à Venda",
    descricaoLista: (cidade) =>
      `Terrenos à venda em ${cidade} com localização, metragem e valores atualizados. Consulte o Kalebe Corretor.`,
    textoIntro: (cidade) =>
      `Veja terrenos disponíveis em ${cidade} e compare localização e metragem antes de agendar uma visita.`,
  },
  {
    tipo: "sobrado",
    slug: "sobrados",
    singular: "Sobrado",
    plural: "Sobrados",
    tituloLista: "Sobrados à Venda",
    descricaoLista: (cidade) =>
      `Sobrados à venda em ${cidade} com fotos e detalhes. Fale com Kalebe Corretor para conhecer as opções.`,
    textoIntro: (cidade) =>
      `Confira sobrados à venda em ${cidade} e escolha as opções que fazem sentido para a sua busca.`,
  },
  {
    tipo: "comercial",
    slug: "imoveis-comerciais",
    singular: "Imóvel comercial",
    plural: "Imóveis comerciais",
    tituloLista: "Imóveis Comerciais à Venda",
    descricaoLista: (cidade) =>
      `Imóveis comerciais à venda em ${cidade}. Veja fotos, valores e fale com Kalebe Corretor.`,
    textoIntro: (cidade) =>
      `Opções comerciais disponíveis em ${cidade}, com informações para você avaliar e agendar uma visita.`,
  },
];

const porTipo = new Map(TIPOS_SEO.map((item) => [item.tipo, item]));
const porSlug = new Map(TIPOS_SEO.map((item) => [item.slug, item]));

export function obterTipoSeoPorTipo(tipo: TipoImovel): TipoSeo {
  return porTipo.get(tipo) ?? TIPOS_SEO[0];
}

export function obterTipoSeoPorSlug(slug: string): TipoSeo | undefined {
  return porSlug.get(slug);
}

export function nomeCidadeCurto(cidade: string): string {
  if (cidade === "São José do Rio Preto") return "Rio Preto";
  return cidade;
}

/** Mínimo de imóveis para indexar páginas de bairro/condomínio. */
export const MINIMO_INDEXAVEL_LOCAL = 2;
