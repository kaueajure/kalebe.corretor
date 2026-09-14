"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { criarSessao, limparSessao } from "@/lib/sessao";
import { buscarUsuarioPorEmail } from "@/lib/usuarios";

export type ResultadoLogin = {
  ok: boolean;
  erro?: string;
};

export async function entrarPainel(
  _estado: ResultadoLogin,
  formulario: FormData
): Promise<ResultadoLogin> {
  const email = String(formulario.get("email") || "")
    .trim()
    .toLowerCase();
  const senha = String(formulario.get("senha") || "");

  if (!email || !senha) {
    return { ok: false, erro: "Informe e-mail e senha." };
  }

  const usuario = await buscarUsuarioPorEmail(email);

  if (!usuario) {
    return { ok: false, erro: "E-mail ou senha inválidos." };
  }

  if (!usuario.administrador && !usuario.desenvolvedor) {
    return { ok: false, erro: "Este usuário não tem acesso ao painel." };
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senha);
  if (!senhaOk) {
    return { ok: false, erro: "E-mail ou senha inválidos." };
  }

  await criarSessao({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    administrador: usuario.administrador,
    desenvolvedor: usuario.desenvolvedor,
  });

  redirect("/painel");
}

export async function sairPainel() {
  await limparSessao();
  redirect("/login");
}
