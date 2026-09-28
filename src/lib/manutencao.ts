import "server-only";
import type { RowDataPacket } from "mysql2";
import { banco } from "@/lib/banco";

type LinhaManutencao = RowDataPacket & { ativa: number | boolean };

export async function manutencaoAtiva(): Promise<boolean> {
  const [linhas] = await banco.execute<LinhaManutencao[]>(
    "SELECT ativa FROM configuracao_manutencao WHERE id = 1 LIMIT 1",
  );
  return Boolean(linhas[0]?.ativa);
}

export async function definirManutencao(ativa: boolean): Promise<void> {
  await banco.execute(
    "UPDATE configuracao_manutencao SET ativa = :ativa WHERE id = 1",
    { ativa: Number(ativa) },
  );
}
