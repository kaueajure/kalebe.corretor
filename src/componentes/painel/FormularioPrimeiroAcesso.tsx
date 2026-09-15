"use client";

import { useActionState } from "react";
import { trocarSenhaInicial, type EstadoDaTrocaDeSenha } from "@/app/primeiro-acesso/acoes";
import estilos from "@/app/primeiro-acesso/primeiroAcesso.module.css";

const inicial: EstadoDaTrocaDeSenha = {};

export function FormularioPrimeiroAcesso() {
  const [estado, acao, pendente] = useActionState(trocarSenhaInicial, inicial);
  return (
    <form action={acao} className={estilos.formulario}>
      <label>
        <span>Confirmar senha inicial</span>
        <input className="campo" name="senhaInicial" type="password" maxLength={72} autoComplete="current-password" required autoFocus />
      </label>
      <label>
        <span>Nova senha</span>
        <input className="campo" name="senhaNova" type="password" maxLength={72} autoComplete="new-password" required />
      </label>
      <label>
        <span>Confirmar nova senha</span>
        <input className="campo" name="confirmarSenhaNova" type="password" maxLength={72} autoComplete="new-password" required />
      </label>
      {estado.erro ? <p className={estilos.erro} role="alert">{estado.erro}</p> : null}
      <button className="botao botao-primario" type="submit" disabled={pendente}>
        {pendente ? "Alterando…" : "Definir nova senha"}
      </button>
    </form>
  );
}
