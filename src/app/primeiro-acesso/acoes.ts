"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { criarSessao, lerSessao } from "@/lib/sessao";
import { validarSenhaNova } from "@/lib/seguranca/senha";
import { buscarUsuarioPorId, concluirPrimeiroAcesso } from "@/lib/usuarios";

export type EstadoDaTrocaDeSenha = { erro?: string };

export async function trocarSenhaInicial(
  _estado: EstadoDaTrocaDeSenha,
  formulario: FormData,
): Promise<EstadoDaTrocaDeSenha> {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");
  if (!sessao.alterarSenha) redirect("/painel");

  const senhaInicial = String(formulario.get("senhaInicial") ?? "");
  const senhaNova = String(formulario.get("senhaNova") ?? "");
  const confirmarSenhaNova = String(formulario.get("confirmarSenhaNova") ?? "");
  if (!senhaInicial || !senhaNova || !confirmarSenhaNova) {
    return { erro: "Preencha as três senhas." };
  }

  const erroDaSenha = validarSenhaNova(senhaNova);
  if (erroDaSenha) return { erro: erroDaSenha };
  if (senhaNova !== confirmarSenhaNova) {
    return { erro: "A confirmação da nova senha não confere." };
  }

  const usuario = await buscarUsuarioPorId(sessao.id);
  if (!usuario || !usuario.alterarSenha) redirect("/login");
  if (!(await bcrypt.compare(senhaInicial, usuario.senha))) {
    return { erro: "A senha inicial está incorreta." };
  }
  if (await bcrypt.compare(senhaNova, usuario.senha)) {
    return { erro: "A nova senha precisa ser diferente da senha inicial." };
  }

  const senha = await bcrypt.hash(senhaNova, 12);
  if (!(await concluirPrimeiroAcesso(usuario.id, senha))) {
    return { erro: "Não foi possível concluir a troca. Entre novamente." };
  }

  await criarSessao({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    administrador: usuario.administrador,
    desenvolvedor: usuario.desenvolvedor,
    alterarSenha: false,
  });
  redirect("/painel");
}
