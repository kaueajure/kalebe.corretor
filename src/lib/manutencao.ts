import "server-only";
import type { RowDataPacket } from "mysql2";
import { banco } from "@/lib/banco";

export type ConfiguracaoManutencao = {
  ativa: boolean;
  rotulo: string;
  titulo: string;
  mensagemPrincipal: string;
  mensagemComplementar: string;
};

type LinhaManutencao = RowDataPacket & {
  ativa: number | boolean;
  rotulo: string;
  titulo: string;
  mensagem_principal: string;
  mensagem_complementar: string | null;
};

export const CONFIGURACAO_PADRAO: ConfiguracaoManutencao = {
  ativa: false,
  rotulo: "Aviso",
  titulo: "Site em manutenção",
  mensagemPrincipal: "Estamos fazendo ajustes para melhorar sua experiência. Volte em breve.",
  mensagemComplementar: "",
};

export async function manutencaoAtiva(): Promise<boolean> {
  const [linhas] = await banco.execute<LinhaManutencao[]>(
    "SELECT ativa FROM configuracao_manutencao WHERE id = 1 LIMIT 1",
  );
  return Boolean(linhas[0]?.ativa);
}

export async function obterConfiguracaoManutencao(): Promise<ConfiguracaoManutencao> {
  const [linhas] = await banco.execute<LinhaManutencao[]>(
    "SELECT ativa, rotulo, titulo, mensagem_principal, mensagem_complementar FROM configuracao_manutencao WHERE id = 1 LIMIT 1",
  );
  const linha = linhas[0];
  if (!linha) return CONFIGURACAO_PADRAO;
  return {
    ativa: Boolean(linha.ativa),
    rotulo: linha.rotulo,
    titulo: linha.titulo,
    mensagemPrincipal: linha.mensagem_principal,
    mensagemComplementar: linha.mensagem_complementar ?? "",
  };
}

export async function salvarConfiguracaoManutencao(configuracao: ConfiguracaoManutencao): Promise<void> {
  await banco.execute(
    `UPDATE configuracao_manutencao
     SET ativa = :ativa,
         rotulo = :rotulo,
         titulo = :titulo,
         mensagem_principal = :mensagemPrincipal,
         mensagem_complementar = :mensagemComplementar
     WHERE id = 1`,
    {
      ativa: Number(configuracao.ativa),
      rotulo: configuracao.rotulo,
      titulo: configuracao.titulo,
      mensagemPrincipal: configuracao.mensagemPrincipal,
      mensagemComplementar: configuracao.mensagemComplementar || null,
    },
  );
}
