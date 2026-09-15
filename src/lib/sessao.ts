import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const NOME_COOKIE = "sessao_painel";
const DURACAO = "8h";
const DURACAO_EM_SEGUNDOS = 60 * 60 * 8;

export type SessaoPainel = {
  id: string;
  nome: string;
  email: string;
  administrador: boolean;
  desenvolvedor: boolean;
  alterarSenha: boolean;
};

function chaveSecreta() {
  const secreta =
    process.env.sessao_secreta?.trim() || process.env.SESSAO_SECRETA?.trim();
  if (!secreta) {
    throw new Error("Configure sessao_secreta no .env.");
  }
  if (secreta.length < 32) {
    throw new Error("sessao_secreta precisa ter pelo menos 32 caracteres.");
  }
  return new TextEncoder().encode(secreta);
}

export async function criarSessao(dados: SessaoPainel) {
  const token = await new SignJWT({
    id: dados.id,
    nome: dados.nome,
    email: dados.email,
    administrador: dados.administrador,
    desenvolvedor: dados.desenvolvedor,
    alterarSenha: dados.alterarSenha,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(DURACAO)
    .sign(chaveSecreta());

  const jar = await cookies();
  jar.set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SEGURO !== "NAO",
    path: "/",
    maxAge: DURACAO_EM_SEGUNDOS,
  });
}

export async function lerSessao(): Promise<SessaoPainel | null> {
  const jar = await cookies();
  const token = jar.get(NOME_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, chaveSecreta());
    if (
      typeof payload.id !== "string" ||
      typeof payload.nome !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      administrador: Boolean(payload.administrador),
      desenvolvedor: Boolean(payload.desenvolvedor),
      alterarSenha: Boolean(payload.alterarSenha),
    };
  } catch {
    return null;
  }
}

export async function limparSessao() {
  const jar = await cookies();
  jar.delete(NOME_COOKIE);
}
