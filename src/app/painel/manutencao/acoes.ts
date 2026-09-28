"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import {
  manutencaoAtiva,
  salvarConfiguracaoManutencao,
  type ConfiguracaoManutencao,
} from "@/lib/manutencao";

export type EstadoManutencao = ConfiguracaoManutencao & {
  mensagem?: string;
  erro?: string;
};

const esquema = z.object({
  intencao: z.enum(["salvar", "ativar", "desativar"]),
  rotulo: z.string().trim().max(80, "O texto superior deve ter até 80 caracteres."),
  titulo: z.string().trim().min(3, "Informe um título com ao menos 3 caracteres.").max(140, "O título deve ter até 140 caracteres."),
  mensagemPrincipal: z.string().trim().min(5, "Informe uma mensagem principal com ao menos 5 caracteres.").max(1000, "A mensagem principal deve ter até 1.000 caracteres."),
  mensagemComplementar: z.string().trim().max(600, "A mensagem complementar deve ter até 600 caracteres."),
});

export async function alterarManutencao(
  estado: EstadoManutencao,
  formulario: FormData,
): Promise<EstadoManutencao> {
  const sessao = await exigirSessaoPainel();
  if (!sessao.desenvolvedor) {
    return { ...estado, mensagem: undefined, erro: "Apenas desenvolvedores podem alterar a manutenção." };
  }

  const validacao = esquema.safeParse({
    intencao: formulario.get("intencao"),
    rotulo: formulario.get("rotulo"),
    titulo: formulario.get("titulo"),
    mensagemPrincipal: formulario.get("mensagemPrincipal"),
    mensagemComplementar: formulario.get("mensagemComplementar"),
  });
  if (!validacao.success) {
    return {
      ...estado,
      mensagem: undefined,
      erro: validacao.error.issues[0]?.message ?? "Revise os textos da manutenção.",
    };
  }

  try {
    const ativa = validacao.data.intencao === "salvar"
      ? await manutencaoAtiva()
      : validacao.data.intencao === "ativar";
    const configuracao: ConfiguracaoManutencao = {
      ativa,
      rotulo: validacao.data.rotulo,
      titulo: validacao.data.titulo,
      mensagemPrincipal: validacao.data.mensagemPrincipal,
      mensagemComplementar: validacao.data.mensagemComplementar,
    };
    await salvarConfiguracaoManutencao(configuracao);
    revalidatePath("/painel/manutencao");
    revalidatePath("/manutencao");
    return {
      ...configuracao,
      mensagem: validacao.data.intencao === "salvar"
        ? "Mensagem de manutenção salva."
        : ativa
          ? "Mensagem salva e manutenção ativada."
          : "Mensagem salva e manutenção desativada.",
    };
  } catch (erro) {
    console.error("Falha ao salvar a manutenção:", erro);
    return { ...estado, mensagem: undefined, erro: "Não foi possível salvar a manutenção. Tente novamente." };
  }
}
