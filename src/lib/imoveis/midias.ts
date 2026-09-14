import { randomUUID } from "node:crypto";
import { mkdir, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const LIMITE_DE_IMAGEM = 15 * 1024 * 1024;
const LIMITE_DE_VIDEO = 150 * 1024 * 1024;
const DIMENSAO_MAXIMA_DA_IMAGEM = 2400;
export const LIMITE_TOTAL_DE_UPLOAD = 300 * 1024 * 1024;

type TipoDeMidia = "IMAGEM" | "VIDEO" | "PLANTA";

export type MidiaPreparada = {
  tipo: TipoDeMidia;
  arquivo: string;
  descricao: string | null;
  principal: boolean;
  ordem: number;
  largura: number | null;
  altura: number | null;
};

export type MidiaRecebida = {
  arquivo: File;
  descricao: string | null;
  classificacao: "IMAGEM" | "PLANTA";
  principal: boolean;
  ordem: number;
};

export type PastaTemporariaDeMidias = {
  diretorioFinal: string;
  diretorioTemporario: string;
  identificador: string;
  midias: MidiaPreparada[];
};

export class ErroDeMidia extends Error {}

export function obterDiretorioDeUploads(diretorioDoProcesso = process.cwd()) {
  const configurado =
    process.env.diretorio_uploads?.trim() ||
    process.env.DIRETORIO_UPLOADS?.trim() ||
    process.env.DIRETORIO_DE_UPLOADS?.trim();

  // Relativo ao diretório do app (ex.: public_html).
  // No Hostinger, "../uploads" fica na mesma altura que public_html.
  if (configurado) {
    return path.isAbsolute(configurado)
      ? path.normalize(configurado)
      : path.resolve(diretorioDoProcesso, configurado);
  }

  return path.resolve(diretorioDoProcesso, "..", "uploads");
}

function cabecalhoHex(buffer: Buffer, inicio: number, fim: number) {
  return buffer.subarray(inicio, fim).toString("hex");
}

function detectarFormato(buffer: Buffer) {
  if (cabecalhoHex(buffer, 0, 3) === "ffd8ff") {
    return { tipo: "IMAGEM" as const, extensao: "jpg" };
  }
  if (cabecalhoHex(buffer, 0, 8) === "89504e470d0a1a0a") {
    return { tipo: "IMAGEM" as const, extensao: "png" };
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { tipo: "IMAGEM" as const, extensao: "webp" };
  }
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    const marca = buffer.subarray(8, 12).toString("ascii");
    if (["avif", "avis"].includes(marca)) {
      return { tipo: "IMAGEM" as const, extensao: "avif" };
    }
    if (marca === "qt  ") return { tipo: "VIDEO" as const, extensao: "mov" };
    if (
      ["isom", "iso2", "mp41", "mp42", "M4V ", "avc1", "MSNV"].includes(marca)
    ) {
      return { tipo: "VIDEO" as const, extensao: "mp4" };
    }
  }
  if (cabecalhoHex(buffer, 0, 4) === "1a45dfa3") {
    return { tipo: "VIDEO" as const, extensao: "webm" };
  }
  return null;
}

async function existe(caminho: string) {
  try {
    await stat(caminho);
    return true;
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw erro;
  }
}

export function criarIdentificadorBase(titulo: string) {
  return (
    titulo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 180) || "imovel"
  );
}

export async function encontrarPastaDisponivel(
  identificadorBase: string,
  diretorioRaiz = obterDiretorioDeUploads(),
) {
  await mkdir(diretorioRaiz, { recursive: true, mode: 0o750 });
  for (let indice = 1; indice <= 10_000; indice += 1) {
    const identificador =
      indice === 1 ? identificadorBase : `${identificadorBase}-${indice}`;
    const diretorio = path.join(diretorioRaiz, identificador);
    if (!(await existe(diretorio))) return { identificador, diretorio };
  }
  throw new Error("Não foi possível reservar uma pasta para a galeria.");
}

