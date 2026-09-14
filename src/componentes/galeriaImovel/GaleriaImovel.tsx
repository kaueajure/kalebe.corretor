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
  const mosaico = total >= 3;

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

  function abrir(i: number) {
    setIndice(i);
    setAberta(true);
  }

  return (
    <div className={estilos.galeria}>
      <div className={mosaico ? estilos.mosaico : undefined}>
        <div className={estilos.principal}>
          <button
            type="button"
            className={estilos.abrir}
            onClick={() => abrir(indice)}
            aria-label="Ampliar foto"
          >
            <Image
              src={fotos[indice]}
              alt={`${titulo} — foto ${indice + 1} de ${total}`}
              fill
              sizes="(max-width: 900px) 100vw, 70vw"
              className={estilos.foto}
              priority
              unoptimized
            />
          </button>
          {total > 1 && !mosaico ? (
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
          <span className={estilos.contador}>
            {indice + 1} / {total}
          </span>
          {mosaico ? (
            <span className={estilos.verFotos}>Ver fotos</span>
          ) : null}
        </div>

        {mosaico ? (
          <>
            <button
              type="button"
              className={estilos.lado}
              onClick={() => abrir(1)}
              aria-label="Ver foto 2"
            >
              <Image src={fotos[1]} alt="" fill sizes="30vw" className={estilos.foto} unoptimized />
            </button>
            <button
              type="button"
              className={estilos.lado}
              onClick={() => abrir(2)}
              aria-label="Ver foto 3"
            >
              <Image src={fotos[2]} alt="" fill sizes="30vw" className={estilos.foto} unoptimized />
            </button>
          </>
        ) : null}
      </div>

      {total > 1 && !mosaico ? (
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
              <Image src={foto} alt="" fill sizes="120px" className={estilos.foto} unoptimized />
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
              unoptimized
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
