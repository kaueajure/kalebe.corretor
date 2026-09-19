"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MidiaPublica } from "@/tipos/imovel";
import estilos from "./galeriaImovel.module.css";

interface Props {
  midias: MidiaPublica[];
  titulo: string;
}

function descricaoDaMidia(midia: MidiaPublica, titulo: string, indice: number) {
  return midia.descricao || `${titulo} — ${midia.tipo === "planta" ? "planta" : "foto"} ${indice + 1}`;
}

function ImagemDaMidia({ midia, titulo, indice, total, miniatura = false }: {
  midia: MidiaPublica; titulo: string; indice: number; total: number; miniatura?: boolean;
}) {
  if (midia.tipo === "video") {
    return (
      <video
        className={estilos.foto}
        src={midia.url}
        controls={!miniatura}
        muted={miniatura}
        preload="metadata"
        playsInline
        aria-label={midia.descricao || `${titulo} — vídeo ${indice + 1} de ${total}`}
      />
    );
  }
  return (
    <Image
      src={midia.url}
      alt={descricaoDaMidia(midia, titulo, indice)}
      fill
      sizes={miniatura ? "120px" : "(max-width: 900px) 100vw, 70vw"}
      className={estilos.foto}
      priority={indice === 0 && !miniatura}
    />
  );
}

export function GaleriaImovel({ midias, titulo }: Props) {
  const [indice, setIndice] = useState(0);
  const [aberta, setAberta] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const total = midias.length;
  const mosaico = total >= 3;
  const atual = midias[indice];

  const irPara = useCallback((proximo: number) => {
    if (total) setIndice((proximo + total) % total);
  }, [total]);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (aberta && !elemento.open) elemento.showModal();
    if (!aberta && elemento.open) elemento.close();
  }, [aberta]);

  useEffect(() => {
    if (!aberta) return;
    const aoPressionar = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowRight") irPara(indice + 1);
      if (evento.key === "ArrowLeft") irPara(indice - 1);
    };
    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [aberta, indice, irPara]);

  if (!atual) {
    return <div className={estilos.vazia}><p>Mídias em breve</p></div>;
  }

  function abrir(proximoIndice: number) {
    setIndice(proximoIndice);
    setAberta(true);
  }

  return (
    <div className={estilos.galeria}>
      <div className={mosaico ? estilos.mosaico : undefined}>
        <div className={estilos.principal}>
          {atual.tipo === "video" ? (
            <ImagemDaMidia midia={atual} titulo={titulo} indice={indice} total={total} />
          ) : (
            <button type="button" className={estilos.abrir} onClick={() => abrir(indice)} aria-label="Ampliar mídia">
              <ImagemDaMidia midia={atual} titulo={titulo} indice={indice} total={total} />
            </button>
          )}
          {total > 1 && !mosaico ? (
            <>
              <button type="button" className={`${estilos.nav} ${estilos.prev}`} onClick={() => irPara(indice - 1)} aria-label="Mídia anterior">‹</button>
              <button type="button" className={`${estilos.nav} ${estilos.next}`} onClick={() => irPara(indice + 1)} aria-label="Próxima mídia">›</button>
            </>
          ) : null}
          <span className={estilos.contador}>{indice + 1} / {total}</span>
          {mosaico ? <span className={estilos.verFotos}>Ver galeria</span> : null}
        </div>

        {mosaico ? midias.slice(1, 3).map((midia, deslocamento) => {
          const posicao = deslocamento + 1;
          return (
            <button type="button" className={estilos.lado} onClick={() => abrir(posicao)} aria-label={`Ver mídia ${posicao + 1}`} key={`${midia.url}-${posicao}`}>
              <ImagemDaMidia midia={midia} titulo={titulo} indice={posicao} total={total} miniatura />
            </button>
          );
        }) : null}
      </div>

      {total > 1 ? (
        <div className={estilos.miniaturas} role="list">
          {midias.map((midia, posicao) => (
            <button
              key={`${midia.url}-${posicao}`}
              type="button"
              role="listitem"
              className={`${estilos.miniatura} ${posicao === indice ? estilos.ativa : ""}`}
              onClick={() => setIndice(posicao)}
              aria-label={`Ver ${midia.tipo === "video" ? "vídeo" : midia.tipo} ${posicao + 1}`}
              aria-current={posicao === indice}
            >
              <ImagemDaMidia midia={midia} titulo={titulo} indice={posicao} total={total} miniatura />
              {midia.tipo !== "imagem" ? <span className={estilos.tipo}>{midia.tipo === "video" ? "Vídeo" : "Planta"}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <dialog
        ref={dialogo}
        className={estilos.lightbox}
        aria-label="Galeria ampliada"
        onClose={() => setAberta(false)}
        onCancel={() => setAberta(false)}
      >
        <button type="button" className={estilos.fechar} onClick={() => setAberta(false)} aria-label="Fechar">×</button>
        <div className={estilos.lightboxFoto}>
          {atual.tipo === "video" ? (
            <ImagemDaMidia midia={atual} titulo={titulo} indice={indice} total={total} />
          ) : (
            <Image src={atual.url} alt={descricaoDaMidia(atual, titulo, indice)} fill sizes="100vw" className={estilos.fotoAmpliada} />
          )}
        </div>
        {total > 1 ? (
          <>
            <button type="button" className={`${estilos.nav} ${estilos.prev}`} onClick={() => irPara(indice - 1)} aria-label="Mídia anterior">‹</button>
            <button type="button" className={`${estilos.nav} ${estilos.next}`} onClick={() => irPara(indice + 1)} aria-label="Próxima mídia">›</button>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
