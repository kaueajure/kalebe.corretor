import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import {
  obterCaminhoAbsolutoDaMidia,
  recuperarMidiaDeDeployAnterior,
} from "@/lib/imoveis/midias";

export const runtime = "nodejs";

type ContextoDaRota = {
  params: Promise<{ caminho: string[] }>;
};

const tiposPorExtensao: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

function cabecalhos(caminho: string, tamanho: number) {
  const tipo = tiposPorExtensao[path.extname(caminho).toLowerCase()];
  if (!tipo) return null;
  return new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(tamanho),
    "Content-Type": tipo,
    "Content-Disposition": "inline",
    "Cross-Origin-Resource-Policy": "same-site",
    "X-Content-Type-Options": "nosniff",
  });
}

async function localizar(contexto: ContextoDaRota) {
  const { caminho } = await contexto.params;
  const origens = [
    obterCaminhoAbsolutoDaMidia(caminho),
    obterCaminhoAbsolutoDaMidia(
      caminho,
      path.join(process.cwd(), "public", "midias", "imoveis"),
    ),
  ];

  for (const caminhoAbsoluto of origens) {
    if (!caminhoAbsoluto) continue;
    try {
      const informacoes = await stat(caminhoAbsoluto);
      if (informacoes.isFile()) {
        return { caminhoAbsoluto, tamanho: informacoes.size };
      }
    } catch {
      // Tenta a cópia versionada quando o volume externo não possui o arquivo.
    }
  }

  const recuperado = await recuperarMidiaDeDeployAnterior(caminho);
  if (recuperado) {
    try {
      const informacoes = await stat(recuperado);
      if (informacoes.isFile()) {
        return { caminhoAbsoluto: recuperado, tamanho: informacoes.size };
      }
    } catch {
      // O arquivo pode ter sido removido entre a recuperação e a leitura.
    }
  }
  return null;
}

export async function GET(requisicao: Request, contexto: ContextoDaRota) {
  const arquivo = await localizar(contexto);
  if (!arquivo) return new Response("Arquivo não encontrado.", { status: 404 });
  const headers = cabecalhos(arquivo.caminhoAbsoluto, arquivo.tamanho);
  if (!headers) return new Response("Formato não permitido.", { status: 415 });

  const intervalo = requisicao.headers
    .get("range")
    ?.match(/^bytes=(\d+)-(\d*)$/);
  let inicio = 0;
  let fim = arquivo.tamanho - 1;
  let status = 200;

  if (intervalo) {
    inicio = Number(intervalo[1]);
    fim = intervalo[2] ? Math.min(Number(intervalo[2]), fim) : fim;
    if (
      !Number.isSafeInteger(inicio) ||
      !Number.isSafeInteger(fim) ||
      inicio > fim ||
      inicio >= arquivo.tamanho
    ) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${arquivo.tamanho}` },
      });
    }
    status = 206;
    headers.set("Content-Length", String(fim - inicio + 1));
    headers.set(
      "Content-Range",
      `bytes ${inicio}-${fim}/${arquivo.tamanho}`,
    );
  }

  const fluxo = Readable.toWeb(
    createReadStream(arquivo.caminhoAbsoluto, { start: inicio, end: fim }),
  );
  return new Response(fluxo as ReadableStream, { status, headers });
}

export async function HEAD(_requisicao: Request, contexto: ContextoDaRota) {
  const arquivo = await localizar(contexto);
  if (!arquivo) return new Response(null, { status: 404 });
  const headers = cabecalhos(arquivo.caminhoAbsoluto, arquivo.tamanho);
  return headers
    ? new Response(null, { headers })
    : new Response(null, { status: 415 });
}
