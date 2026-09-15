export type TipoImovel =
  | "casa"
  | "apartamento"
  | "terreno"
  | "comercial"
  | "sobrado";

export type StatusImovel =
  | "disponivel"
  | "reservado"
  | "em_negociacao"
  | "vendido"
  | "indisponivel";

export interface MidiaPublica {
  tipo: "imagem" | "video" | "planta";
  url: string;
  descricao: string | null;
}

export interface Imovel {
  id: string;
  codigo: string;
  slug: string;
  titulo: string;
  tipo: TipoImovel;
  status: StatusImovel;
  destaque?: boolean;
  recente?: boolean;
  cidade: string | null;
  bairro: string | null;
  estado: string | null;
  nomeCondominio: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  pontoReferencia: string | null;
  exibirEnderecoExato: boolean;
  preco: number | null;
  precoAnterior?: number | null;
  condominio?: number | null;
  iptu?: number | null;
  periodicidadeIptu?: "mensal" | "anual" | null;
  outrasDespesas?: number | null;
  area: number | null;
  areaTerreno?: number | null;
  quartos: number | null;
  suites?: number | null;
  banheiros: number | null;
  vagas: number | null;
  descricao: string;
  caracteristicas: string[];
  midias: MidiaPublica[];
  aceitaFinanciamento?: boolean | null;
  aceitaPermuta?: boolean | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FiltroImoveisEstado {
  tipo: TipoImovel | "";
  cidade: string;
  bairro: string;
  precoMin: string;
  precoMax: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  areaMin: string;
  busca: string;
}
