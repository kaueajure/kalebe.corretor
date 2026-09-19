import "server-only";

import type { RowDataPacket } from "mysql2/promise";
import { empresa } from "@/dados/empresa";
import { banco } from "@/lib/banco";
import { criarEnderecoDaMidia } from "@/lib/imoveis/midias";
import { criarSlug } from "@/lib/seo/slug";
import type { Imovel, MidiaPublica, StatusImovel, TipoImovel } from "@/tipos/imovel";

type LinhaPublica = RowDataPacket & {
  id: number; codigo: string; identificador: string; titulo: string;
  descricao: string | null; tipo: string; disponibilidade: string; destaque: number;
  cidade: string | null; bairro: string | null; estado: string | null;
  nome_condominio: string | null; logradouro: string | null; numero: string | null;
  complemento: string | null; ponto_referencia: string | null;
  exibir_endereco_exato: number; valor_venda: string | null;
  valor_condominio: string | null; valor_iptu: string | null;
  periodicidade_iptu: string | null; valor_outras_despesas: string | null;
  area_total: string | null; area_util: string | null; area_construida: string | null;
  quartos: number | null; suites: number | null; banheiros: number | null;
  vagas: number | null; criado_em: Date | string; atualizado_em: Date | string;
  aceita_financiamento: number | null; aceita_permuta: number | null;
};

type LinhaMidia = RowDataPacket & {
  imovel_id: number;
  tipo: "IMAGEM" | "VIDEO" | "PLANTA";
  arquivo: string;
  descricao: string | null;
};

type LinhaCaracteristica = RowDataPacket & { imovel_id: number; nome: string };

function mapearTipo(tipo: string): TipoImovel {
  const mapa: Record<string, TipoImovel> = {
    CASA: "casa", APARTAMENTO: "apartamento", TERRENO: "terreno",
    COMERCIAL: "comercial", SOBRADO: "sobrado",
  };
  return mapa[tipo] ?? "casa";
}

function mapearStatus(disponibilidade: string): StatusImovel {
  const mapa: Record<string, StatusImovel> = {
    DISPONIVEL: "disponivel", RESERVADO: "reservado",
    EM_NEGOCIACAO: "em_negociacao", VENDIDO: "vendido",
    INDISPONIVEL: "indisponivel",
  };
  return mapa[disponibilidade] ?? "indisponivel";
}

function dataIso(valor: Date | string) {
  return valor instanceof Date ? valor.toISOString() : new Date(valor).toISOString();
}

function numero(valor: string | null) {
  return valor === null ? null : Number(valor);
}

function mapearMidia(linha: LinhaMidia): MidiaPublica {
  const tipos: Record<LinhaMidia["tipo"], MidiaPublica["tipo"]> = {
    IMAGEM: "imagem", VIDEO: "video", PLANTA: "planta",
  };
  return {
    tipo: tipos[linha.tipo],
    url: criarEnderecoDaMidia(linha.arquivo),
    descricao: linha.descricao,
  };
}

function mapearImovel(
  linha: LinhaPublica,
  midias: MidiaPublica[],
  caracteristicas: string[],
): Imovel {
  return {
    id: String(linha.id), codigo: linha.codigo, slug: linha.identificador,
    titulo: linha.titulo, tipo: mapearTipo(linha.tipo),
    status: mapearStatus(linha.disponibilidade), destaque: Boolean(linha.destaque),
    cidade: linha.cidade, bairro: linha.bairro, estado: linha.estado,
    nomeCondominio: linha.nome_condominio, logradouro: linha.logradouro,
    numero: linha.numero, complemento: linha.complemento,
    pontoReferencia: linha.ponto_referencia,
    exibirEnderecoExato: Boolean(linha.exibir_endereco_exato),
    preco: numero(linha.valor_venda), condominio: numero(linha.valor_condominio),
    iptu: numero(linha.valor_iptu),
    periodicidadeIptu: linha.periodicidade_iptu === "MENSAL"
      ? "mensal" : linha.periodicidade_iptu === "ANUAL" ? "anual" : null,
    outrasDespesas: numero(linha.valor_outras_despesas),
    area: numero(linha.area_util) ?? numero(linha.area_construida),
    areaTerreno: numero(linha.area_total), quartos: linha.quartos,
    suites: linha.suites, banheiros: linha.banheiros, vagas: linha.vagas,
    descricao: linha.descricao || "", caracteristicas, midias,
    aceitaFinanciamento: linha.aceita_financiamento === null
      ? null : Boolean(linha.aceita_financiamento),
    aceitaPermuta: linha.aceita_permuta === null ? null : Boolean(linha.aceita_permuta),
    criadoEm: dataIso(linha.criado_em), atualizadoEm: dataIso(linha.atualizado_em),
  };
}

