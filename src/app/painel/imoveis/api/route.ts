import {
  confirmarPastaDeMidias,
  criarIdentificadorBase,
  descartarPastaDeMidias,
  encontrarPastaDisponivel,
  ErroDeMidia,
  LIMITE_TOTAL_DE_UPLOAD,
  prepararMidias,
  type PastaTemporariaDeMidias,
} from "@/lib/imoveis/midias";
import { obterSessaoPainelAutorizada } from "@/lib/imoveis/auth-painel";
import {
  formularioFoiProcessadoComSucesso,
  processarFormularioDeImovel,
} from "@/lib/imoveis/processar-formulario";
import {
  cadastrarImovel,
  identificadorEstaDisponivel,
} from "@/lib/imoveis/repositorio";
import { banco } from "@/lib/banco";

export const runtime = "nodejs";

function respostaDeErro(mensagem: string, status: number, campo?: string) {
  return Response.json({ sucesso: false, mensagem, campo }, { status });
}

export async function POST(requisicao: Request) {
  const sessao = await obterSessaoPainelAutorizada();
  if (!sessao) {
    return respostaDeErro(
      "Sua sessão expirou. Entre novamente para continuar.",
      401,
    );
  }

  const tamanhoDeclarado = Number(requisicao.headers.get("content-length") ?? 0);
  if (
    Number.isFinite(tamanhoDeclarado) &&
    tamanhoDeclarado > LIMITE_TOTAL_DE_UPLOAD + 1024 * 1024
  ) {
    return respostaDeErro(
      "O conjunto de arquivos ultrapassa o limite total de 300 MB.",
      413,
    );
  }

  let formulario: FormData;
  try {
    formulario = await requisicao.formData();
  } catch {
    return respostaDeErro("Não foi possível ler os dados enviados.", 400);
  }

  const processado = processarFormularioDeImovel(formulario);
  if (!formularioFoiProcessadoComSucesso(processado)) {
    return respostaDeErro(
      processado.mensagem,
      processado.status,
      processado.campo,
    );
  }

  const { dados, caracteristicas, midiasRecebidas } = processado;
  const situacao = dados.situacao;
  const conexao = await banco.getConnection();
  let pasta: PastaTemporariaDeMidias | null = null;
  let pastaConfirmada = false;

  try {
    const base = criarIdentificadorBase(dados.titulo);
    let reserva = await encontrarPastaDisponivel(base);
    let indice = 2;
    while (!(await identificadorEstaDisponivel(conexao, reserva.identificador))) {
      reserva = await encontrarPastaDisponivel(`${base}-${indice}`);
      indice += 1;
    }

    if (midiasRecebidas.length) {
      pasta = await prepararMidias({
        identificador: reserva.identificador,
        diretorioFinal: reserva.diretorio,
        midias: midiasRecebidas,
      });
      if (
        situacao === "PUBLICADO" &&
        !pasta.midias.some((midia) => midia.principal && midia.tipo === "IMAGEM")
      ) {
        throw new ErroDeMidia(
          "A capa precisa ser uma foto, não um vídeo ou planta.",
        );
      }
    }

    await conexao.beginTransaction();
    const resultado = await cadastrarImovel(conexao, {
      ...dados,
      identificador: reserva.identificador,
      caracteristicasSeparadas: caracteristicas,
      midias: pasta?.midias ?? [],
    });
    if (pasta) {
      await confirmarPastaDeMidias(pasta);
      pastaConfirmada = true;
    }
    await conexao.commit();
    return Response.json(
      { sucesso: true, imovel: resultado, situacao },
      { status: 201 },
    );
  } catch (erro) {
    try {
      await conexao.rollback();
    } catch {
      /* ignora rollback sem transação ativa */
    }
    if (pasta) await descartarPastaDeMidias(pasta, pastaConfirmada);
    console.error("Falha ao cadastrar imóvel:", erro);
    const mensagem =
      erro instanceof ErroDeMidia
        ? erro.message
        : "Não foi possível cadastrar o imóvel. Tente novamente.";
    return respostaDeErro(mensagem, erro instanceof ErroDeMidia ? 400 : 500);
  } finally {
    conexao.release();
  }
}
