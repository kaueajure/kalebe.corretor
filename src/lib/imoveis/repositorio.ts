import { randomBytes } from "node:crypto";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { banco } from "@/lib/banco";
import type { MidiaPreparada } from "@/lib/imoveis/midias";
import { criarEnderecoDaMidia } from "@/lib/imoveis/midias";
import type { DadosValidadosDoImovel } from "@/lib/imoveis/validacao";

type LinhaDoImovel = RowDataPacket & {
  id: number;
  codigo: string;
  titulo: string;
  localizacao: string | null;
  nome_condominio: string | null;
  tipo: string;
  situacao: string;
  disponibilidade: string;
  valor_venda: string | null;
  criado_em: Date;
  capa: string | null;
};

export type ImovelDoPainel = {
  id: number;
  codigo: string;
  titulo: string;
  localizacao: string | null;
  tipo: string;
  situacao: string;
  disponibilidade: string;
  preco: number | null;
  criadoEm: Date;
  capa: string | null;
};

export async function listarImoveisDoPainel() {
  const [linhas] = await banco.query<LinhaDoImovel[]>(
    `SELECT imovel.id, imovel.codigo, imovel.titulo,
            TRIM(BOTH ', ' FROM CONCAT_WS(', ',
              NULLIF(imovel.nome_condominio, ''),
              NULLIF(imovel.bairro, ''),
              NULLIF(imovel.cidade, '')
            )) AS localizacao,
            imovel.nome_condominio, imovel.tipo,
            imovel.situacao, imovel.disponibilidade,
            imovel.valor_venda, imovel.criado_em,
            (SELECT midia.arquivo
               FROM midias AS midia
              WHERE midia.imovel_id = imovel.id AND midia.principal = TRUE
              ORDER BY midia.ordem, midia.id
              LIMIT 1) AS capa
       FROM imoveis AS imovel
      ORDER BY imovel.criado_em DESC, imovel.id DESC`,
  );

  return linhas.map<ImovelDoPainel>((linha) => ({
    id: Number(linha.id),
    codigo: linha.codigo,
    titulo: linha.titulo,
    localizacao: linha.localizacao || null,
    tipo: linha.tipo,
    situacao: linha.situacao,
    disponibilidade: linha.disponibilidade,
    preco: linha.valor_venda !== null ? Number(linha.valor_venda) : null,
    criadoEm: linha.criado_em,
    capa: linha.capa,
  }));
}

export async function identificadorEstaDisponivel(
  conexao: PoolConnection,
  identificador: string,
) {
  const [linhas] = await conexao.execute<(RowDataPacket & { total: number })[]>(
    "SELECT COUNT(*) AS total FROM imoveis WHERE identificador = ?",
    [identificador],
  );
  return Number(linhas[0]?.total ?? 0) === 0;
}

function gerarCodigo() {
  return `KAL-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function cadastrarImovel(
  conexao: PoolConnection,
  dados: DadosValidadosDoImovel & {
    identificador: string;
    caracteristicasSeparadas: string[];
    midias: MidiaPreparada[];
  },
) {
  const valorCondominio = dados.condominioIsento ? 0 : dados.valorCondominio;
  const valorIptu = dados.iptuIsento ? 0 : dados.valorIptu;
  const periodicidadeIptu =
    valorIptu !== null ? (dados.periodicidadeIptu ?? "ANUAL") : null;
  const publicadoEm = dados.situacao === "PUBLICADO" ? new Date() : null;
  const codigo = gerarCodigo();

  const [resultado] = await conexao.execute<ResultSetHeader>(
    `INSERT INTO imoveis (
       codigo, titulo, identificador, descricao, nome_condominio, lancamento_id,
       tipo, subtipo, situacao, disponibilidade,
       valor_venda, valor_condominio, valor_iptu, periodicidade_iptu,
       valor_outras_despesas, aceita_financiamento, aceita_permuta,
       area_total, area_util, area_construida, unidade_area_total,
       frente_terreno, fundos_terreno, topografia,
       quartos, suites, banheiros, vagas, andar, unidade, total_andares, elevador, pe_direito,
       bairro, cidade, estado, logradouro, numero, complemento, ponto_referencia, cep,
       exibir_endereco_exato, destaque, publicado_em
     ) VALUES (${Array.from({ length: 44 }, () => "?").join(", ")})`,
    [
      codigo,
      dados.titulo,
      dados.identificador,
      dados.descricao,
      dados.nomeCondominio,
      dados.lancamentoId,
      dados.tipo,
      dados.subtipo,
      dados.situacao,
      dados.disponibilidade,
      dados.valorVenda,
      valorCondominio,
      valorIptu,
      periodicidadeIptu,
      dados.valorOutrasDespesas,
      dados.aceitaFinanciamento,
      dados.aceitaPermuta,
      dados.areaTerreno,
      dados.areaUtil,
      dados.areaConstruida,
      dados.areaTerreno !== null ? dados.unidadeAreaTerreno : null,
      dados.frenteTerreno,
      dados.fundosTerreno,
      dados.topografia,
      dados.quartos,
      dados.suites,
      dados.banheiros,
      dados.vagas,
      dados.andar,
      dados.unidade,
      dados.totalAndares,
      dados.elevador,
      dados.peDireito,
      dados.bairro,
      dados.cidade,
      dados.estado?.toUpperCase() ?? null,
      dados.logradouro,
      dados.numero,
      dados.complemento,
      dados.pontoReferencia,
      dados.cep,
      dados.exibirEnderecoExato,
      dados.destaque,
      publicadoEm,
    ],
  );
  const idDoImovel = resultado.insertId;

  for (const caracteristica of dados.caracteristicasSeparadas) {
    await conexao.execute(
      "INSERT INTO caracteristicas (imovel_id, nome) VALUES (?, ?)",
      [idDoImovel, caracteristica],
    );
  }
  for (const midia of dados.midias) {
    await conexao.execute(
      `INSERT INTO midias (imovel_id, tipo, arquivo, largura, altura, descricao, ordem, principal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idDoImovel,
        midia.tipo,
        midia.arquivo,
        midia.largura,
        midia.altura,
        midia.descricao,
        midia.ordem,
        midia.principal,
      ],
    );
  }

  return { idDoImovel, codigo };
}

