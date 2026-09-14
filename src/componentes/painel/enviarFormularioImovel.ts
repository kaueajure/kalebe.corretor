import type { MidiaSelecionada } from "./GaleriaMidias";

type AcaoDeEnvio = "RASCUNHO" | "PUBLICAR";

type OpcoesDeEnvio = {
  corpo: FormData;
  modo: "criar" | "editar";
  imovelId?: number;
  acao: AcaoDeEnvio;
};

type RespostaDaApi = {
  mensagem?: string;
  campo?: string;
};

export function validarFormularioAntesDoEnvio(opcoes: {
  modo: "criar" | "editar";
  imovelId?: number;
  acao: AcaoDeEnvio;
  temCapa: boolean;
}) {
  if (opcoes.modo === "editar" && (!opcoes.imovelId || opcoes.imovelId <= 0)) {
    return "Não foi possível identificar o imóvel para edição.";
  }
  if (opcoes.acao === "PUBLICAR" && !opcoes.temCapa) {
    return "Escolha uma foto de capa antes de publicar.";
  }
  return null;
}

export function montarCorpoDoFormularioDeImovel(
  elemento: HTMLFormElement,
  midias: MidiaSelecionada[],
  acao: AcaoDeEnvio,
) {
  const corpo = new FormData(elemento);
  corpo.set("acao", acao);
  corpo.delete("selecionarMidias");
  corpo.delete("capaEscolhida");

  for (const midia of midias) {
    if (midia.arquivo) corpo.append("midias", midia.arquivo);
  }

  corpo.set(
    "metadadosMidias",
    JSON.stringify(
      midias.map((midia, ordem) => ({
        ...(midia.idBanco ? { id: midia.idBanco } : {}),
        descricao: midia.descricao.trim() || null,
        classificacao: midia.classificacao,
        principal: midia.principal,
        ordem,
      })),
    ),
  );

  return corpo;
}

export async function enviarFormularioDeImovel(opcoes: OpcoesDeEnvio) {
  const url =
    opcoes.modo === "editar" && opcoes.imovelId
      ? `/painel/imoveis/api/${opcoes.imovelId}`
      : "/painel/imoveis/api";
  const metodo = opcoes.modo === "editar" ? "PUT" : "POST";

  const resposta = await fetch(url, {
    method: metodo,
    body: opcoes.corpo,
    credentials: "same-origin",
  });

  const resultado = (await resposta.json().catch(() => null)) as RespostaDaApi | null;

  if (!resposta.ok) {
    return {
      sucesso: false as const,
      status: resposta.status,
      mensagem:
        resultado?.mensagem ??
        `Não foi possível ${opcoes.modo === "editar" ? "atualizar" : "cadastrar"} o imóvel.`,
      campo: resultado?.campo,
    };
  }

  return { sucesso: true as const, acao: opcoes.acao };
}

export function focarCampoDoFormulario(
  elemento: HTMLFormElement | null | undefined,
  campo?: string,
) {
  if (!campo || !elemento) return;
  const nome = campo === "midias" ? "selecionarMidias" : campo;
  const alvo =
    elemento.elements.namedItem(nome) ??
    elemento.querySelector<HTMLElement>(`[name="${CSS.escape(nome)}"]`);
  if (alvo instanceof HTMLElement) {
    alvo.focus();
    alvo.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
