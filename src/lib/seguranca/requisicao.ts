import "server-only";

function origensPermitidas(requisicao: Request) {
  const origens = new Set<string>([new URL(requisicao.url).origin]);
  for (const valor of [process.env.ORIGEM_SITE, process.env.NEXT_PUBLIC_SITE_URL]) {
    if (!valor) continue;
    try { origens.add(new URL(valor).origin); } catch { /* configuração inválida é ignorada */ }
  }
  const host = requisicao.headers.get("x-forwarded-host");
  if (host) {
    const protocolo = requisicao.headers.get("x-forwarded-proto") === "http" ? "http" : "https";
    try { origens.add(new URL(`${protocolo}://${host}`).origin); } catch { /* cabeçalho inválido */ }
  }
  return origens;
}

export function requisicaoTemOrigemPermitida(requisicao: Request) {
  const contexto = requisicao.headers.get("sec-fetch-site");
  if (contexto === "cross-site") return false;
  const origem = requisicao.headers.get("origin");
  if (!origem) return false;
  try { return origensPermitidas(requisicao).has(new URL(origem).origin); } catch { return false; }
}

export const CABECALHOS_SEM_CACHE = { "Cache-Control": "no-store" } as const;
