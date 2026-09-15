"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  criarUsuario,
  type EstadoDaCriacaoDeUsuario,
} from "@/app/painel/usuarios/acoes";
import estilos from "@/app/painel/usuarios/usuarios.module.css";

const inicial: EstadoDaCriacaoDeUsuario = { sucesso: false };

export function FormularioNovoUsuario() {
  const [estado, acao, pendente] = useActionState(criarUsuario, inicial);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.sucesso) formulario.current?.reset();
    if (estado.campo) {
      const campo = formulario.current?.elements.namedItem(estado.campo);
      if (campo instanceof HTMLElement) campo.focus();
    }
  }, [estado]);

  return (
    <form ref={formulario} action={acao} className={estilos.formulario}>
      <div className={estilos.gradeFormulario}>
        <label>
          <span>Nome</span>
          <input className="campo" name="nome" type="text" maxLength={191} autoComplete="off" required />
        </label>
        <label>
          <span>E-mail</span>
          <input className="campo" name="email" type="email" maxLength={191} autoComplete="off" required />
        </label>
        <label>
          <span>Senha inicial</span>
          <input className="campo" name="senhaInicial" type="password" maxLength={72} autoComplete="new-password" required />
        </label>
      </div>
      {estado.mensagem ? (
        <p className={estado.sucesso ? estilos.sucesso : estilos.erro} role={estado.sucesso ? "status" : "alert"}>
          {estado.mensagem}
        </p>
      ) : null}
      <button className="botao botao-primario" type="submit" disabled={pendente}>
        {pendente ? "Criando…" : "Criar usuário"}
      </button>
    </form>
  );
}
