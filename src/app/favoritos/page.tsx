"use client";

import Link from "next/link";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { useFavoritos } from "@/hooks/useFavoritos";
import { imoveis } from "@/dados/imoveis";
import estilos from "./favoritos.module.css";

export default function PaginaFavoritos() {
  const { ids, pronto } = useFavoritos();
  const salvos = imoveis.filter((imovel) => ids.includes(imovel.id));

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

        {!pronto ? (
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
