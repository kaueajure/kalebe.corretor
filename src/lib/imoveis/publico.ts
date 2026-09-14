import type { RowDataPacket } from "mysql2/promise";
import { banco } from "@/lib/banco";
import { criarEnderecoDaMidia } from "@/lib/imoveis/midias";
import type { Imovel, StatusImovel, TipoImovel } from "@/tipos/imovel";

type LinhaPublica = RowDataPacket & {
  id: number;
  codigo: string;
  identificador: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  disponibilidade: string;
  destaque: number;
  cidade: string | null;
  bairro: string | null;
  estado: string | null;
  valor_venda: string | null;
  valor_condominio: string | null;
  valor_iptu: string | null;
  area_total: string | null;
  area_util: string | null;
  area_construida: string | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  criado_em: Date | string;
  aceita_financiamento: number | null;
};

function mapearTipo(tipo: string): TipoImovel {
  const mapa: Record<string, TipoImovel> = {
    CASA: "casa",
    APARTAMENTO: "apartamento",
    TERRENO: "terreno",
    COMERCIAL: "comercial",
    SOBRADO: "sobrado",
  };
  return mapa[tipo] ?? "casa";
}

function mapearStatus(disponibilidade: string): StatusImovel {
  if (disponibilidade === "DISPONIVEL") return "disponivel";
  if (disponibilidade === "RESERVADO" || disponibilidade === "EM_NEGOCIACAO") {
    return "reservado";
  }
  return "indisponivel";
}

function dataIso(valor: Date | string) {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return String(valor).slice(0, 10);
}

async function carregarFotos(imovelId: number) {
  const [midias] = await banco.query<
    (RowDataPacket & { arquivo: string })[]
  >(
    `SELECT arquivo FROM midias
      WHERE imovel_id = ? AND tipo IN ('IMAGEM', 'PLANTA')
      ORDER BY principal DESC, ordem ASC, id ASC`,
    [imovelId]
  );
  return midias.map((m) => criarEnderecoDaMidia(m.arquivo));
}

async function carregarCaracteristicas(imovelId: number) {
  const [linhas] = await banco.query<(RowDataPacket & { nome: string })[]>(
    "SELECT nome FROM caracteristicas WHERE imovel_id = ? ORDER BY nome",
    [imovelId]
  );
  return linhas.map((l) => l.nome);
}

async function mapearImovel(linha: LinhaPublica): Promise<Imovel> {
  const [fotos, caracteristicas] = await Promise.all([
    carregarFotos(Number(linha.id)),
    carregarCaracteristicas(Number(linha.id)),
  ]);

  const areaUtil =
    linha.area_util !== null ? Number(linha.area_util) : null;
  const areaConstruida =
    linha.area_construida !== null ? Number(linha.area_construida) : null;

  return {
    id: String(linha.id),
    codigo: linha.codigo,
    slug: linha.identificador,
    titulo: linha.titulo,
    finalidade: "venda",
    tipo: mapearTipo(linha.tipo),
    status: mapearStatus(linha.disponibilidade),
    destaque: Boolean(linha.destaque),
    cidade: linha.cidade || "São José do Rio Preto",
    bairro: linha.bairro || linha.cidade || "A definir",
    estado: linha.estado || "SP",
    preco: linha.valor_venda !== null ? Number(linha.valor_venda) : null,
    condominio:
      linha.valor_condominio !== null ? Number(linha.valor_condominio) : null,
    iptu: linha.valor_iptu !== null ? Number(linha.valor_iptu) : null,
    area: areaUtil ?? areaConstruida,
    areaTerreno:
      linha.area_total !== null ? Number(linha.area_total) : null,
    quartos: linha.quartos,
    suites: linha.suites,
    banheiros: linha.banheiros,
    vagas: linha.vagas,
    descricao: linha.descricao || "",
    caracteristicas,
    fotos,
    financiamento: linha.aceita_financiamento
      ? {
          titulo: "Financiamento disponível",
          itens: [],
        }
      : undefined,
    criadoEm: dataIso(linha.criado_em),
  };
}

const SELECT_PUBLICO = `
  SELECT id, codigo, identificador, titulo, descricao, tipo, disponibilidade,
         destaque, cidade, bairro, estado, valor_venda, valor_condominio, valor_iptu,
         area_total, area_util, area_construida, quartos, suites, banheiros, vagas,
         criado_em, aceita_financiamento
    FROM imoveis
   WHERE situacao = 'PUBLICADO'
`;

export async function listarImoveisPublicados(): Promise<Imovel[]> {
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO}
     ORDER BY destaque DESC, publicado_em DESC, id DESC`
  );
  return Promise.all(linhas.map(mapearImovel));
}

export async function obterImovelPorSlug(
  slug: string
): Promise<Imovel | undefined> {
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND identificador = ? LIMIT 1`,
    [slug]
  );
  const linha = linhas[0];
  if (!linha) return undefined;
  return mapearImovel(linha);
}

export async function obterImoveisSimilares(
  imovel: Imovel,
  limite = 3
): Promise<Imovel[]> {
  const todos = await listarImoveisPublicados();
  return todos
    .filter(
      (item) =>
        item.id !== imovel.id &&
        item.status === "disponivel" &&
        (item.tipo === imovel.tipo || item.cidade === imovel.cidade)
    )
    .slice(0, limite);
}

export async function listarCidades(): Promise<string[]> {
  const [linhas] = await banco.query<(RowDataPacket & { cidade: string })[]>(
    `SELECT DISTINCT cidade FROM imoveis
      WHERE situacao = 'PUBLICADO' AND cidade IS NOT NULL AND cidade <> ''
      ORDER BY cidade`
  );
  return linhas.map((l) => l.cidade);
}

export async function listarBairros(cidade?: string): Promise<string[]> {
  const [linhas] = cidade
    ? await banco.query<(RowDataPacket & { bairro: string })[]>(
        `SELECT DISTINCT bairro FROM imoveis
          WHERE situacao = 'PUBLICADO'
            AND cidade = ?
            AND bairro IS NOT NULL AND bairro <> ''
          ORDER BY bairro`,
        [cidade]
      )
    : await banco.query<(RowDataPacket & { bairro: string })[]>(
        `SELECT DISTINCT bairro FROM imoveis
          WHERE situacao = 'PUBLICADO'
            AND bairro IS NOT NULL AND bairro <> ''
          ORDER BY bairro`
      );
  return linhas.map((l) => l.bairro);
}

export async function listarImoveisPorIds(ids: string[]): Promise<Imovel[]> {
  if (ids.length === 0) return [];
  const numericos = ids
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);
  if (numericos.length === 0) return [];

  const placeholders = numericos.map(() => "?").join(", ");
  const [linhas] = await banco.query<LinhaPublica[]>(
    `${SELECT_PUBLICO} AND id IN (${placeholders})`,
    numericos
  );
  return Promise.all(linhas.map(mapearImovel));
}

export async function listarSlugsPublicados(): Promise<string[]> {
  const [linhas] = await banco.query<
    (RowDataPacket & { identificador: string })[]
  >(
    `SELECT identificador FROM imoveis WHERE situacao = 'PUBLICADO'`
  );
  return linhas.map((l) => l.identificador);
}