const SELECT_PUBLICO = `
  SELECT id, codigo, identificador, titulo, descricao, tipo, disponibilidade,
         destaque, cidade, bairro, estado, nome_condominio, logradouro, numero,
         complemento, ponto_referencia, exibir_endereco_exato,
         valor_venda, valor_condominio, valor_iptu, periodicidade_iptu,
         valor_outras_despesas, area_total, area_util, area_construida,
         quartos, suites, banheiros, vagas, criado_em, atualizado_em,
         aceita_financiamento, aceita_permuta
    FROM imoveis
   WHERE situacao = 'PUBLICADO'
`;

async function carregarComplementos(ids: number[]) {
  const midias = new Map<number, MidiaPublica[]>();
  const caracteristicas = new Map<number, string[]>();
  if (ids.length === 0) return { midias, caracteristicas };
  const marcadores = ids.map(() => "?").join(", ");
  const [[linhasMidias], [linhasCaracteristicas]] = await Promise.all([
    banco.query<LinhaMidia[]>(
      `SELECT imovel_id, tipo, arquivo, descricao FROM midias
        WHERE imovel_id IN (${marcadores})
        ORDER BY imovel_id, principal DESC, ordem, id`, ids,
    ),
    banco.query<LinhaCaracteristica[]>(
      `SELECT imovel_id, nome FROM caracteristicas
        WHERE imovel_id IN (${marcadores}) ORDER BY imovel_id, nome`, ids,
    ),
  ]);
  for (const linha of linhasMidias) {
    const lista = midias.get(Number(linha.imovel_id)) ?? [];
    lista.push(mapearMidia(linha));
    midias.set(Number(linha.imovel_id), lista);
  }
  for (const linha of linhasCaracteristicas) {
    const lista = caracteristicas.get(Number(linha.imovel_id)) ?? [];
    lista.push(linha.nome);
    caracteristicas.set(Number(linha.imovel_id), lista);
  }
  return { midias, caracteristicas };
}

async function completarImoveis(linhas: LinhaPublica[]) {
  const complementos = await carregarComplementos(linhas.map((linha) => Number(linha.id)));
  return linhas.map((linha) => mapearImovel(
    linha,
    complementos.midias.get(Number(linha.id)) ?? [],
    complementos.caracteristicas.get(Number(linha.id)) ?? [],
  ));
}

export async function listarImoveisPublicados(): Promise<Imovel[]> {
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} ORDER BY destaque DESC, publicado_em DESC, id DESC`,
  );
  return completarImoveis(linhas);
}

export async function obterImovelPorSlug(slug: string): Promise<Imovel | undefined> {
  if (!/^[a-z0-9-]{1,240}$/.test(slug)) return undefined;
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND identificador = ? LIMIT 1`, [slug],
  );
  return (await completarImoveis(linhas))[0];
}

export async function obterImoveisSimilares(imovel: Imovel, limite = 3) {
  const todos = await listarImoveisPublicados();
  const candidatos = todos.filter(
    (item) => item.id !== imovel.id && item.status === "disponivel",
  );

  const pontuar = (item: Imovel) => {
    if (
      imovel.bairro &&
      item.bairro === imovel.bairro &&
      imovel.cidade &&
      item.cidade === imovel.cidade
    ) {
      return 4;
    }
    if (
      imovel.cidade &&
      item.cidade === imovel.cidade &&
      item.tipo === imovel.tipo
    ) {
      return 3;
    }
    if (imovel.cidade && item.cidade === imovel.cidade) return 2;
    if (item.tipo === imovel.tipo) return 1;
    return 0;
  };

  return candidatos
    .map((item) => ({ item, pontos: pontuar(item) }))
    .filter((entrada) => entrada.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limite)
    .map((entrada) => entrada.item);
}

function tipoParaBanco(tipo: TipoImovel): string {
  const mapa: Record<TipoImovel, string> = {
    casa: "CASA",
    apartamento: "APARTAMENTO",
    terreno: "TERRENO",
    comercial: "COMERCIAL",
    sobrado: "SOBRADO",
  };
  return mapa[tipo];
}

function tipoDoBanco(tipo: string): TipoImovel {
  return mapearTipo(tipo);
}