type LinhaCompletaDoImovel = RowDataPacket & {
  id: number;
  codigo: string;
  identificador: string;
  titulo: string;
  descricao: string | null;
  tipo: string;
  subtipo: string | null;
  lancamento_id: number | null;
  situacao: string;
  disponibilidade: string;
  valor_venda: string | null;
  valor_condominio: string | null;
  valor_iptu: string | null;
  periodicidade_iptu: string | null;
  valor_outras_despesas: string | null;
  aceita_financiamento: number | null;
  aceita_permuta: number | null;
  area_total: string | null;
  area_util: string | null;
  area_construida: string | null;
  unidade_area_total: string | null;
  frente_terreno: string | null;
  fundos_terreno: string | null;
  topografia: string | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  andar: number | null;
  unidade: string | null;
  total_andares: number | null;
  elevador: number | null;
  pe_direito: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  nome_condominio: string | null;
  ponto_referencia: string | null;
  cep: string | null;
  exibir_endereco_exato: number;
  destaque: number;
  publicado_em: Date | string | null;
};

type LinhaDaMidia = RowDataPacket & {
  id: number;
  tipo: "IMAGEM" | "VIDEO" | "PLANTA";
  arquivo: string;
  largura: number | null;
  altura: number | null;
  descricao: string | null;
  ordem: number;
  principal: number;
};

export type MidiaDoImovelParaEdicao = {
  id: number;
  tipo: "IMAGEM" | "VIDEO" | "PLANTA";
  arquivo: string;
  largura: number | null;
  altura: number | null;
  descricao: string | null;
  ordem: number;
  principal: boolean;
  url: string;
};

export type ImovelParaEdicao = {
  id: number;
  codigo: string;
  identificador: string;
  situacao: string;
  valores: Record<string, string | boolean | string[]>;
  midias: MidiaDoImovelParaEdicao[];
};

function respostaOpcional(valor: number | null) {
  if (valor === null) return "";
  return valor ? "SIM" : "NAO";
}

function numeroParaCampo(valor: string | number | null) {
  if (valor === null || valor === "") return "";
  return String(valor);
}

