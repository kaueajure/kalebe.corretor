"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import estilos from "./galeriaImovel.module.css";

interface Props {
  fotos: string[];
  titulo: string;
}

export function GaleriaImovel({ fotos, titulo }: Props) {
  const [indice, setIndice] = useState(0);
  const [aberta, setAberta] = useState(false);
  const total = fotos.length;

  const irPara = useCallback(
    (proximo: number) => {
      if (!total) return;
      setIndice((proximo + total) % total);
    },
    [total]
  );

  useEffect(() => {
    if (!aberta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(false);
      if (e.key === "ArrowRight") irPara(indice + 1);
      if (e.key === "ArrowLeft") irPara(indice - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberta, indice, irPara]);

  if (!total) {
    return (
      <div className={estilos.vazia}>
        <p>Fotos em breve</p>
      </div>
    );
  }

  return (
    <div className={estilos.galeria}>
      <div className={estilos.principal}>
        <button
          type="button"
          className={estilos.abrir}
          onClick={() => setAberta(true)}
          aria-label="Ampliar foto"
        >
          <Image
            src={fotos[indice]}
            alt={`${titulo} — foto ${indice + 1} de ${total}`}
            fill
            sizes="(max-width: 900px) 100vw, 70vw"
            className={estilos.foto}
            priority
          />
        </button>

        {total > 1 ? (
          <>
            <button
              type="button"
              className={`${estilos.nav} ${estilos.prev}`}
              onClick={() => irPara(indice - 1)}
              aria-label="Foto anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${estilos.nav} ${estilos.next}`}
              onClick={() => irPara(indice + 1)}
              aria-label="Próxima foto"
            >
              ›
            </button>
            <span className={estilos.contador}>
              {indice + 1} / {total}
            </span>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className={estilos.miniaturas} role="list">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              type="button"
              role="listitem"
              className={`${estilos.miniatura} ${i === indice ? estilos.ativa : ""}`}
              onClick={() => setIndice(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === indice}
            >
              <Image
                src={foto}
                alt=""
                fill
                sizes="120px"
                className={estilos.foto}
              />
            </button>
          ))}
        </div>
      ) : null}

      {aberta ? (
        <div
          className={estilos.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria ampliada"
        >
          <button
            type="button"
            className={estilos.fechar}
            onClick={() => setAberta(false)}
            aria-label="Fechar"
          >
            ×
          </button>
          <div className={estilos.lightboxFoto}>
            <Image
              src={fotos[indice]}
              alt={`${titulo} — foto ${indice + 1}`}
              fill
              sizes="100vw"
              className={estilos.foto}
            />
          </div>
          {total > 1 ? (
            <>
              <button
                type="button"
                className={`${estilos.nav} ${estilos.prev}`}
                onClick={() => irPara(indice - 1)}
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${estilos.nav} ${estilos.next}`}
                onClick={() => irPara(indice + 1)}
                aria-label="Próxima foto"
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
