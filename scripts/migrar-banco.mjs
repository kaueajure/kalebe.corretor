import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import mysql from "mysql2/promise";

function carregarEnv(caminho) {
  let texto;
  try {
    texto = readFileSync(caminho, "utf8");
  } catch {
    return;
  }

  for (const linha of texto.split("\n")) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith("#")) continue;

    const indice = limpa.indexOf("=");
    if (indice === -1) continue;

    const chave = limpa.slice(0, indice).trim();
    let valor = limpa.slice(indice + 1).trim();

    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    if (process.env[chave] === undefined) {
      process.env[chave] = valor;
    }
  }
}

carregarEnv(resolve(process.cwd(), ".env"));

function lerEnv(...chaves) {
  for (const chave of chaves) {
    const valor = process.env[chave]?.trim();
    if (valor) return valor;
  }
  return undefined;
}

const host = lerEnv("host", "HOST");
const user = lerEnv("usuario", "USUARIO");
const password = lerEnv("senha", "SENHA");
const database = lerEnv("banco", "BANCO");
const port = Number(lerEnv("porta", "PORTA") || "3306");

if (!host || !user || !password || !database) {
  console.error("Faltam variáveis no .env: host, usuario, senha e banco.");
  process.exit(1);
}

const pastaBanco = resolve(process.cwd(), "banco");

async function main() {
  const conexao = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
    multipleStatements: true,
  });

  try {
    await conexao.query(`
      CREATE TABLE IF NOT EXISTS migracoes (
        id VARCHAR(191) NOT NULL,
        aplicada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const arquivos = readdirSync(pastaBanco)
      .filter((nome) => nome.endsWith(".sql"))
      .sort();

    if (arquivos.length === 0) {
      console.log("Nenhum arquivo .sql em /banco.");
      return;
    }

    const [aplicadas] = await conexao.query(
      "SELECT id FROM migracoes"
    );
    const jaAplicadas = new Set(aplicadas.map((linha) => linha.id));

    let novas = 0;

    for (const arquivo of arquivos) {
      if (jaAplicadas.has(arquivo)) {
        console.log(`• já aplicada: ${arquivo}`);
        continue;
      }

      const sql = readFileSync(join(pastaBanco, arquivo), "utf8").trim();
      if (!sql) {
        console.log(`• vazia, ignorada: ${arquivo}`);
        continue;
      }

      console.log(`→ aplicando: ${arquivo}`);
      await conexao.query(sql);
      await conexao.query("INSERT INTO migracoes (id) VALUES (?)", [arquivo]);
      console.log(`✓ ok: ${arquivo}`);
      novas += 1;
    }

    if (novas === 0) {
      console.log("Banco já está atualizado.");
    } else {
      console.log(`Migrations aplicadas: ${novas}`);
    }
  } finally {
    await conexao.end();
  }
}

main().catch((erro) => {
  console.error("Falha ao migrar o banco:");
  console.error(erro.message || erro);
  process.exit(1);
});