function montarValoresDoFormulario(
  linha: LinhaCompletaDoImovel,
  caracteristicas: string[],
) {
  const condominioIsento =
    linha.valor_condominio !== null && Number(linha.valor_condominio) === 0;
  const iptuIsento =
    linha.valor_iptu !== null && Number(linha.valor_iptu) === 0;

  return {
    titulo: linha.titulo,
    descricao: linha.descricao ?? "",
    tipo: linha.tipo,
    subtipo: linha.subtipo ?? "",
    lancamentoId:
      linha.lancamento_id === null ? "" : String(linha.lancamento_id),
    disponibilidade: linha.disponibilidade,
    valorVenda: numeroParaCampo(linha.valor_venda),
    valorCondominio: condominioIsento
      ? ""
      : numeroParaCampo(linha.valor_condominio),
    valorIptu: iptuIsento ? "" : numeroParaCampo(linha.valor_iptu),
    periodicidadeIptu: linha.periodicidade_iptu ?? "ANUAL",
    valorOutrasDespesas: numeroParaCampo(linha.valor_outras_despesas),
    condominioIsento,
    iptuIsento,
    aceitaFinanciamento: respostaOpcional(linha.aceita_financiamento),
    aceitaPermuta: respostaOpcional(linha.aceita_permuta),
    quartos: numeroParaCampo(linha.quartos),
    suites: numeroParaCampo(linha.suites),
    banheiros: numeroParaCampo(linha.banheiros),
    vagas: numeroParaCampo(linha.vagas),
    areaTerreno: numeroParaCampo(linha.area_total),
    areaUtil: numeroParaCampo(linha.area_util),
    areaConstruida: numeroParaCampo(linha.area_construida),
    unidadeAreaTerreno: linha.unidade_area_total ?? "M2",
    frenteTerreno: numeroParaCampo(linha.frente_terreno),
    fundosTerreno: numeroParaCampo(linha.fundos_terreno),
    topografia: linha.topografia ?? "",
    andar: numeroParaCampo(linha.andar),
    unidade: linha.unidade ?? "",
    totalAndares: numeroParaCampo(linha.total_andares),
    elevador: respostaOpcional(linha.elevador),
    peDireito: numeroParaCampo(linha.pe_direito),
    cep: linha.cep ?? "",
    estado: linha.estado ?? "",
    cidade: linha.cidade ?? "",
    bairro: linha.bairro ?? "",
    logradouro: linha.logradouro ?? "",
    numero: linha.numero ?? "",
    complemento: linha.complemento ?? "",
    nomeCondominio: linha.nome_condominio ?? "",
    pontoReferencia: linha.ponto_referencia ?? "",
    exibirEnderecoExato: Boolean(linha.exibir_endereco_exato),
    destaque: Boolean(linha.destaque),
    caracteristicas: caracteristicas.join(", "),
    recursosAdicionais: [] as string[],
  };
}

export async function obterImovelParaEdicao(id: number) {
  const [linhas] = await banco.query<LinhaCompletaDoImovel[]>(
    `SELECT id, codigo, identificador, titulo, descricao, tipo, subtipo, lancamento_id, situacao, disponibilidade,
            valor_venda, valor_condominio, valor_iptu, periodicidade_iptu, valor_outras_despesas,
            aceita_financiamento, aceita_permuta,
            area_total, area_util, area_construida, unidade_area_total, frente_terreno, fundos_terreno, topografia,
            quartos, suites, banheiros, vagas, andar, unidade, total_andares, elevador, pe_direito,
            bairro, cidade, estado, logradouro, numero, complemento, nome_condominio, ponto_referencia, cep,
            exibir_endereco_exato, destaque, publicado_em
       FROM imoveis
      WHERE id = ?
      LIMIT 1`,
    [id],
  );
  const linha = linhas[0];
  if (!linha) return null;

  const [[midias], [caracteristicas]] = await Promise.all([
    banco.query<LinhaDaMidia[]>(
      "SELECT id, tipo, arquivo, largura, altura, descricao, ordem, principal FROM midias WHERE imovel_id = ? ORDER BY ordem, id",
      [id],
    ),
    banco.query<(RowDataPacket & { nome: string })[]>(
      "SELECT nome FROM caracteristicas WHERE imovel_id = ? ORDER BY nome",
      [id],
    ),
  ]);

  return {
    id: Number(linha.id),
    codigo: linha.codigo,
    identificador: linha.identificador,
    situacao: linha.situacao,
    valores: montarValoresDoFormulario(
      linha,
      caracteristicas.map((item) => item.nome),
    ),
    midias: midias.map<MidiaDoImovelParaEdicao>((midia) => ({
      id: Number(midia.id),
      tipo: midia.tipo,
      arquivo: midia.arquivo,
      largura: midia.largura === null ? null : Number(midia.largura),
      altura: midia.altura === null ? null : Number(midia.altura),
      descricao: midia.descricao,
      ordem: Number(midia.ordem),
      principal: Boolean(midia.principal),
      url: criarEnderecoDaMidia(midia.arquivo),
    })),
  } satisfies ImovelParaEdicao;
}

type MetadadoDeMidiaNaEdicao = {
  id?: number;
  descricao: string | null;
  classificacao: "IMAGEM" | "PLANTA";
  principal: boolean;
  ordem: number;
};

function montarCamposDoImovel(dados: DadosValidadosDoImovel) {
  const valorCondominio = dados.condominioIsento ? 0 : dados.valorCondominio;
  const valorIptu = dados.iptuIsento ? 0 : dados.valorIptu;
  const periodicidadeIptu =
    valorIptu !== null ? (dados.periodicidadeIptu ?? "ANUAL") : null;

  return {
    valorCondominio,
    valorIptu,
    periodicidadeIptu,
  };
}

