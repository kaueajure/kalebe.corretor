"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { Icone } from "@/componentes/ui/Icone";
import { useFavoritos } from "@/hooks/useFavoritos";
import type { Imovel } from "@/tipos/imovel";
import estilos from "./favoritos.module.css";

export default function PaginaFavoritos() {
  const { ids, pronto } = useFavoritos();
  const [salvos, setSalvos] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!pronto) return;
    if (ids.length === 0) {
      setSalvos([]);
      return;
    }

    let ativo = true;
    setCarregando(true);

    fetch(`/api/favoritos?ids=${ids.map(encodeURIComponent).join(",")}`)
      .then(async (resposta) => {
        if (!resposta.ok) return [];
        return (await resposta.json()) as Imovel[];
      })
      .then((lista) => {
        if (ativo) setSalvos(lista);
      })
      .catch(() => {
        if (ativo) setSalvos([]);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [ids, pronto]);

  return (
    <>
      <div className="pagina-interna">
        <div className="conteudo corpo-pagina">
          <header className="intro-pagina">
            <p className="rotulo-secao">Salvos neste aparelho</p>
            <h1 className="titulo-secao">Favoritos</h1>
            <p className="texto-secao">
              Os imóveis que você guardou para comparar depois. Abra de novo
              quando quiser chamar o Kalebe.
            </p>
          </header>

          {!pronto || carregando ? (
            <div className="mensagem-estado">
              <p>Carregando favoritos…</p>
            </div>
          ) : salvos.length === 0 ? (
            <div className={`mensagem-estado ${estilos.vazio}`}>
              <h2>Nenhum imóvel salvo ainda</h2>
              <p>
                No anúncio, toque no coração para guardar as opções que quiser
                comparar depois.
              </p>
              <Link href="/imoveis" className="botao botao-primario">
                Ver imóveis
              </Link>
            </div>
          ) : (
            <>
              <p className={estilos.total}>
                <strong>{salvos.length}</strong>{" "}
                {salvos.length === 1 ? "imóvel salvo" : "imóveis salvos"}
              </p>
              <div className="grade-imoveis">
                {salvos.map((imovel) => (
                  <CardImovel key={imovel.id} imovel={imovel} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {pronto && salvos.length > 0 ? (
        <section className="faixa-cta">
          <div className="conteudo faixa-cta-interior">
            <div>
              <h2>Quer visitar algum desses?</h2>
              <p>
                Me diga quais favoritos te interessam e combinamos a visita.
              </p>
            </div>
            <Link href="/contato" className="botao botao-secundario">
              Falar com o Kalebe <Icone nome="seta" size={18} />
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
