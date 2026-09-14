"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
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
    <div className={estilos.pagina}>
      <div className="conteudo">
        <header className={estilos.cabecalho}>
          <p className="rotulo-secao">Salvos</p>
          <h1 className="titulo-secao">Favoritos</h1>
          <div className="divisor" />
          <p className="texto-secao">
            Os imóveis salvos ficam neste aparelho. Você pode removê-los a
            qualquer momento.
          </p>
        </header>

        {!pronto || carregando ? (
          <div className="mensagem-estado">
            <p>Carregando favoritos...</p>
          </div>
        ) : salvos.length === 0 ? (
          <div className="mensagem-estado">
            <h2>Nenhum imóvel salvo</h2>
            <p>
              Ao navegar pelos imóveis, use o coração para guardar as opções que
              quiser comparar depois.
            </p>
            <Link href="/imoveis" className="botao botao-primario">
              Ver imóveis
            </Link>
          </div>
        ) : (
          <div className="grade-imoveis">
            {salvos.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
