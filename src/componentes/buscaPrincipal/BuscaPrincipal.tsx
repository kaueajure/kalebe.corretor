"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { FiltroImoveisEstado } from "@/tipos/imovel";
import { filtroParaQuery } from "@/lib/formatadores";
import estilos from "./buscaPrincipal.module.css";

export function BuscaPrincipal() {
  const router = useRouter();
  const [finalidade, setFinalidade] =
    useState<FiltroImoveisEstado["finalidade"]>("");
  const [tipo, setTipo] = useState<FiltroImoveisEstado["tipo"]>("");
  const [cidade, setCidade] = useState("");
  const [quartos, setQuartos] = useState("");

  function enviar(e: FormEvent) {
    e.preventDefault();
    const query = filtroParaQuery({ finalidade, tipo, cidade, quartos });
    router.push(`/imoveis${query}`);
  }

  return (
    <form className={estilos.busca} onSubmit={enviar} aria-label="Buscar imóveis">
      <div className={estilos.campo}>
        <label htmlFor="busca-finalidade" className="rotulo-campo">
          Finalidade
        </label>
        <select
          id="busca-finalidade"
          className="selecao"
          value={finalidade}
          onChange={(e) =>
            setFinalidade(e.target.value as FiltroImoveisEstado["finalidade"])
          }
        >
          <option value="">Comprar ou alugar</option>
          <option value="venda">Comprar</option>
          <option value="aluguel">Alugar</option>
        </select>
      </div>

      <div className={estilos.campo}>
        <label htmlFor="busca-tipo" className="rotulo-campo">
          Tipo
        </label>
        <select
          id="busca-tipo"
          className="selecao"
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value as FiltroImoveisEstado["tipo"])
          }
        >
          <option value="">Todos os tipos</option>
          <option value="casa">Casa</option>
          <option value="apartamento">Apartamento</option>
          <option value="sobrado">Sobrado</option>
          <option value="terreno">Terreno</option>
          <option value="comercial">Comercial</option>
        </select>
      </div>

      <div className={estilos.campo}>
        <label htmlFor="busca-cidade" className="rotulo-campo">
          Cidade
        </label>
        <select
          id="busca-cidade"
          className="selecao"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        >
          <option value="">Todas as cidades</option>
          <option value="São José do Rio Preto">São José do Rio Preto</option>
          <option value="Mirassol">Mirassol</option>
          <option value="Bady Bassitt">Bady Bassitt</option>
        </select>
      </div>

      <div className={estilos.campo}>
        <label htmlFor="busca-quartos" className="rotulo-campo">
          Quartos
        </label>
        <select
          id="busca-quartos"
          className="selecao"
          value={quartos}
          onChange={(e) => setQuartos(e.target.value)}
        >
          <option value="">Qualquer</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <button type="submit" className={`botao botao-primario ${estilos.enviar}`}>
        Buscar imóveis
      </button>
    </form>
  );
}
