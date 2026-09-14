import type { z } from "zod";
import {
  capaEhValidaParaPublicacao,
  type MidiaExistenteParaCapa,
} from "@/lib/imoveis/capa";
import {
  LIMITE_TOTAL_DE_UPLOAD,
  type MidiaRecebida,
} from "@/lib/imoveis/midias";
import {
  esquemaDoCadastroDeImovel,
  esquemaDosMetadadosDasMidias,
  separarCaracteristicas,
} from "@/lib/imoveis/validacao";

type MetadadosDasMidias = z.infer<typeof esquemaDosMetadadosDasMidias>;
type DadosValidados = z.infer<typeof esquemaDoCadastroDeImovel>;

export type ResultadoDoFormularioDeImovel =
  | {
      sucesso: true;
      dados: DadosValidados;
      caracteristicas: string[];
      midiasRecebidas: MidiaRecebida[];
      metadados: MetadadosDasMidias;
    }
  | { sucesso: false; mensagem: string; status: number; campo?: string };

export function formularioFoiProcessadoComSucesso(
  resultado: ResultadoDoFormularioDeImovel,
): resultado is Extract<ResultadoDoFormularioDeImovel, { sucesso: true }> {
  return resultado.sucesso;
}

function campoTextual(formulario: FormData, nome: string) {
  const valor = formulario.get(nome);
  return typeof valor === "string" ? valor : "";
}

function camposTextuais(formulario: FormData, nome: string) {
  return formulario
    .getAll(nome)
    .filter((valor): valor is string => typeof valor === "string");
}

function campoBooleano(formulario: FormData, nome: string) {
  return campoTextual(formulario, nome) === "SIM";
}

function arquivoValido(valor: FormDataEntryValue): valor is File {
  return valor instanceof File && valor.size > 0;
}

