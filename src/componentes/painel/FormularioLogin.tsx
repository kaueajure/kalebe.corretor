"use client";

import { useActionState } from "react";
import { entrarPainel, type ResultadoLogin } from "@/app/painel/acoes";
import estilos from "./formularioLogin.module.css";

const estadoInicial: ResultadoLogin = { ok: false };

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(entrarPainel, estadoInicial);

  return (
    <form className={estilos.form} action={acao} noValidate>
      <div>
        <label htmlFor="painel-email" className="rotulo-campo">
          E-mail
        </label>
        <input
          id="painel-email"
          name="email"
          type="email"
          className="campo"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="painel-senha" className="rotulo-campo">
          Senha
        </label>
        <input
          id="painel-senha"
          name="senha"
          type="password"
          className="campo"
          autoComplete="current-password"
          required
        />
      </div>
      {estado.erro ? (
        <p className={estilos.erro} role="alert">
          {estado.erro}
        </p>
      ) : null}
      <button
        type="submit"
        className="botao botao-primario"
        disabled={pendente}
      >
        {pendente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
