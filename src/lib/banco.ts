import mysql, { type Pool } from "mysql2/promise";

function criarPool(): Pool {
  const host = process.env.host;
  const user = process.env.usuario;
  const password = process.env.senha;
  const database = process.env.banco;
  const port = Number(process.env.porta || "3306");

  if (!host || !user || !password || !database) {
    throw new Error("Configure no .env: host, usuario, senha e banco.");
  }

  return mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 5,
    namedPlaceholders: true,
  });
}

const globalParaBanco = globalThis as unknown as {
  poolMysql: Pool | undefined;
};

export const banco = globalParaBanco.poolMysql ?? criarPool();

if (process.env.NODE_ENV !== "production") {
  globalParaBanco.poolMysql = banco;
}
