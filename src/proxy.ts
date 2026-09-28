import { randomUUID } from "node:crypto";
import { jwtVerify } from "jose";
import type { RowDataPacket } from "mysql2";
import { NextResponse, type NextRequest } from "next/server";
import { banco } from "@/lib/banco";
import { manutencaoAtiva } from "@/lib/manutencao";

type LinhaDesenvolvedor = RowDataPacket & { desenvolvedor: number | boolean };

async function acessoDeDesenvolvedor(requisicao: NextRequest): Promise<boolean> {
  const token = requisicao.cookies.get("sessao_painel")?.value;
  const segredo = process.env.sessao_secreta?.trim() || process.env.SESSAO_SECRETA?.trim();
  if (!token || !segredo || segredo.length < 32) return false;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(segredo));
    if (typeof payload.id !== "string" || payload.desenvolvedor !== true) return false;
    const [linhas] = await banco.execute<LinhaDesenvolvedor[]>(
      "SELECT desenvolvedor FROM usuarios WHERE id = :id LIMIT 1",
      { id: payload.id },
    );
    return Boolean(linhas[0]?.desenvolvedor);
  } catch {
    return false;
  }
}

export async function proxy(requisicao: NextRequest) {
  const nonce = Buffer.from(randomUUID()).toString("base64");
  const desenvolvimento = process.env.NODE_ENV !== "production";
  const politica = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desenvolvimento ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    `connect-src 'self'${desenvolvimento ? " ws: http: https:" : ""}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(desenvolvimento ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const cabecalhosDaRequisicao = new Headers(requisicao.headers);
  cabecalhosDaRequisicao.set("x-nonce", nonce);
  cabecalhosDaRequisicao.set("Content-Security-Policy", politica);
  const ativa = await manutencaoAtiva();
  const caminho = requisicao.nextUrl.pathname;
  let resposta: NextResponse;

  if (ativa && caminho !== "/login" && caminho !== "/manutencao" &&
      !(await acessoDeDesenvolvedor(requisicao))) {
    resposta = NextResponse.redirect(new URL("/manutencao", requisicao.url), {
      status: requisicao.method === "GET" || requisicao.method === "HEAD" ? 307 : 303,
    });
  } else if (!ativa && caminho === "/manutencao") {
    resposta = NextResponse.redirect(new URL("/", requisicao.url));
  } else {
    resposta = NextResponse.next({ request: { headers: cabecalhosDaRequisicao } });
  }

  if (ativa) resposta.headers.set("Cache-Control", "no-store");
  resposta.headers.set("Content-Security-Policy", politica);
  resposta.headers.set("X-Content-Type-Options", "nosniff");
  resposta.headers.set("X-Frame-Options", "DENY");
  resposta.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  resposta.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  resposta.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  return resposta;
}

export const config = {
  matcher: [{ source: "/((?!_next/static).*)" }],
};
