"use server";

import { revalidatePath } from "next/cache";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { definirManutencao } from "@/lib/manutencao";

export type EstadoManutencao = {
  ativa: boolean;
  mensagem?: string;
  erro?: string;
};

export async function alterarManutencao(
  estado: EstadoManutencao,
  formulario: FormData,
): Promise<EstadoManutencao> {
  const sessao = await exigirSessaoPainel();
  if (!sessao.desenvolvedor) {
    return { ...estado, erro: "Apenas desenvolvedores podem alterar a manutenção." };
  }

  const valor = formulario.get("ativa");
  if (valor !== "0" && valor !== "1") {
    return { ...estado, erro: "Escolha um estado válido." };
  }

  const ativa = valor === "1";
  try {
    await definirManutencao(ativa);
  } catch (erro) {
    console.error("Falha ao alterar a manutenção:", erro);
    return { ...estado, erro: "Não foi possível alterar a manutenção. Tente novamente." };
  }

  revalidatePath("/painel/manutencao");
  return {
    ativa,
    mensagem: ativa ? "Manutenção ativada." : "Manutenção desativada.",
  };
}
