import "server-only";
import mysql, { type Pool } from "mysql2/promise";

function lerEnv(...chaves: string[]) {
  for (const chave of chaves) {
    const valor = process.env[chave]?.trim();
    if (valor) return valor;
  }
  return undefined;
}

function criarPool(): Pool {
  const host = lerEnv("host", "HOST");
  const user = lerEnv("usuario", "USUARIO");
  const password = lerEnv("senha", "SENHA");
  const database = lerEnv("banco", "BANCO");
  const port = Number(lerEnv("porta", "PORTA") || "3306");

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

function obterPool(): Pool {
  if (!globalParaBanco.poolMysql) {
    globalParaBanco.poolMysql = criarPool();
  }
  return globalParaBanco.poolMysql;
}

/** Acesso lazy: só cria o pool na primeira query (não quebra o build no import). */
export const banco: Pool = new Proxy({} as Pool, {
  get(_alvo, propriedade, receptor) {
    const pool = obterPool();
    const valor = Reflect.get(pool, propriedade, receptor);
    return typeof valor === "function" ? valor.bind(pool) : valor;
  },
});
