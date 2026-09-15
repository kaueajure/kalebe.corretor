"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { validarSenhaNova } from "@/lib/seguranca/senha";
import { criarUsuarioAdministrador } from "@/lib/usuarios";

export type EstadoDaCriacaoDeUsuario = {
  sucesso: boolean;
  mensagem?: string;
  campo?: "nome" | "email" | "senhaInicial";
};

const esquema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo.").max(191),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido.").max(191),
  senhaInicial: z.string().min(1, "Informe a senha inicial."),
});

export async function criarUsuario(
  _estado: EstadoDaCriacaoDeUsuario,
  formulario: FormData,
): Promise<EstadoDaCriacaoDeUsuario> {
  const sessao = await exigirSessaoPainel();
  if (!sessao.desenvolvedor) {
    return { sucesso: false, mensagem: "Apenas desenvolvedores podem criar usuários." };
  }

  const validacao = esquema.safeParse({
    nome: String(formulario.get("nome") ?? ""),
    email: String(formulario.get("email") ?? ""),
    senhaInicial: String(formulario.get("senhaInicial") ?? ""),
  });
  if (!validacao.success) {
    const problema = validacao.error.issues[0];
    return {
      sucesso: false,
      mensagem: problema?.message ?? "Revise os dados informados.",
      campo: problema?.path[0] as EstadoDaCriacaoDeUsuario["campo"],
    };
  }

  const erroDaSenha = validarSenhaNova(validacao.data.senhaInicial);
  if (erroDaSenha) {
    return { sucesso: false, mensagem: erroDaSenha, campo: "senhaInicial" };
  }

  try {
    const senha = await bcrypt.hash(validacao.data.senhaInicial, 12);
    await criarUsuarioAdministrador({
      nome: validacao.data.nome,
      email: validacao.data.email,
      senha,
    });
  } catch (erro) {
    if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
      return { sucesso: false, mensagem: "Já existe um usuário com este e-mail.", campo: "email" };
    }
    console.error("Falha ao criar usuário:", erro);
    return { sucesso: false, mensagem: "Não foi possível criar o usuário." };
  }

  revalidatePath("/painel/usuarios");
  return { sucesso: true, mensagem: "Usuário criado. A troca de senha será exigida no primeiro acesso." };
}
