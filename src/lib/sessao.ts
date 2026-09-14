import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const NOME_COOKIE = "sessao_painel";
const DURACAO = "7d";

export type SessaoPainel = {
  id: string;
  nome: string;
  email: string;
  administrador: boolean;
  desenvolvedor: boolean;
};

function chaveSecreta() {
  const secreta =
    process.env.sessao_secreta?.trim() || process.env.SESSAO_SECRETA?.trim();
  if (!secreta) {
    throw new Error("Configure sessao_secreta no .env.");
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
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(DURACAO)
    .sign(chaveSecreta());

  const jar = await cookies();
  jar.set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
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
    };
  } catch {
    return null;
  }
}

export async function limparSessao() {
  const jar = await cookies();
  jar.delete(NOME_COOKIE);
}
