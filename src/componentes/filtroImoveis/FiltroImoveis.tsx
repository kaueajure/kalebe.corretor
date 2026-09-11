"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { FiltroImoveisEstado } from "@/tipos/imovel";
import { filtroInicial, filtroParaQuery } from "@/lib/formatadores";
import estilos from "./filtroImoveis.module.css";

interface Props {
  cidades: string[];
  bairros: string[];
  total: number;
}

function lerFiltro(params: URLSearchParams): FiltroImoveisEstado {
  return {
    finalidade: (params.get("finalidade") as FiltroImoveisEstado["finalidade"]) || "",
    tipo: (params.get("tipo") as FiltroImoveisEstado["tipo"]) || "",
    cidade: params.get("cidade") || "",
    bairro: params.get("bairro") || "",
    precoMin: params.get("precoMin") || "",
    precoMax: params.get("precoMax") || "",
    quartos: params.get("quartos") || "",
    banheiros: params.get("banheiros") || "",
    vagas: params.get("vagas") || "",
    areaMin: params.get("areaMin") || "",
    busca: params.get("busca") || "",
  };
}

export function FiltroImoveis({ cidades, bairros, total }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inicial = useMemo(() => lerFiltro(searchParams), [searchParams]);
  const [filtro, setFiltro] = useState<FiltroImoveisEstado>(inicial);
  const [aberto, setAberto] = useState(false);

  function atualizar<K extends keyof FiltroImoveisEstado>(
    chave: K,
    valor: FiltroImoveisEstado[K]
  ) {
    setFiltro((atual) => ({ ...atual, [chave]: valor }));
  }

  function aplicar(e?: FormEvent) {
    e?.preventDefault();
    router.push(`/imoveis${filtroParaQuery(filtro)}`);
    setAberto(false);
  }

  function limpar() {
    setFiltro(filtroInicial);
    router.push("/imoveis");
    setAberto(false);
  }

  const bairrosFiltrados = filtro.cidade
    ? bairros
    : bairros;

  return (
    <div className={estilos.envolve}>
      <div className={estilos.topoMobile}>
        <p className={estilos.total}>
          <strong>{total}</strong>{" "}
          {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>
        <button
          type="button"
          className="botao botao-secundario"
          onClick={() => setAberto(true)}
        >
          Filtros
        </button>
      </div>

      <form
        className={`${estilos.painel} ${aberto ? estilos.aberto : ""}`}
        onSubmit={aplicar}
        aria-label="Filtrar imóveis"
      >
        <div className={estilos.cabecalhoMobile}>
          <h2>Filtros</h2>
          <button type="button" onClick={() => setAberto(false)} aria-label="Fechar filtros">
            ×
          </button>
        </div>

        <div className={estilos.grade}>
          <div>
            <label htmlFor="filtro-busca" className="rotulo-campo">
              Busca
            </label>
            <input
              id="filtro-busca"
              className="campo"
              value={filtro.busca}
              onChange={(e) => atualizar("busca", e.target.value)}
              placeholder="Código, bairro ou palavra-chave"
            />
          </div>

          <div>
            <label htmlFor="filtro-finalidade" className="rotulo-campo">
              Finalidade
            </label>
            <select
              id="filtro-finalidade"
              className="selecao"
              value={filtro.finalidade}
              onChange={(e) =>
                atualizar("finalidade", e.target.value as FiltroImoveisEstado["finalidade"])
              }
            >
              <option value="">Todas</option>
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>
          </div>

          <div>
            <label htmlFor="filtro-tipo" className="rotulo-campo">
              Tipo
            </label>
            <select
              id="filtro-tipo"
              className="selecao"
              value={filtro.tipo}
              onChange={(e) =>
                atualizar("tipo", e.target.value as FiltroImoveisEstado["tipo"])
              }
            >
              <option value="">Todos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="sobrado">Sobrado</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          <div>
            <label htmlFor="filtro-cidade" className="rotulo-campo">
              Cidade
            </label>
            <select
              id="filtro-cidade"
              className="selecao"
              value={filtro.cidade}
              onChange={(e) => {
                atualizar("cidade", e.target.value);
                atualizar("bairro", "");
              }}
            >
              <option value="">Todas</option>
              {cidades.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-bairro" className="rotulo-campo">
              Bairro
            </label>
            <select
              id="filtro-bairro"
              className="selecao"
              value={filtro.bairro}
              onChange={(e) => atualizar("bairro", e.target.value)}
            >
              <option value="">Todos</option>
              {bairrosFiltrados.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-preco-min" className="rotulo-campo">
              Preço mín.
            </label>
            <input
              id="filtro-preco-min"
              className="campo"
              type="number"
              min={0}
              value={filtro.precoMin}
              onChange={(e) => atualizar("precoMin", e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="filtro-preco-max" className="rotulo-campo">
              Preço máx.
            </label>
            <input
              id="filtro-preco-max"
              className="campo"
              type="number"
              min={0}
              value={filtro.precoMax}
              onChange={(e) => atualizar("precoMax", e.target.value)}
              placeholder="500000"
            />
          </div>

          <div>
            <label htmlFor="filtro-quartos" className="rotulo-campo">
              Quartos
            </label>
            <select
              id="filtro-quartos"
              className="selecao"
              value={filtro.quartos}
              onChange={(e) => atualizar("quartos", e.target.value)}
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <label htmlFor="filtro-banheiros" className="rotulo-campo">
              Banheiros
            </label>
            <select
              id="filtro-banheiros"
              className="selecao"
              value={filtro.banheiros}
              onChange={(e) => atualizar("banheiros", e.target.value)}
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div>
            <label htmlFor="filtro-vagas" className="rotulo-campo">
              Vagas
            </label>
            <select
              id="filtro-vagas"
              className="selecao"
              value={filtro.vagas}
              onChange={(e) => atualizar("vagas", e.target.value)}
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div>
            <label htmlFor="filtro-area" className="rotulo-campo">
              Área mín. (m²)
            </label>
            <input
              id="filtro-area"
              className="campo"
              type="number"
              min={0}
              value={filtro.areaMin}
              onChange={(e) => atualizar("areaMin", e.target.value)}
              placeholder="40"
            />
          </div>
        </div>

        <div className={estilos.acoes}>
          <button type="button" className="botao botao-fantasma" onClick={limpar}>
            Limpar
          </button>
          <button type="submit" className="botao botao-primario">
            Aplicar filtros
          </button>
        </div>
      </form>

      {aberto ? (
        <button
          type="button"
          className={estilos.overlay}
          aria-label="Fechar filtros"
          onClick={() => setAberto(false)}
        />
      ) : null}
    </div>
  );
}
