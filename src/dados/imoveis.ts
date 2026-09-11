import type { Imovel } from "@/tipos/imovel";

const fotosJardimArroio = Array.from(
  { length: 18 },
  (_, i) => `/imagens/imoveis/jardim-arroio/${String(i + 1).padStart(2, "0")}.webp`
);

const fotosSaoThomas = Array.from(
  { length: 4 },
  (_, i) => `/imagens/imoveis/sao-thomas/${String(i + 1).padStart(2, "0")}.webp`
);

export const imoveis: Imovel[] = [
  {
    id: "1",
    codigo: "KA-001",
    slug: "casa-jardim-arroio",
    titulo: "Casa no Jardim Arroio",
    finalidade: "venda",
    tipo: "casa",
    status: "disponivel",
    destaque: true,
    recente: true,
    cidade: "São José do Rio Preto",
    bairro: "Jardim Arroio",
    estado: "SP",
    preco: 320000,
    area: 150,
    areaTerreno: 200,
    quartos: 3,
    suites: 1,
    banheiros: 2,
    vagas: 2,
    descricao:
      "Casa com 150 m² construídos em terreno de 200 m² no Jardim Arroio. Três dormitórios, sendo uma suíte, garagem coberta para dois carros e acabamento completo. Imóvel pronto para morar, com financiamento disponível.",
    caracteristicas: [
      "Sanca de gesso em todos os cômodos",
      "Portão eletrônico",
      "Garagem coberta para 2 veículos",
      "Ar-condicionado nos ambientes",
      "Porcelanato",
      "Acabamento de alto padrão",
    ],
    fotos: fotosJardimArroio,
    financiamento: {
      titulo: "Financiamento disponível",
      itens: [
        { rotulo: "Área construída", valor: "150 m²" },
        { rotulo: "Terreno", valor: "200 m²" },
        { rotulo: "Dormitórios", valor: "3 (1 suíte)" },
      ],
    },
    criadoEm: "2025-08-10",
  },
  {
    id: "2",
    codigo: "KA-002",
    slug: "casa-bairro-sao-thomas",
    titulo: "Casa no Bairro São Thomas",
    finalidade: "venda",
    tipo: "casa",
    status: "disponivel",
    destaque: true,
    recente: true,
    cidade: "São José do Rio Preto",
    bairro: "São Thomas",
    estado: "SP",
    preco: 215000,
    precoAnterior: 260000,
    area: 50,
    areaTerreno: 208,
    quartos: 2,
    suites: 0,
    banheiros: 1,
    vagas: 1,
    mcmv: true,
    descricao:
      "Casa reformada no bairro São Thomas, com terreno de 208 m² e 50 m² construídos. Dois dormitórios, quintal amplo e estrutura pronta para quem busca financiar pelo Minha Casa Minha Vida. Avaliada pela Caixa em R$ 260.000.",
    caracteristicas: [
      "Imóvel reformado com pintura nova",
      "Luminárias de teto incluídas",
      "Quintal amplo",
      "Cozinha integrada à sala",
      "Banheiro com box Blindex",
      "Cerca elétrica",
      "Alarme",
    ],
    fotos: fotosSaoThomas,
    financiamento: {
      titulo: "Financiamento MCMV",
      itens: [
        { rotulo: "Avaliado pela Caixa", valor: "R$ 260.000" },
        { rotulo: "Entrada aproximada", valor: "R$ 7.000" },
        { rotulo: "Renda sugerida", valor: "A partir de R$ 4.500" },
      ],
    },
    criadoEm: "2025-08-18",
  },
  {
    id: "3",
    codigo: "KA-003",
    slug: "casa-moderna-alto-padrao",
    titulo: "Casa moderna",
    finalidade: "venda",
    tipo: "casa",
    status: "disponivel",
    destaque: true,
    recente: false,
    cidade: "São José do Rio Preto",
    bairro: "Zona Sul",
    estado: "SP",
    preco: null,
    area: null,
    quartos: null,
    banheiros: null,
    vagas: null,
    descricao:
      "Casa de alto padrão em bairro tranquilo de São José do Rio Preto. Valor e detalhes sob consulta. Entre em contato para receber fotos adicionais, planta e condições de visita.",
    caracteristicas: [
      "Acabamento diferenciado",
      "Projeto moderno",
      "Localização em bairro residencial",
    ],
    fotos: ["/imagens/imoveis/casa-moderna/01.webp"],
    criadoEm: "2025-07-22",
  },
];

export function obterImovelPorSlug(slug: string): Imovel | undefined {
  return imoveis.find((imovel) => imovel.slug === slug);
}

export function obterImoveisSimilares(imovel: Imovel, limite = 3): Imovel[] {
  return imoveis
    .filter(
      (item) =>
        item.id !== imovel.id &&
        item.status === "disponivel" &&
        (item.tipo === imovel.tipo || item.cidade === imovel.cidade)
    )
    .slice(0, limite);
}

export function listarCidades(): string[] {
  return [...new Set(imoveis.map((imovel) => imovel.cidade))].sort();
}

export function listarBairros(cidade?: string): string[] {
  return [
    ...new Set(
      imoveis
        .filter((imovel) => !cidade || imovel.cidade === cidade)
        .map((imovel) => imovel.bairro)
    ),
  ].sort();
}