export async function atualizarImovel(
  conexao: PoolConnection,
  id: number,
  dados: DadosValidadosDoImovel & {
    identificador: string;
    caracteristicasSeparadas: string[];
    metadados: MetadadoDeMidiaNaEdicao[];
    novasMidias: MidiaPreparada[];
    midiasRemovidas: { id: number; arquivo: string }[];
    midiasExistentes: {
      id: number;
      tipo: "IMAGEM" | "VIDEO" | "PLANTA";
      arquivo: string;
    }[];
  },
) {
  const campos = montarCamposDoImovel(dados);

  await conexao.execute(
    `UPDATE imoveis SET
       titulo = ?, descricao = ?, nome_condominio = ?, lancamento_id = ?,
       tipo = ?, subtipo = ?, situacao = ?, disponibilidade = ?,
       valor_venda = ?, valor_condominio = ?, valor_iptu = ?, periodicidade_iptu = ?,
       valor_outras_despesas = ?, aceita_financiamento = ?, aceita_permuta = ?,
       area_total = ?, area_util = ?, area_construida = ?, unidade_area_total = ?,
       frente_terreno = ?, fundos_terreno = ?, topografia = ?,
       quartos = ?, suites = ?, banheiros = ?, vagas = ?, andar = ?, unidade = ?, total_andares = ?, elevador = ?, pe_direito = ?,
       bairro = ?, cidade = ?, estado = ?, logradouro = ?, numero = ?, complemento = ?, ponto_referencia = ?, cep = ?,
       exibir_endereco_exato = ?, destaque = ?,
       publicado_em = CASE WHEN ? = 1 THEN COALESCE(publicado_em, CURRENT_TIMESTAMP(6)) ELSE publicado_em END
     WHERE id = ?`,
    [
      dados.titulo,
      dados.descricao,
      dados.nomeCondominio,
      dados.lancamentoId,
      dados.tipo,
      dados.subtipo,
      dados.situacao,
      dados.disponibilidade,
      dados.valorVenda,
      campos.valorCondominio,
      campos.valorIptu,
      campos.periodicidadeIptu,
      dados.valorOutrasDespesas,
      dados.aceitaFinanciamento,
      dados.aceitaPermuta,
      dados.areaTerreno,
      dados.areaUtil,
      dados.areaConstruida,
      dados.areaTerreno !== null ? dados.unidadeAreaTerreno : null,
      dados.frenteTerreno,
      dados.fundosTerreno,
      dados.topografia,
      dados.quartos,
      dados.suites,
      dados.banheiros,
      dados.vagas,
      dados.andar,
      dados.unidade,
      dados.totalAndares,
      dados.elevador,
      dados.peDireito,
      dados.bairro,
      dados.cidade,
      dados.estado?.toUpperCase() ?? null,
      dados.logradouro,
      dados.numero,
      dados.complemento,
      dados.pontoReferencia,
      dados.cep,
      dados.exibirEnderecoExato,
      dados.destaque,
      dados.situacao === "PUBLICADO" ? 1 : 0,
      id,
    ],
  );

  await conexao.execute("DELETE FROM caracteristicas WHERE imovel_id = ?", [id]);
  for (const caracteristica of dados.caracteristicasSeparadas) {
    await conexao.execute(
      "INSERT INTO caracteristicas (imovel_id, nome) VALUES (?, ?)",
      [id, caracteristica],
    );
  }

  for (const removida of dados.midiasRemovidas) {
    await conexao.execute("DELETE FROM midias WHERE id = ? AND imovel_id = ?", [
      removida.id,
      id,
    ]);
  }

  for (const metadado of dados.metadados) {
    if (!metadado.id) continue;
    const existente = dados.midiasExistentes.find(
      (midia) => midia.id === metadado.id,
    );
    if (!existente) continue;
    const tipo = existente.tipo === "VIDEO" ? "VIDEO" : metadado.classificacao;
    await conexao.execute(
      `UPDATE midias
          SET tipo = ?, descricao = ?, ordem = ?, principal = ?
        WHERE id = ? AND imovel_id = ?`,
      [
        tipo,
        metadado.descricao,
        metadado.ordem,
        metadado.principal,
        metadado.id,
        id,
      ],
    );
  }

  for (const midia of dados.novasMidias) {
    await conexao.execute(
      `INSERT INTO midias (imovel_id, tipo, arquivo, largura, altura, descricao, ordem, principal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        midia.tipo,
        midia.arquivo,
        midia.largura,
        midia.altura,
        midia.descricao,
        midia.ordem,
        midia.principal,
      ],
    );
  }
}

export async function excluirImovel(conexao: PoolConnection, id: number) {
  const [linhas] = await conexao.query<
    (RowDataPacket & { identificador: string })[]
  >("SELECT identificador FROM imoveis WHERE id = ? LIMIT 1 FOR UPDATE", [id]);
  const linha = linhas[0];
  if (!linha) return null;
  await conexao.execute("DELETE FROM imoveis WHERE id = ?", [id]);
  return { identificador: linha.identificador };
}