async function processarArquivoRecebido(entrada: MidiaRecebida) {
  const original = Buffer.from(await entrada.arquivo.arrayBuffer());
  const formato = detectarFormato(original);
  if (!formato) {
    throw new ErroDeMidia(
      `O arquivo “${entrada.arquivo.name}” possui um formato não permitido.`,
    );
  }

  const limite = formato.tipo === "IMAGEM" ? LIMITE_DE_IMAGEM : LIMITE_DE_VIDEO;
  if (original.byteLength > limite) {
    throw new ErroDeMidia(
      `O arquivo “${entrada.arquivo.name}” ultrapassa o limite de ${Math.round(limite / 1024 / 1024)} MB.`,
    );
  }
  if (entrada.principal && formato.tipo !== "IMAGEM") {
    throw new ErroDeMidia("A capa do anúncio deve ser uma imagem.");
  }
  if (entrada.principal && entrada.classificacao === "PLANTA") {
    throw new ErroDeMidia("Uma planta não pode ser usada como capa.");
  }

  const tipo: TipoDeMidia =
    formato.tipo === "VIDEO" ? "VIDEO" : entrada.classificacao;
  if (formato.tipo === "VIDEO") {
    return {
      tipo,
      subpasta: "videos",
      extensao: formato.extensao,
      conteudo: original,
      largura: null,
      altura: null,
    };
  }

  try {
    const { data, info } = await sharp(original, {
      failOn: "error",
      limitInputPixels: 100_000_000,
    })
      .rotate()
      .resize({
        width: DIMENSAO_MAXIMA_DA_IMAGEM,
        height: DIMENSAO_MAXIMA_DA_IMAGEM,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: entrada.classificacao === "PLANTA" ? 88 : 82,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer({ resolveWithObject: true });

    return {
      tipo,
      subpasta: "fotos",
      extensao: "webp",
      conteudo: data,
      largura: info.width,
      altura: info.height,
    };
  } catch {
    throw new ErroDeMidia(
      `Não foi possível processar a imagem “${entrada.arquivo.name}”.`,
    );
  }
}

async function prepararArquivo(
  entrada: MidiaRecebida,
  pasta: PastaTemporariaDeMidias,
) {
  const processado = await processarArquivoRecebido(entrada);
  const { tipo, subpasta } = processado;
  const prefixo = entrada.principal ? "capa" : tipo.toLowerCase();
  const nome = `${prefixo}-${randomUUID()}.${processado.extensao}`;
  await writeFile(
    path.join(pasta.diretorioTemporario, subpasta, nome),
    processado.conteudo,
    { mode: 0o640 },
  );

  pasta.midias.push({
    tipo,
    arquivo: `${pasta.identificador}/${subpasta}/${nome}`,
    descricao: entrada.descricao,
    principal: entrada.principal,
    ordem: entrada.ordem,
    largura: processado.largura,
    altura: processado.altura,
  });
}

export async function prepararMidias(dados: {
  identificador: string;
  diretorioFinal: string;
  midias: MidiaRecebida[];
  diretorioRaiz?: string;
}) {
  const diretorioRaiz = dados.diretorioRaiz ?? obterDiretorioDeUploads();
  await mkdir(diretorioRaiz, { recursive: true, mode: 0o750 });
  const diretorioTemporario = path.join(
    diretorioRaiz,
    `.${dados.identificador}-${randomUUID()}.temporario`,
  );
  const pasta: PastaTemporariaDeMidias = {
    diretorioFinal: dados.diretorioFinal,
    diretorioTemporario,
    identificador: dados.identificador,
    midias: [],
  };
  await mkdir(path.join(diretorioTemporario, "fotos"), {
    recursive: true,
    mode: 0o750,
  });
  await mkdir(path.join(diretorioTemporario, "videos"), {
    recursive: true,
    mode: 0o750,
  });

  try {
    for (const entrada of dados.midias) await prepararArquivo(entrada, pasta);
    pasta.midias.sort((primeira, segunda) => primeira.ordem - segunda.ordem);
    return pasta;
  } catch (erro) {
    await rm(diretorioTemporario, { recursive: true, force: true });
    throw erro;
  }
}

export async function confirmarPastaDeMidias(pasta: PastaTemporariaDeMidias) {
  await rename(pasta.diretorioTemporario, pasta.diretorioFinal);
}

export async function descartarPastaDeMidias(
  pasta: PastaTemporariaDeMidias,
  incluirFinal = false,
) {
  await rm(pasta.diretorioTemporario, { recursive: true, force: true });
  if (incluirFinal) await rm(pasta.diretorioFinal, { recursive: true, force: true });
}

export function obterCaminhoAbsolutoDaMidia(
  segmentos: string[],
  diretorioRaiz = obterDiretorioDeUploads(),
) {
  const raiz = path.resolve(diretorioRaiz);
  if (
    segmentos.length !== 3 ||
    segmentos.some(
      (segmento) =>
        !segmento ||
        segmento === "." ||
        segmento === ".." ||
        /[\\/\0]/.test(segmento),
    )
  ) {
    return null;
  }
  if (!["fotos", "videos"].includes(segmentos[1])) return null;
  const caminho = path.resolve(raiz, ...segmentos);
  return caminho.startsWith(`${raiz}${path.sep}`) ? caminho : null;
}

export function criarEnderecoDaMidia(arquivo: string) {
  return `/midias/imoveis/${arquivo.split("/").map(encodeURIComponent).join("/")}`;
}

export async function adicionarMidiasAoDiretorio(dados: {
  identificador: string;
  diretorio: string;
  midias: MidiaRecebida[];
}) {
  await mkdir(path.join(dados.diretorio, "fotos"), {
    recursive: true,
    mode: 0o750,
  });
  await mkdir(path.join(dados.diretorio, "videos"), {
    recursive: true,
    mode: 0o750,
  });
  const preparadas: MidiaPreparada[] = [];
  const arquivosCriados: string[] = [];

  try {
    for (const entrada of dados.midias) {
      const processado = await processarArquivoRecebido(entrada);
      const { tipo, subpasta } = processado;
      const prefixo = entrada.principal ? "capa" : tipo.toLowerCase();
      const nome = `${prefixo}-${randomUUID()}.${processado.extensao}`;
      const caminhoCriado = path.join(dados.diretorio, subpasta, nome);
      await writeFile(caminhoCriado, processado.conteudo, { mode: 0o640 });
      arquivosCriados.push(caminhoCriado);
      preparadas.push({
        tipo,
        arquivo: `${dados.identificador}/${subpasta}/${nome}`,
        descricao: entrada.descricao,
        principal: entrada.principal,
        ordem: entrada.ordem,
        largura: processado.largura,
        altura: processado.altura,
      });
    }
  } catch (erro) {
    await Promise.allSettled(arquivosCriados.map((arquivo) => unlink(arquivo)));
    throw erro;
  }

  preparadas.sort((primeira, segunda) => primeira.ordem - segunda.ordem);
  return preparadas;
}

export async function excluirArquivoDeMidia(
  arquivo: string,
  diretorioRaiz = obterDiretorioDeUploads(),
) {
  const segmentos = arquivo.split("/");
  const caminho = obterCaminhoAbsolutoDaMidia(segmentos, diretorioRaiz);
  if (!caminho) return;
  try {
    await unlink(caminho);
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code !== "ENOENT") throw erro;
  }
}

export async function excluirPastaDoImovel(identificador: string) {
  const diretorio = path.join(obterDiretorioDeUploads(), identificador);
  await rm(diretorio, { recursive: true, force: true });
}
