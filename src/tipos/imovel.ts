export type Finalidade = "venda" | "aluguel";

export type TipoImovel =
  | "casa"
  | "apartamento"
  | "terreno"
  | "comercial"
  | "sobrado";

export type StatusImovel = "disponivel" | "reservado" | "indisponivel";

export interface Imovel {
  id: string;
  codigo: string;
  slug: string;
  titulo: string;
  finalidade: Finalidade;
  tipo: TipoImovel;
  status: StatusImovel;
  destaque?: boolean;
  recente?: boolean;
  cidade: string;
  bairro: string;
  estado: string;
  preco: number | null;
  precoAnterior?: number | null;
  condominio?: number | null;
  iptu?: number | null;
  area: number | null;
  areaTerreno?: number | null;
  quartos: number | null;
  suites?: number | null;
  banheiros: number | null;
  vagas: number | null;
  descricao: string;
  caracteristicas: string[];
  fotos: string[];
  financiamento?: {
    titulo: string;
    itens: { rotulo: string; valor: string }[];
  };
  mcmv?: boolean;
  criadoEm: string;
}

export interface Empreendimento {
  id: string;
  slug: string;
  nome: string;
  tipo: "casa" | "apartamento";
  cidade: string;
  bairro: string;
  estado: string;
  precoApartir: number;
  area: number | null;
  quartos: number | null;
  entrega?: string;
  detalhesExtras?: string[];
  descricao: string;
  caracteristicas: string[];
  fotos: string[];
  mcmv?: boolean;
}

export interface FiltroImoveisEstado {
  finalidade: Finalidade | "";
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
