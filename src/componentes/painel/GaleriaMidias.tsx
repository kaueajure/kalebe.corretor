"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import estilos from "./galeriaMidias.module.css";

export type MidiaSelecionada = {
  id: string;
  idBanco?: number;
  arquivo?: File;
  url: string;
  natureza: "imagem" | "video";
  classificacao: "IMAGEM" | "PLANTA";
  descricao: string;
  principal: boolean;
  largura?: number | null;
  altura?: number | null;
};

type Propriedades = {
  midias: MidiaSelecionada[];
  aoAlterar: (midias: MidiaSelecionada[]) => void;
  aoErro: (mensagem: string | null) => void;
};

const TIPOS_ACEITOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const LIMITE_IMAGEM = 15 * 1024 * 1024;
const LIMITE_VIDEO = 150 * 1024 * 1024;
const LIMITE_TOTAL = 300 * 1024 * 1024;

function criarId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function formatarTamanho(bytes: number) {
  return (
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
      bytes / 1024 / 1024,
    ) + " MB"
  );
}

export function GaleriaMidias({ midias, aoAlterar, aoErro }: Propriedades) {
  const entrada = useRef<HTMLInputElement>(null);
  const midiasAtuais = useRef(midias);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobreArea, setSobreArea] = useState(false);

  useEffect(() => {
    midiasAtuais.current = midias;
  }, [midias]);

  useEffect(
    () => () => {
      for (const midia of midiasAtuais.current) {
        if (midia.url.startsWith("blob:")) URL.revokeObjectURL(midia.url);
      }
    },
    [],
  );

  function incluir(arquivosRecebidos: FileList | File[]) {
    const arquivos = Array.from(arquivosRecebidos);
    if (!arquivos.length) return;
    if (midias.length + arquivos.length > 60) {
      aoErro("A galeria aceita no máximo 60 arquivos.");
      return;
    }

    for (const arquivo of arquivos) {
      const video = arquivo.type.startsWith("video/");
      if (!TIPOS_ACEITOS.includes(arquivo.type)) {
        aoErro(`O arquivo “${arquivo.name}” não possui um formato aceito.`);
        return;
      }
      if (arquivo.size > (video ? LIMITE_VIDEO : LIMITE_IMAGEM)) {
        aoErro(
          `${arquivo.name} ultrapassa o limite de ${video ? "150 MB" : "15 MB"}.`,
        );
        return;
      }
    }

    const total = [
      ...midias.map((midia) => midia.arquivo?.size ?? 0),
      ...arquivos.map((arquivo) => arquivo.size),
    ].reduce((soma, tamanho) => soma + tamanho, 0);
    if (total > LIMITE_TOTAL) {
      aoErro("O conjunto de arquivos ultrapassa o limite total de 300 MB.");
      return;
    }

    const jaTemCapa = midias.some((midia) => midia.principal);
    let capaDefinida = jaTemCapa;
    const novas = arquivos.map<MidiaSelecionada>((arquivo) => {
      const imagem = arquivo.type.startsWith("image/");
      const principal = imagem && !capaDefinida;
      if (principal) capaDefinida = true;
      return {
        id: criarId(),
        arquivo,
        url: URL.createObjectURL(arquivo),
        natureza: imagem ? "imagem" : "video",
        classificacao: "IMAGEM",
        descricao: "",
        principal,
      };
    });
    aoErro(null);
    aoAlterar([...midias, ...novas]);
    if (entrada.current) entrada.current.value = "";
  }

  function remover(id: string) {
    const removida = midias.find((midia) => midia.id === id);
    if (removida?.url.startsWith("blob:")) URL.revokeObjectURL(removida.url);
    const restantes = midias.filter((midia) => midia.id !== id);
    const novaCapa = removida?.principal
      ? restantes.find(
          (midia) =>
            midia.natureza === "imagem" && midia.classificacao === "IMAGEM",
        )?.id
      : null;
    aoAlterar(
      restantes.map((midia) =>
        novaCapa === midia.id ? { ...midia, principal: true } : midia,
      ),
    );
  }

  function atualizar(id: string, alteracao: Partial<MidiaSelecionada>) {
    aoAlterar(
      midias.map((midia) => {
        if (midia.id !== id) {
          return alteracao.principal ? { ...midia, principal: false } : midia;
        }
        const atualizada = { ...midia, ...alteracao };
        if (atualizada.classificacao === "PLANTA") atualizada.principal = false;
        return atualizada;
      }),
    );
  }

  function mover(indice: number, destino: number) {
    if (destino < 0 || destino >= midias.length || indice === destino) return;
    const ordenadas = [...midias];
    const [movida] = ordenadas.splice(indice, 1);
    ordenadas.splice(destino, 0, movida);
    aoAlterar(ordenadas);
  }

  function soltar(evento: DragEvent<HTMLElement>, idDestino: string) {
    evento.preventDefault();
    const origem = midias.findIndex((midia) => midia.id === arrastando);
    const destino = midias.findIndex((midia) => midia.id === idDestino);
    mover(origem, destino);
    setArrastando(null);
  }

  function aoEscolher(evento: ChangeEvent<HTMLInputElement>) {
    if (evento.currentTarget.files) incluir(evento.currentTarget.files);
  }

  return (
    <div className={estilos.galeria}>
      <div
        className={`${estilos.entrada}${sobreArea ? ` ${estilos.entradaAtiva}` : ""}`}
        onDragEnter={(evento) => {
          evento.preventDefault();
          setSobreArea(true);
        }}
        onDragOver={(evento) => evento.preventDefault()}
        onDragLeave={(evento) => {
          if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) {
            setSobreArea(false);
          }
        }}
        onDrop={(evento) => {
          evento.preventDefault();
          setSobreArea(false);
          incluir(evento.dataTransfer.files);
        }}
      >
        <div>
          <strong>Adicione fotos, vídeos ou plantas</strong>
          <p>Arraste os arquivos para cá ou escolha no computador.</p>
          <small>Fotos até 15 MB, vídeos até 150 MB; máximo total de 300 MB.</small>
        </div>
        <button
          className="botao botao-secundario"
          type="button"
          onClick={() => entrada.current?.click()}
        >
          Escolher arquivos
        </button>
        <input
          ref={entrada}
          className={estilos.inputArquivo}
          name="selecionarMidias"
          type="file"
          aria-label="Selecionar fotos, vídeos ou plantas"
          accept={TIPOS_ACEITOS.join(",")}
          multiple
          onChange={aoEscolher}
        />
      </div>

      {midias.length ? (
        <>
          <div className={estilos.resumo}>
            <strong>
              {midias.length} {midias.length === 1 ? "arquivo" : "arquivos"}
            </strong>
            <span>
              {formatarTamanho(
                midias.reduce((total, midia) => total + (midia.arquivo?.size ?? 0), 0),
              )}{" "}
              no total
            </span>
          </div>
          <ol className={estilos.lista} aria-label="Ordem da galeria">
            {midias.map((midia, indice) => (
              <li
                className={`${estilos.item}${arrastando === midia.id ? ` ${estilos.itemArrastando}` : ""}`}
                key={midia.id}
                draggable
                onDragStart={() => setArrastando(midia.id)}
                onDragEnd={() => setArrastando(null)}
                onDragOver={(evento) => evento.preventDefault()}
                onDrop={(evento) => soltar(evento, midia.id)}
              >
                <span className={estilos.ordem} aria-label={`Posição ${indice + 1}`}>
                  ⋮⋮
                </span>
                <div className={estilos.miniatura}>
                  {midia.natureza === "imagem" ? (
                    <Image
                      src={midia.url}
                      alt=""
                      fill
                      sizes="128px"
                      unoptimized
                    />
                  ) : (
                    <video
                      src={midia.url}
                      muted
                      preload="metadata"
                      aria-label={`Vídeo ${midia.arquivo?.name ?? "existente"}`}
                    />
                  )}
                  {midia.principal ? <span className={estilos.seloCapa}>Capa</span> : null}
                </div>
                <div className={estilos.edicao}>
                  <strong title={midia.arquivo?.name ?? "Arquivo existente"}>
                    {midia.arquivo?.name ?? "Arquivo existente"}
                  </strong>
                  <div className={estilos.campos}>
                    {midia.natureza === "imagem" ? (
                      <label>
                        <span>Tipo</span>
                        <select
                          className="selecao"
                          value={midia.classificacao}
                          onChange={(evento) =>
                            atualizar(midia.id, {
                              classificacao: evento.target.value as
                                | "IMAGEM"
                                | "PLANTA",
                            })
                          }
                        >
                          <option value="IMAGEM">Foto</option>
                          <option value="PLANTA">Planta</option>
                        </select>
                      </label>
                    ) : (
                      <span className={estilos.tipoVideo}>Vídeo</span>
                    )}
                    <label className={estilos.legenda}>
                      <span>Legenda opcional</span>
                      <input
                        className="campo"
                        type="text"
                        maxLength={300}
                        value={midia.descricao}
                        placeholder="Ex.: Sala integrada à varanda"
                        onChange={(evento) =>
                          atualizar(midia.id, { descricao: evento.target.value })
                        }
                      />
                    </label>
                  </div>
                  {midia.natureza === "imagem" && midia.classificacao === "IMAGEM" ? (
                    <label className={estilos.capa}>
                      <input
                        type="radio"
                        name="capaEscolhida"
                        checked={midia.principal}
                        onChange={() => atualizar(midia.id, { principal: true })}
                      />
                      Usar como capa do anúncio
                    </label>
                  ) : null}
                </div>
                <div className={estilos.acoes}>
                  <button
                    type="button"
                    onClick={() => mover(indice, indice - 1)}
                    disabled={indice === 0}
                    aria-label={`Mover ${midia.arquivo?.name ?? "arquivo"} para cima`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(indice, indice + 1)}
                    disabled={indice === midias.length - 1}
                    aria-label={`Mover ${midia.arquivo?.name ?? "arquivo"} para baixo`}
                  >
                    ↓
                  </button>
                  <button
                    className={estilos.remover}
                    type="button"
                    onClick={() => remover(midia.id)}
                    aria-label={`Remover ${midia.arquivo?.name ?? "arquivo"}`}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </div>
  );
}