function encontrarPorSlug(nomes: string[], slug: string): string | null {
  return nomes.find((nome) => criarSlug(nome) === slug) ?? null;
}

export interface EntidadeSeoCidade {
  nome: string;
  slug: string;
  total: number;
  atualizadoEm: string;
}

export interface EntidadeSeoLocal {
  nome: string;
  slug: string;
  cidade: string;
  slugCidade: string;
  total: number;
  atualizadoEm: string;
}

export interface EntidadeSeoCidadeTipo {
  cidade: string;
  slugCidade: string;
  tipo: TipoImovel;
  slugTipo: string;
  total: number;
  atualizadoEm: string;
}

type LinhaAgregadaCidade = RowDataPacket & {
  cidade: string;
  total: number | string;
  atualizado_em: Date | string;
};

type LinhaAgregadaLocal = RowDataPacket & {
  cidade: string;
  nome: string;
  total: number | string;
  atualizado_em: Date | string;
};

type LinhaAgregadaTipo = RowDataPacket & {
  cidade: string;
  tipo: string;
  total: number | string;
  atualizado_em: Date | string;
};

const FILTRO_DISPONIVEL = `
  situacao = 'PUBLICADO'
  AND disponibilidade = 'DISPONIVEL'
`;

export async function listarCidadesComImoveis(): Promise<EntidadeSeoCidade[]> {
  const [linhas] = await banco.query<LinhaAgregadaCidade[]>(
    `SELECT cidade, COUNT(*) AS total, MAX(atualizado_em) AS atualizado_em
       FROM imoveis
      WHERE ${FILTRO_DISPONIVEL}
        AND cidade IS NOT NULL AND cidade <> ''
      GROUP BY cidade
      ORDER BY cidade`,
  );
  return linhas.map((linha) => ({
    nome: linha.cidade,
    slug: criarSlug(linha.cidade),
    total: Number(linha.total),
    atualizadoEm: dataIso(linha.atualizado_em),
  }));
}

export async function listarBairrosComImoveis(): Promise<EntidadeSeoLocal[]> {
  const [linhas] = await banco.query<LinhaAgregadaLocal[]>(
    `SELECT cidade, bairro AS nome, COUNT(*) AS total, MAX(atualizado_em) AS atualizado_em
       FROM imoveis
      WHERE ${FILTRO_DISPONIVEL}
        AND cidade IS NOT NULL AND cidade <> ''
        AND bairro IS NOT NULL AND bairro <> ''
      GROUP BY cidade, bairro
      ORDER BY cidade, bairro`,
  );
  return linhas.map((linha) => ({
    nome: linha.nome,
    slug: criarSlug(linha.nome),
    cidade: linha.cidade,
    slugCidade: criarSlug(linha.cidade),
    total: Number(linha.total),
    atualizadoEm: dataIso(linha.atualizado_em),
  }));
}

export async function listarCondominiosComImoveis(): Promise<EntidadeSeoLocal[]> {
  const [linhas] = await banco.query<LinhaAgregadaLocal[]>(
    `SELECT cidade, nome_condominio AS nome, COUNT(*) AS total,
            MAX(atualizado_em) AS atualizado_em
       FROM imoveis
      WHERE ${FILTRO_DISPONIVEL}
        AND cidade IS NOT NULL AND cidade <> ''
        AND nome_condominio IS NOT NULL AND nome_condominio <> ''
      GROUP BY cidade, nome_condominio
      ORDER BY cidade, nome_condominio`,
  );
  return linhas.map((linha) => ({
    nome: linha.nome,
    slug: criarSlug(linha.nome),
    cidade: linha.cidade,
    slugCidade: criarSlug(linha.cidade),
    total: Number(linha.total),
    atualizadoEm: dataIso(linha.atualizado_em),
  }));
}

export async function listarCidadesTiposComImoveis(): Promise<EntidadeSeoCidadeTipo[]> {
  const [linhas] = await banco.query<LinhaAgregadaTipo[]>(
    `SELECT cidade, tipo, COUNT(*) AS total, MAX(atualizado_em) AS atualizado_em
       FROM imoveis
      WHERE ${FILTRO_DISPONIVEL}
        AND cidade IS NOT NULL AND cidade <> ''
      GROUP BY cidade, tipo
      ORDER BY cidade, tipo`,
  );
  return linhas.map((linha) => {
    const tipo = tipoDoBanco(linha.tipo);
    return {
      cidade: linha.cidade,
      slugCidade: criarSlug(linha.cidade),
      tipo,
      slugTipo: obterSlugTipo(tipo),
      total: Number(linha.total),
      atualizadoEm: dataIso(linha.atualizado_em),
    };
  });
}

