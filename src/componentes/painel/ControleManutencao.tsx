"use client";

import { useActionState } from "react";
import { alterarManutencao, type EstadoManutencao } from "@/app/painel/manutencao/acoes";
import estilos from "@/app/painel/manutencao/manutencao.module.css";

export function ControleManutencao({ ativaInicial }: { ativaInicial: boolean }) {
  const inicial: EstadoManutencao = { ativa: ativaInicial };
  const [estado, acao, pendente] = useActionState(alterarManutencao, inicial);

  return (
    <section className={estilos.cartao} aria-labelledby="estado-manutencao">
      <div className={estilos.linhaEstado}>
        <div>
          <h2 id="estado-manutencao">Estado do site</h2>
          <p className={estilos.descricao}>
            {estado.ativa
              ? "Visitantes e administradores veem o aviso de manutenção. Desenvolvedores autenticados continuam com acesso."
              : "O site e o painel estão disponíveis normalmente."}
          </p>
        </div>
        <strong className={`${estilos.estado} ${estado.ativa ? estilos.ativo : estilos.inativo}`}>
          {estado.ativa ? "Ativa" : "Desativada"}
        </strong>
      </div>

      <p className={estilos.explicacao}>
        Durante a manutenção, o desenvolvedor pode abrir <code>/login</code> manualmente
        e entrar com sua conta. Contas de administrador não conseguem entrar.
      </p>

      <form action={acao}>
        <input type="hidden" name="ativa" value={estado.ativa ? "0" : "1"} />
        <button type="submit" className={estilos.botao} disabled={pendente}>
          {pendente
            ? "Salvando..."
            : estado.ativa ? "Desativar manutenção" : "Ativar manutenção"}
        </button>
      </form>
      {estado.mensagem ? <p className={estilos.sucesso} role="status">{estado.mensagem}</p> : null}
      {estado.erro ? <p className={estilos.erro} role="alert">{estado.erro}</p> : null}
    </section>
  );
}
