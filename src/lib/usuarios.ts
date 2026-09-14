import type { RowDataPacket } from "mysql2";
import { banco } from "@/lib/banco";

export type Usuario = {
  id: string;
  email: string;
  senha: string;
  nome: string;
  desenvolvedor: boolean;
  administrador: boolean;
};

type UsuarioLinha = RowDataPacket & {
  id: string;
  email: string;
  senha: string;
  nome: string;
  desenvolvedor: number | boolean;
  administrador: number | boolean;
};

function mapearUsuario(linha: UsuarioLinha): Usuario {
  return {
    id: linha.id,
    email: linha.email,
    senha: linha.senha,
    nome: linha.nome,
    desenvolvedor: Boolean(linha.desenvolvedor),
    administrador: Boolean(linha.administrador),
  };
}

export async function buscarUsuarioPorEmail(
  email: string
): Promise<Usuario | null> {
  const [linhas] = await banco.execute<UsuarioLinha[]>(
    `SELECT id, email, senha, nome, desenvolvedor, administrador
     FROM usuarios
     WHERE email = :email
     LIMIT 1`,
    { email }
  );

  const linha = linhas[0];
  return linha ? mapearUsuario(linha) : null;
}