function obterSlugTipo(tipo: TipoImovel): string {
  const mapa: Record<TipoImovel, string> = {
    casa: "casas",
    apartamento: "apartamentos",
    terreno: "terrenos",
    sobrado: "sobrados",
    comercial: "imoveis-comerciais",
  };
  return mapa[tipo];
}

export async function resolverCidadePorSlug(slug: string): Promise<string | null> {
  const [linhas] = await banco.query<(RowDataPacket & { cidade: string })[]>(
    `SELECT DISTINCT cidade FROM imoveis
      WHERE situacao = 'PUBLICADO'
        AND cidade IS NOT NULL AND cidade <> ''`,
  );
  const doCatalogo = encontrarPorSlug(
    linhas.map((linha) => linha.cidade),
    slug,
  );
  if (doCatalogo) return doCatalogo;

  return (
    empresa.cidadesAtendimento.find((cidade) => criarSlug(cidade) === slug) ??
    null
  );
}

export async function resolverBairroPorSlug(
  slugCidade: string,
  slugBairro: string,
): Promise<EntidadeSeoLocal | null> {
  const cidade = await resolverCidadePorSlug(slugCidade);
  if (!cidade) return null;

  const [linhas] = await banco.query<(RowDataPacket & { bairro: string })[]>(
    `SELECT DISTINCT bairro FROM imoveis
      WHERE situacao = 'PUBLICADO'
        AND cidade = ?
        AND bairro IS NOT NULL AND bairro <> ''`,
    [cidade],
  );
  const nome = encontrarPorSlug(
    linhas.map((linha) => linha.bairro),
    slugBairro,
  );
  if (!nome) return null;

  const [agregados] = await banco.query<
    (RowDataPacket & { total: number | string; atualizado_em: Date | string | null })[]
  >(
    `SELECT COUNT(*) AS total, MAX(atualizado_em) AS atualizado_em
       FROM imoveis
      WHERE ${FILTRO_DISPONIVEL}
        AND cidade = ?
        AND bairro = ?`,
    [cidade, nome],
  );
  const agregado = agregados[0];

  return {
    nome,
    slug: slugBairro,
    cidade,
    slugCidade,
    total: Number(agregado?.total ?? 0),
    atualizadoEm: agregado?.atualizado_em
      ? dataIso(agregado.atualizado_em)
      : new Date(0).toISOString(),
  };
}

export async function resolverCondominioPorSlug(
  slugCidade: string,
  slugCondominio: string,
): Promise<EntidadeSeoLocal | null> {
  const cidade = await resolverCidadePorSlug(slugCidade);
  if (!cidade) return null;

  const [linhas] = await banco.query<(RowDataPacket & { nome: string })[]>(
    `SELECT DISTINCT nome_condominio AS nome FROM imoveis
      WHERE situacao = 'PUBLICADO'
        AND cidade = ?
        AND nome_condominio IS NOT NULL AND nome_condominio <> ''`,
    [cidade],
  );
  const nome = encontrarPorSlug(
    linhas.map((linha) => linha.nome),
    slugCondominio,
  );
  if (!nome) return null;

  const [agregados] = await banco.query<
    (RowDataPacket & { total: number | string; atualizado_em: Date | string | null })[]
  >(
    `SELECT COUNT(*) AS total, MAX(atualizado_em) AS atualizado_em
       FROM imoveis
      WHERE ${FILTRO_DISPONIVEL}
        AND cidade = ?
        AND nome_condominio = ?`,
    [cidade, nome],
  );
  const agregado = agregados[0];

  return {
    nome,
    slug: slugCondominio,
    cidade,
    slugCidade,
    total: Number(agregado?.total ?? 0),
    atualizadoEm: agregado?.atualizado_em
      ? dataIso(agregado.atualizado_em)
      : new Date(0).toISOString(),
  };
}

export async function listarImoveisPorCidade(slugCidade: string): Promise<Imovel[]> {
  const cidade = await resolverCidadePorSlug(slugCidade);
  if (!cidade) return [];
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND cidade = ?
      ORDER BY destaque DESC, publicado_em DESC, id DESC`,
    [cidade],
  );
  return completarImoveis(linhas);
}

export async function listarImoveisPorCidadeETipo(
  slugCidade: string,
  tipo: TipoImovel,
): Promise<Imovel[]> {
  const cidade = await resolverCidadePorSlug(slugCidade);
  if (!cidade) return [];
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND cidade = ? AND tipo = ?
      ORDER BY destaque DESC, publicado_em DESC, id DESC`,
    [cidade, tipoParaBanco(tipo)],
  );
  return completarImoveis(linhas);
}

