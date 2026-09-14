"use client";

import { useEffect, useId, useRef, useState } from "react";
import estilos from "./dialogoExclusao.module.css";

type Propriedades = {
  titulo: string;
  nome: string;
  descricao: string;
  rotuloDoBotao: string;
  aoConfirmar: () => Promise<void>;
};

export function DialogoExclusao({
  titulo,
  nome,
  descricao,
  rotuloDoBotao,
  aoConfirmar,
}: Propriedades) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const referencia = useRef<HTMLDialogElement>(null);
  const idDoTitulo = useId();

  useEffect(() => {
    const dialogo = referencia.current;
    if (!aberto || !dialogo) return;
    dialogo.showModal();
    return () => {
      if (dialogo.open) dialogo.close();
    };
  }, [aberto]);

  async function confirmar() {
    setExcluindo(true);
    setErro(null);
    try {
      await aoConfirmar();
      setAberto(false);
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível concluir a exclusão.",
      );
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <>
      <button
        className={`botao botao-secundario ${estilos.botaoPerigo}`}
        type="button"
        onClick={() => {
          setErro(null);
          setAberto(true);
        }}
        aria-label={`${rotuloDoBotao} ${nome}`}
      >
        {rotuloDoBotao}
      </button>

      {aberto ? (
        <dialog
          ref={referencia}
          className={estilos.dialogo}
          aria-labelledby={idDoTitulo}
          onCancel={(evento) => {
            evento.preventDefault();
            if (!excluindo) setAberto(false);
          }}
        >
          <header className={estilos.cabecalho}>
            <div>
              <h2 id={idDoTitulo}>{titulo}</h2>
              <p>{descricao}</p>
            </div>
            <button
              className={estilos.fechar}
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar"
              disabled={excluindo}
            >
              ×
            </button>
          </header>
          <div className={estilos.corpo}>
            <span>Item selecionado</span>
            <strong>{nome}</strong>
          </div>
          {erro ? (
            <p className={estilos.erro} role="alert">
              {erro}
            </p>
          ) : null}
          <footer className={estilos.acoes}>
            <button
              className="botao botao-fantasma"
              type="button"
              onClick={() => setAberto(false)}
              disabled={excluindo}
            >
              Cancelar
            </button>
            <button
              className={`botao botao-primario ${estilos.botaoConfirmar}`}
              type="button"
              onClick={() => void confirmar()}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo…" : "Confirmar exclusão"}
            </button>
          </footer>
        </dialog>
      ) : null}
    </>
  );
}
