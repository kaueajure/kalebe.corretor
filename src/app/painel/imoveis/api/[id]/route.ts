import path from "node:path";
import { obterSessaoPainelAutorizada } from "@/lib/imoveis/auth-painel";
import {
  adicionarMidiasAoDiretorio,
  ErroDeMidia,
  excluirArquivoDeMidia,
  excluirPastaDoImovel,
  LIMITE_TOTAL_DE_UPLOAD,
  obterDiretorioDeUploads,
} from "@/lib/imoveis/midias";
import {
  formularioFoiProcessadoComSucesso,
  processarFormularioDeImovel,
} from "@/lib/imoveis/processar-formulario";
import {
  atualizarImovel,
  excluirImovel,
  obterImovelParaEdicao,
} from "@/lib/imoveis/repositorio";
import { banco } from "@/lib/banco";
import { revalidatePath } from "next/cache";
import { CABECALHOS_SEM_CACHE, requisicaoTemOrigemPermitida } from "@/lib/seguranca/requisicao";

export const runtime = "nodejs";

type ContextoDaRota = {
  params: Promise<{ id: string }>;
};

function respostaDeErro(mensagem: string, status: number, campo?: string) {
  return Response.json({ sucesso: false, mensagem, campo }, { status, headers: CABECALHOS_SEM_CACHE });
}

function lerId(idTexto: string | undefined) {
  const id = Number(idTexto);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(requisicao: Request, contexto: ContextoDaRota) {
  if (!requisicaoTemOrigemPermitida(requisicao)) {
    return respostaDeErro("Requisição não autorizada.", 403);
  }
  const sessao = await obterSessaoPainelAutorizada();
  if (!sessao) {
    return respostaDeErro(
      "Sua sessão expirou. Entre novamente para continuar.",
      401,
    );
  }

  const { id: idTexto } = await contexto.params;
  const id = lerId(idTexto);
  if (!id) return respostaDeErro("Imóvel inválido.", 400);

  const imovel = await obterImovelParaEdicao(id);
  if (!imovel) return respostaDeErro("Imóvel não encontrado.", 404);

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

  const processado = processarFormularioDeImovel(formulario, {
    midiasExistentes: imovel.midias.map((midia) => ({
      id: midia.id,
      tipo: midia.tipo,
    })),
  });
  if (!formularioFoiProcessadoComSucesso(processado)) {
    return respostaDeErro(
      processado.mensagem,
      processado.status,
      processado.campo,
    );
  }

  const { dados, metadados, midiasRecebidas, caracteristicas } = processado;

  const idsInformados = new Set(
    metadados.flatMap((midia) => (midia.id !== undefined ? [midia.id] : [])),
  );
  const midiasRemovidas = imovel.midias
    .filter((midia) => !idsInformados.has(midia.id))
    .map((midia) => ({ id: midia.id, arquivo: midia.arquivo }));

  const conexao = await banco.getConnection();
  const arquivosNovos: string[] = [];
  let alteracaoConfirmada = false;
  let transacaoIniciada = false;

  try {
    const diretorio = path.join(obterDiretorioDeUploads(), imovel.identificador);
    const novasMidias =
      midiasRecebidas.length > 0
        ? await adicionarMidiasAoDiretorio({
            identificador: imovel.identificador,
            diretorio,
            midias: midiasRecebidas,
          })
        : [];

    for (const midia of novasMidias) arquivosNovos.push(midia.arquivo);

    await conexao.beginTransaction();
    transacaoIniciada = true;
    await atualizarImovel(conexao, id, {
      ...dados,
      identificador: imovel.identificador,
      caracteristicasSeparadas: caracteristicas,
      metadados,
      novasMidias,
      midiasRemovidas,
      midiasExistentes: imovel.midias.map((midia) => ({
        id: midia.id,
        tipo: midia.tipo,
        arquivo: midia.arquivo,
      })),
    });
    await conexao.commit();
    alteracaoConfirmada = true;
    revalidatePath("/");
    revalidatePath("/imoveis");
    revalidatePath(`/imoveis/${imovel.identificador}`);
    revalidatePath("/sitemap.xml");

    const limpezas = await Promise.allSettled(
      midiasRemovidas.map((removida) => excluirArquivoDeMidia(removida.arquivo)),
    );
    if (limpezas.some((resultado) => resultado.status === "rejected")) {
      console.error(
        "Imóvel atualizado, mas uma mídia antiga não pôde ser removida.",
        { id },
      );
    }

    return Response.json({ sucesso: true, situacao: dados.situacao }, { headers: CABECALHOS_SEM_CACHE });
  } catch (erro) {
    if (transacaoIniciada && !alteracaoConfirmada) {
      try {
        await conexao.rollback();
      } catch {
        /* ignora falha de rollback */
      }
    }
    if (!alteracaoConfirmada) {
      await Promise.allSettled(
        arquivosNovos.map((arquivo) => excluirArquivoDeMidia(arquivo)),
      );
    }
    console.error("Falha ao atualizar imóvel:", erro);
    const mensagem =
      erro instanceof ErroDeMidia
        ? erro.message
        : "Não foi possível atualizar o imóvel. Tente novamente.";
    return respostaDeErro(mensagem, erro instanceof ErroDeMidia ? 400 : 500);
  } finally {
    conexao.release();
  }
}

export async function DELETE(requisicao: Request, contexto: ContextoDaRota) {
  if (!requisicaoTemOrigemPermitida(requisicao)) {
    return respostaDeErro("Requisição não autorizada.", 403);
  }
  const sessao = await obterSessaoPainelAutorizada();
  if (!sessao) {
    return respostaDeErro(
      "Sua sessão expirou. Entre novamente para continuar.",
      401,
    );
  }

  const { id: idTexto } = await contexto.params;
  const id = lerId(idTexto);
  if (!id) return respostaDeErro("Imóvel inválido.", 400);

  const conexao = await banco.getConnection();
  try {
    await conexao.beginTransaction();
    const resultado = await excluirImovel(conexao, id);
    if (!resultado) {
      await conexao.rollback();
      return respostaDeErro("Imóvel não encontrado.", 404);
    }
    await conexao.commit();
    revalidatePath("/");
    revalidatePath("/imoveis");
    revalidatePath(`/imoveis/${resultado.identificador}`);
    revalidatePath("/sitemap.xml");
    try {
      await excluirPastaDoImovel(resultado.identificador);
    } catch (erro) {
      console.error(
        "Imóvel excluído, mas a pasta de mídias não pôde ser removida:",
        erro,
      );
    }
    return Response.json({ sucesso: true }, { headers: CABECALHOS_SEM_CACHE });
  } catch (erro) {
    try {
      await conexao.rollback();
    } catch {
      /* transação já encerrada */
    }
    console.error("Falha ao excluir imóvel:", erro);
    return respostaDeErro(
      "Não foi possível excluir o imóvel. Tente novamente.",
      500,
    );
  } finally {
    conexao.release();
  }
}