export async function listarImoveisPorBairro(
  slugCidade: string,
  slugBairro: string,
): Promise<Imovel[]> {
  const resolvido = await resolverBairroPorSlug(slugCidade, slugBairro);
  if (!resolvido) return [];
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND cidade = ? AND bairro = ?
      ORDER BY destaque DESC, publicado_em DESC, id DESC`,
    [resolvido.cidade, resolvido.nome],
  );
  return completarImoveis(linhas);
}

export async function listarImoveisPorCondominio(
  slugCidade: string,
  slugCondominio: string,
): Promise<Imovel[]> {
  const resolvido = await resolverCondominioPorSlug(slugCidade, slugCondominio);
  if (!resolvido) return [];
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND cidade = ? AND nome_condominio = ?
      ORDER BY destaque DESC, publicado_em DESC, id DESC`,
    [resolvido.cidade, resolvido.nome],
  );
  return completarImoveis(linhas);
}

export function calcularEstatisticasListagem(imoveis: Imovel[]) {
  const disponiveis = imoveis.filter((item) => item.status === "disponivel");
  const precos = disponiveis
    .map((item) => item.preco)
    .filter((valor): valor is number => valor != null && valor > 0);
  const bairros = new Set(
    disponiveis
      .map((item) => item.bairro)
      .filter((item): item is string => Boolean(item)),
  );
  return {
    total: disponiveis.length,
    bairros: bairros.size,
    precoMin: precos.length ? Math.min(...precos) : null,
    precoMax: precos.length ? Math.max(...precos) : null,
  };
}

/** Fonte única: indexação de bairro/condomínio usa só disponíveis. */
export function totalDisponiveis(imoveis: Imovel[]) {
  return imoveis.filter((item) => item.status === "disponivel").length;
}

export async function listarCidades(): Promise<string[]> {
  const [linhas] = await banco.query<(RowDataPacket & { cidade: string })[]>(
    `SELECT DISTINCT cidade FROM imoveis WHERE situacao = 'PUBLICADO'
      AND cidade IS NOT NULL AND cidade <> '' ORDER BY cidade`,
  );
  return linhas.map((linha) => linha.cidade);
}

export async function listarBairros(cidade?: string): Promise<string[]> {
  const [linhas] = cidade
    ? await banco.query<(RowDataPacket & { bairro: string })[]>(
        `SELECT DISTINCT bairro FROM imoveis WHERE situacao = 'PUBLICADO'
          AND cidade = ? AND bairro IS NOT NULL AND bairro <> '' ORDER BY bairro`, [cidade],
      )
    : await banco.query<(RowDataPacket & { bairro: string })[]>(
        `SELECT DISTINCT bairro FROM imoveis WHERE situacao = 'PUBLICADO'
          AND bairro IS NOT NULL AND bairro <> '' ORDER BY bairro`,
      );
  return linhas.map((linha) => linha.bairro);
}

export async function listarImoveisPorIds(ids: string[]): Promise<Imovel[]> {
  const numericos = [...new Set(ids)].slice(0, 100).map(Number)
    .filter((id) => Number.isSafeInteger(id) && id > 0);
  if (numericos.length === 0) return [];
  const marcadores = numericos.map(() => "?").join(", ");
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND id IN (${marcadores})`, numericos,
  );
  return completarImoveis(linhas);
}

export async function listarSlugsPublicados(): Promise<string[]> {
  const [linhas] = await banco.query<(RowDataPacket & { identificador: string })[]>(
    "SELECT identificador FROM imoveis WHERE situacao = 'PUBLICADO'",
  );
  return linhas.map((linha) => linha.identificador);
}

export async function listarEntradasDoSitemap() {
  const [linhas] = await banco.query<
    (RowDataPacket & { identificador: string; atualizado_em: Date | string })[]
  >(`SELECT identificador, atualizado_em FROM imoveis
      WHERE situacao = 'PUBLICADO' ORDER BY atualizado_em DESC`);
  return linhas.map((linha) => ({
    slug: linha.identificador,
    atualizadoEm: dataIso(linha.atualizado_em),
  }));
}
