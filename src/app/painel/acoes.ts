"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { criarSessao, limparSessao } from "@/lib/sessao";
import { buscarUsuarioPorEmail } from "@/lib/usuarios";

export type ResultadoLogin = {
  ok: boolean;
  erro?: string;
};

const JANELA = 15 * 60 * 1000;
const LIMITE = 5;
const tentativas = new Map<string, { quantidade: number; inicio: number }>();
const HASH_INERTE = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5rBfQ6ss6Qk8f5a9MVMrwjyvMfRylvi";

function bloqueado(chave: string) {
  const agora = Date.now();
  const registro = tentativas.get(chave);
  if (!registro || agora - registro.inicio >= JANELA) {
    tentativas.delete(chave);
    return false;
  }
  return registro.quantidade >= LIMITE;
}

function registrarFalha(chaves: string[]) {
  const agora = Date.now();
  if (tentativas.size > 5_000) {
    for (const [chave, registro] of tentativas) {
      if (agora - registro.inicio >= JANELA) tentativas.delete(chave);
    }
    if (tentativas.size > 5_000) tentativas.clear();
  }
  for (const chave of chaves) {
    const atual = tentativas.get(chave);
    tentativas.set(chave, !atual || agora - atual.inicio >= JANELA
      ? { quantidade: 1, inicio: agora }
      : { ...atual, quantidade: atual.quantidade + 1 });
  }
}

export async function entrarPainel(
  _estado: ResultadoLogin,
  formulario: FormData
): Promise<ResultadoLogin> {
  const email = String(formulario.get("email") || "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
  const senha = String(formulario.get("senha") || "").slice(0, 1024);

  if (!email || !senha) {
    return { ok: false, erro: "Informe e-mail e senha." };
  }

  const cabecalhos = await headers();
  const ip = (cabecalhos.get("x-forwarded-for")?.split(",")[0] || cabecalhos.get("x-real-ip") || "desconhecido").trim().slice(0, 64);
  const chaves = [`email:${email}`, `ip:${ip}`];
  if (chaves.some(bloqueado)) {
    return { ok: false, erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
  }

  const usuario = await buscarUsuarioPorEmail(email);
  const senhaOk = await bcrypt.compare(senha, usuario?.senha ?? HASH_INERTE);
  if (!usuario || !senhaOk || (!usuario.administrador && !usuario.desenvolvedor)) {
    registrarFalha(chaves);
    return { ok: false, erro: "E-mail ou senha inválidos." };
  }

  for (const chave of chaves) tentativas.delete(chave);

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
