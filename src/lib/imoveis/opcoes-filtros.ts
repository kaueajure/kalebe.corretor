import { nomesLocaisUnicos } from "@/lib/localizacoes";
import type { Imovel, TipoImovel } from "@/tipos/imovel";

type DadosFiltro = Pick<Imovel, "cidade" | "bairro" | "tipo" | "preco" | "quartos" | "banheiros" | "vagas">;

export interface OpcoesFiltros {
  cidades: string[];
  bairros: string[];
  tipos: TipoImovel[];
  precos: number[];
  quartos: number[];
  banheiros: number[];
  vagas: number[];
}

function numerosUnicos(valores: (number | null)[]): number[] {
  return [...new Set(valores.filter((valor): valor is number => valor !== null && Number.isFinite(valor) && valor > 0))]
    .sort((a, b) => a - b);
}

/** A lista recebida deve conter somente os anúncios visíveis no catálogo público. */
export function obterOpcoesFiltros(imoveis: DadosFiltro[]): OpcoesFiltros {
  return {
    cidades: nomesLocaisUnicos(imoveis.map((imovel) => imovel.cidade)),
    bairros: nomesLocaisUnicos(imoveis.map((imovel) => imovel.bairro)),
    tipos: [...new Set(imoveis.map((imovel) => imovel.tipo))].sort(),
    precos: numerosUnicos(imoveis.map((imovel) => imovel.preco)),
    quartos: numerosUnicos(imoveis.map((imovel) => imovel.quartos)),
    banheiros: numerosUnicos(imoveis.map((imovel) => imovel.banheiros)),
    vagas: numerosUnicos(imoveis.map((imovel) => imovel.vagas)),
  };
}
