/** Preserva a grafia e remove apenas diferenças de Unicode e espaços. */
export function limparNomeLocal(valor: string): string {
  return valor.normalize("NFC").trim().replace(/\s+/gu, " ");
}

/** Chave de comparação compartilhada pelo cadastro, filtros e catálogo. */
export function normalizarTexto(valor: string | null | undefined): string {
  return limparNomeLocal(valor ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

export function mesmoLocal(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizarTexto(a) === normalizarTexto(b);
}

function acentos(valor: string): number {
  return valor.normalize("NFD").match(/\p{M}/gu)?.length ?? 0;
}

/** Escolhe uma grafia cadastrada, dando preferência à que contém acentos. */
export function escolherNomeLocal(nomes: string[]): string {
  const nome = nomes.map(limparNomeLocal).filter(Boolean).sort((a, b) =>
    acentos(b) - acentos(a) || a.localeCompare(b, "pt-BR") || a.localeCompare(b, "en"),
  )[0] ?? "";
  // Corrige nomes inteiramente em caixa alta/baixa sem alterar grafias mistas.
  if (nome !== nome.toLocaleLowerCase("pt-BR") && nome !== nome.toLocaleUpperCase("pt-BR")) return nome;
  const conectivos = new Set(["de", "da", "das", "do", "dos", "e"]);
  return nome.toLocaleLowerCase("pt-BR").split(" ").map((palavra, indice) =>
    indice > 0 && conectivos.has(palavra)
      ? palavra
      : palavra.charAt(0).toLocaleUpperCase("pt-BR") + palavra.slice(1),
  ).join(" ");
}

export function nomesLocaisUnicos(valores: (string | null | undefined)[]): string[] {
  const grupos = new Map<string, string[]>();
  for (const valor of valores) {
    const chave = normalizarTexto(valor);
    if (!chave || !valor) continue;
    const grupo = grupos.get(chave) ?? [];
    grupo.push(valor);
    grupos.set(chave, grupo);
  }
  return [...grupos.values()].map(escolherNomeLocal).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function resolverNomeLocal(nomes: string[], valor: string): string {
  return nomes.find((nome) => mesmoLocal(nome, valor)) ?? valor;
}
