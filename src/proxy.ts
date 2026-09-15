import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(requisicao: NextRequest) {
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
  const resposta = NextResponse.next({ request: { headers: cabecalhosDaRequisicao } });
  resposta.headers.set("Content-Security-Policy", politica);
  resposta.headers.set("X-Content-Type-Options", "nosniff");
  resposta.headers.set("X-Frame-Options", "DENY");
  resposta.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  resposta.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  resposta.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  return resposta;
}

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)" }],
};
