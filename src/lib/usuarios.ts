import "server-only";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { banco } from "@/lib/banco";

export type Usuario = {
  id: string;
  email: string;
  senha: string;
  alterarSenha: boolean;
  nome: string;
  desenvolvedor: boolean;
  administrador: boolean;
};

type UsuarioLinha = RowDataPacket & {
  id: string;
  email: string;
  senha: string;
  alterar_senha: number | boolean;
  nome: string;
  desenvolvedor: number | boolean;
  administrador: number | boolean;
};

function mapearUsuario(linha: UsuarioLinha): Usuario {
  return {
    id: linha.id,
    email: linha.email,
    senha: linha.senha,
    alterarSenha: Boolean(linha.alterar_senha),
    nome: linha.nome,
    desenvolvedor: Boolean(linha.desenvolvedor),
    administrador: Boolean(linha.administrador),
  };
}

export async function buscarUsuarioPorEmail(
  email: string
): Promise<Usuario | null> {
  const [linhas] = await banco.execute<UsuarioLinha[]>(
    `SELECT id, email, senha, alterar_senha, nome, desenvolvedor, administrador
     FROM usuarios
     WHERE email = :email
     LIMIT 1`,
    { email }
  );

  const linha = linhas[0];
  return linha ? mapearUsuario(linha) : null;
}

export async function buscarUsuarioPorId(id: string): Promise<Usuario | null> {
  const [linhas] = await banco.execute<UsuarioLinha[]>(
    `SELECT id, email, senha, alterar_senha, nome, desenvolvedor, administrador
       FROM usuarios WHERE id = :id LIMIT 1`,
    { id },
  );
  return linhas[0] ? mapearUsuario(linhas[0]) : null;
}

export type UsuarioDaLista = Omit<Usuario, "senha"> & { criadoEm: Date };

export async function listarUsuarios(): Promise<UsuarioDaLista[]> {
  const [linhas] = await banco.query<
    (UsuarioLinha & { criado_em: Date })[]
  >(`SELECT id, email, senha, alterar_senha, nome, desenvolvedor,
            administrador, criado_em
       FROM usuarios ORDER BY nome, email`);
  return linhas.map((linha) => {
    const { senha: _senha, ...usuario } = mapearUsuario(linha);
    void _senha;
    return { ...usuario, criadoEm: linha.criado_em };
  });
}

export async function criarUsuarioAdministrador(dados: {
  nome: string;
  email: string;
  senha: string;
}) {
  const id = randomUUID();
  await banco.execute(
    `INSERT INTO usuarios
       (id, email, senha, alterar_senha, nome, desenvolvedor, administrador)
     VALUES (:id, :email, :senha, 1, :nome, 0, 1)`,
    { id, ...dados },
  );
  return id;
}

export async function concluirPrimeiroAcesso(id: string, senha: string) {
  const [resultado] = await banco.execute<import("mysql2/promise").ResultSetHeader>(
    `UPDATE usuarios SET senha = :senha, alterar_senha = 0
      WHERE id = :id AND alterar_senha = 1`,
    { id, senha },
  );
  return resultado.affectedRows === 1;
}