function lerMetadadosDasMidias(formulario: FormData) {
  const valor = campoTextual(formulario, "metadadosMidias");
  try {
    const resultado = esquemaDosMetadadosDasMidias.safeParse(
      valor ? JSON.parse(valor) : [],
    );
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}

export function processarFormularioDeImovel(
  formulario: FormData,
  opcoes?: { midiasExistentes?: MidiaExistenteParaCapa[] },
): ResultadoDoFormularioDeImovel {
  const arquivos = formulario.getAll("midias").filter(arquivoValido);
  const metadados = lerMetadadosDasMidias(formulario);
  if (!metadados) {
    return {
      sucesso: false,
      mensagem: "Não foi possível validar a ordem e as informações da galeria.",
      status: 400,
      campo: "midias",
    };
  }

  const novasMidias = metadados.filter((midia) => !midia.id);
  if (novasMidias.length !== arquivos.length) {
    return {
      sucesso: false,
      mensagem: "Não foi possível validar a ordem e as informações da galeria.",
      status: 400,
      campo: "midias",
    };
  }
  if (metadados.length > 60) {
    return {
      sucesso: false,
      mensagem: "Selecione no máximo 60 arquivos para a galeria.",
      status: 400,
      campo: "midias",
    };
  }
  if (metadados.filter((midia) => midia.principal).length > 1) {
    return {
      sucesso: false,
      mensagem: "Escolha somente uma foto como capa.",
      status: 400,
      campo: "midias",
    };
  }

  const tamanhoTotal = arquivos.reduce(
    (total, arquivo) => total + arquivo.size,
    0,
  );
  if (tamanhoTotal > LIMITE_TOTAL_DE_UPLOAD) {
    return {
      sucesso: false,
      mensagem: "O conjunto de arquivos ultrapassa o limite total de 300 MB.",
      status: 413,
      campo: "midias",
    };
  }

  const situacao =
    campoTextual(formulario, "acao") === "PUBLICAR" ? "PUBLICADO" : "RASCUNHO";
  const validacao = esquemaDoCadastroDeImovel.safeParse({
    titulo: campoTextual(formulario, "titulo"),
    descricao: campoTextual(formulario, "descricao"),
    tipo: campoTextual(formulario, "tipo"),
    subtipo: campoTextual(formulario, "subtipo"),
    lancamentoId: campoTextual(formulario, "lancamentoId"),
    situacao,
    disponibilidade: campoTextual(formulario, "disponibilidade"),
    valorVenda: campoTextual(formulario, "valorVenda"),
    valorCondominio: campoTextual(formulario, "valorCondominio"),
    valorIptu: campoTextual(formulario, "valorIptu"),
    periodicidadeIptu: campoTextual(formulario, "periodicidadeIptu"),
    valorOutrasDespesas: campoTextual(formulario, "valorOutrasDespesas"),
    condominioIsento: campoBooleano(formulario, "condominioIsento"),
    iptuIsento: campoBooleano(formulario, "iptuIsento"),
    aceitaFinanciamento: campoTextual(formulario, "aceitaFinanciamento"),
    aceitaPermuta: campoTextual(formulario, "aceitaPermuta"),
    quartos: campoTextual(formulario, "quartos"),
    suites: campoTextual(formulario, "suites"),
    banheiros: campoTextual(formulario, "banheiros"),
    vagas: campoTextual(formulario, "vagas"),
    areaTerreno: campoTextual(formulario, "areaTerreno"),
    areaUtil: campoTextual(formulario, "areaUtil"),
    areaConstruida: campoTextual(formulario, "areaConstruida"),
    unidadeAreaTerreno: campoTextual(formulario, "unidadeAreaTerreno"),
    frenteTerreno: campoTextual(formulario, "frenteTerreno"),
    fundosTerreno: campoTextual(formulario, "fundosTerreno"),
    topografia: campoTextual(formulario, "topografia"),
    andar: campoTextual(formulario, "andar"),
    unidade: campoTextual(formulario, "unidade"),
    totalAndares: campoTextual(formulario, "totalAndares"),
    elevador: campoTextual(formulario, "elevador"),
    peDireito: campoTextual(formulario, "peDireito"),
    cep: campoTextual(formulario, "cep"),
    estado: campoTextual(formulario, "estado"),
    cidade: campoTextual(formulario, "cidade"),
    bairro: campoTextual(formulario, "bairro"),
    logradouro: campoTextual(formulario, "logradouro"),
    numero: campoTextual(formulario, "numero"),
    complemento: campoTextual(formulario, "complemento"),
    nomeCondominio: campoTextual(formulario, "nomeCondominio"),
    pontoReferencia: campoTextual(formulario, "pontoReferencia"),
    exibirEnderecoExato: campoBooleano(formulario, "exibirEnderecoExato"),
    destaque: campoBooleano(formulario, "destaque"),
    caracteristicas: campoTextual(formulario, "caracteristicas"),
    recursosAdicionais: camposTextuais(formulario, "recursosAdicionais"),
  });

  if (!validacao.success) {
    const problema = validacao.error.issues[0];
    return {
      sucesso: false,
      mensagem: problema?.message ?? "Revise os dados informados.",
      status: 400,
      campo: problema?.path[0]?.toString(),
    };
  }

  const temCapa = metadados.some((midia) => midia.principal);
  if (situacao === "PUBLICADO" && !temCapa) {
    return {
      sucesso: false,
      mensagem: "Escolha uma foto de capa antes de publicar.",
      status: 400,
      campo: "midias",
    };
  }
  if (
    situacao === "PUBLICADO" &&
    !capaEhValidaParaPublicacao(metadados, opcoes?.midiasExistentes ?? [])
  ) {
    return {
      sucesso: false,
      mensagem: "A capa precisa ser uma foto, não um vídeo ou planta.",
      status: 400,
      campo: "midias",
    };
  }

  let caracteristicas: string[];
  try {
    caracteristicas = separarCaracteristicas(
      validacao.data.caracteristicas,
      validacao.data.recursosAdicionais,
    );
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: erro instanceof Error ? erro.message : "Revise as características.",
      status: 400,
      campo: "caracteristicas",
    };
  }

  let indiceArquivo = 0;
  const midiasRecebidas: MidiaRecebida[] = [];

  for (const metadado of metadados) {
    if (metadado.id) continue;
    const arquivo = arquivos[indiceArquivo];
    if (!arquivo) break;
    midiasRecebidas.push({
      arquivo,
      descricao: metadado.descricao,
      classificacao: metadado.classificacao,
      principal: metadado.principal,
      ordem: metadado.ordem,
    });
    indiceArquivo += 1;
  }

  if (midiasRecebidas.length !== novasMidias.length) {
    return {
      sucesso: false,
      mensagem: "Não foi possível validar a ordem e as informações da galeria.",
      status: 400,
      campo: "midias",
    };
  }

  return {
    sucesso: true,
    dados: validacao.data,
    caracteristicas,
    midiasRecebidas,
    metadados,
  };
}
