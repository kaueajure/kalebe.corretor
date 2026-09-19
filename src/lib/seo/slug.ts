const PREFIXOS_RESERVADOS = new Set(["cidade", "bairro", "condominio"]);

/** Normaliza texto para slug seguro de URL. */
export function criarSlug(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Evita conflito com rotas estáticas `/imoveis/cidade|bairro|condominio`. */
export function evitarIdentificadorReservado(slug: string): string {
  const base = slug || "imovel";
  if (PREFIXOS_RESERVADOS.has(base)) return `${base}-2`;
  return base;
}

export function ehPrefixoReservado(slug: string): boolean {
  return PREFIXOS_RESERVADOS.has(slug);
}

export { PREFIXOS_RESERVADOS };
