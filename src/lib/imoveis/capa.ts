export type MidiaExistenteParaCapa = {
  id: number;
  tipo: "IMAGEM" | "VIDEO" | "PLANTA";
};

export type MetadadoDeCapa = {
  id?: number;
  principal: boolean;
  classificacao: "IMAGEM" | "PLANTA";
};

export function capaEhValidaParaPublicacao(
  metadados: MetadadoDeCapa[],
  midiasExistentes: MidiaExistenteParaCapa[] = [],
) {
  const capa = metadados.find((midia) => midia.principal);
  if (!capa) return false;
  if (capa.classificacao !== "IMAGEM") return false;
  if (capa.id === undefined) return true;

  const existente = midiasExistentes.find((midia) => midia.id === capa.id);
  return existente?.tipo === "IMAGEM";
}
