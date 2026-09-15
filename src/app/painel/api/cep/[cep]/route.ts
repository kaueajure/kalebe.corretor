import { obterSessaoPainelAutorizada } from "@/lib/imoveis/auth-painel";
import { CABECALHOS_SEM_CACHE } from "@/lib/seguranca/requisicao";

export const runtime = "nodejs";

type Contexto = { params: Promise<{ cep: string }> };
type RespostaViaCep = Record<string, unknown>;

function texto(dados: RespostaViaCep, campo: string, maximo: number) {
  const valor = dados[campo];
  return typeof valor === "string" ? valor.trim().slice(0, maximo) : "";
}

export async function GET(_requisicao: Request, contexto: Contexto) {
  if (!(await obterSessaoPainelAutorizada())) {
    return Response.json(
      { mensagem: "Sua sessão expirou. Entre novamente para continuar." },
      { status: 401, headers: CABECALHOS_SEM_CACHE },
    );
  }

  const { cep } = await contexto.params;
  if (!/^\d{8}$/.test(cep)) {
    return Response.json(
      { mensagem: "Informe um CEP com 8 números." },
      { status: 400, headers: CABECALHOS_SEM_CACHE },
    );
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(6_000),
    });
    if (!resposta.ok) throw new Error(`ViaCEP respondeu ${resposta.status}`);

    const dados = (await resposta.json()) as RespostaViaCep;
    if (dados.erro === true) {
      return Response.json(
        { mensagem: "CEP não encontrado." },
        { status: 404, headers: CABECALHOS_SEM_CACHE },
      );
    }

    return Response.json(
      {
        cep: texto(dados, "cep", 9),
        estado: texto(dados, "uf", 2),
        cidade: texto(dados, "localidade", 160),
        bairro: texto(dados, "bairro", 160),
        logradouro: texto(dados, "logradouro", 220),
      },
      { headers: { "Cache-Control": "private, max-age=86400" } },
    );
  } catch (erro) {
    console.error("Falha ao consultar CEP:", erro);
    return Response.json(
      { mensagem: "A consulta de CEP está indisponível no momento." },
      { status: 502, headers: CABECALHOS_SEM_CACHE },
    );
  }
}
