"use client";

import { useFavoritos } from "@/hooks/useFavoritos";
import estilos from "./favoritoBotao.module.css";

interface Props {
  id: string;
  titulo: string;
  variante?: "flutuante" | "texto";
}

export function FavoritoBotao({ id, titulo, variante = "flutuante" }: Props) {
  const { estaFavorito, alternarFavorito, pronto } = useFavoritos();
  const ativo = estaFavorito(id);

  return (
    <button
      type="button"
      className={`${estilos.botao} ${estilos[variante]} ${ativo ? estilos.ativo : ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alternarFavorito(id);
      }}
      aria-pressed={ativo}
      aria-label={
        ativo
          ? `Remover ${titulo} dos favoritos`
          : `Salvar ${titulo} nos favoritos`
      }
      disabled={!pronto}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={ativo ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
      </svg>
      {variante === "texto" ? (
        <span>{ativo ? "Salvo" : "Salvar"}</span>
      ) : null}
    </button>
  );
}
