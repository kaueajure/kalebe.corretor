"use client";

import Link from "next/link";
import { useState } from "react";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import estilos from "./buscaPrincipal.module.css";

function rotuloPreco(valor: number, aluguel: boolean) {
  if (aluguel) {
    return `Até ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(valor)}`;
  }

  if (valor >= 1_000_000) {
    return "Até R$ 1 milhão";
  }

  return `Até R$ ${valor / 1000} mil`;
}

export function BuscaPrincipal() {
  const [finalidade, setFinalidade] = useState("venda");
  const precos =
    finalidade === "venda"
      ? [200000, 300000, 400000, 600000, 1000000]
      : [1000, 1500, 2000, 3000, 5000];

  return (
    <div className={estilos.busca}>
      <div className={estilos.intencoes} role="group" aria-label="O que você procura?">
        <button
          type="button"
          aria-pressed={finalidade === "venda"}
          onClick={() => setFinalidade("venda")}
        >
          Comprar
        </button>
        <button
          type="button"
          aria-pressed={finalidade === "aluguel"}
          onClick={() => setFinalidade("aluguel")}
        >
          Alugar
        </button>
        <Link href="/lancamentos">
          Lançamentos <Icone nome="seta" size={14} />
        </Link>
      </div>
      <form action="/imoveis" className={estilos.form} aria-label="Buscar imóveis">
        <input type="hidden" name="finalidade" value={finalidade} />
        <div className={estilos.campo}>
          <label htmlFor="busca-cidade">Onde você quer morar?</label>
          <select id="busca-cidade" name="cidade" className="selecao" defaultValue="">
            <option value="">Todas as cidades</option>
            {empresa.cidadesAtendimento.map((cidade) => (
              <option key={cidade}>{cidade}</option>
            ))}
          </select>
        </div>
        <div className={estilos.campo}>
          <label htmlFor="busca-tipo">Tipo de imóvel</label>
          <select id="busca-tipo" name="tipo" className="selecao" defaultValue="">
            <option value="">Todos os tipos</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="sobrado">Sobrado</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
          </select>
        </div>
        <div className={estilos.campo}>
          <label htmlFor="busca-preco">Até quanto?</label>
          <select
            id="busca-preco"
            name="precoMax"
            className="selecao"
            defaultValue=""
            key={finalidade}
          >
            <option value="">Qualquer valor</option>
            {precos.map((preco) => (
              <option key={preco} value={preco}>
                {rotuloPreco(preco, finalidade === "aluguel")}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={`botao botao-primario ${estilos.enviar}`}>
          <Icone nome="busca" size={18} /> Buscar
        </button>
      </form>
    </div>
  );
}
