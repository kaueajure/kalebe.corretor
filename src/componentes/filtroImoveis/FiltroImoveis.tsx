"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Icone } from "@/componentes/ui/Icone";
import estilos from "./filtroImoveis.module.css";
interface Props { cidades: string[]; bairros: string[]; total: number; localizacoes?: { cidade: string; bairro: string }[]; }
const tipos = [["casa", "Casa"], ["apartamento", "Apartamento"], ["sobrado", "Sobrado"], ["terreno", "Terreno"], ["comercial", "Comercial"]];
export function FiltroImoveis(props: Props) {
  const params = useSearchParams();
  return <FormularioFiltros key={params.toString()} {...props} />;
}
function FormularioFiltros({ cidades, bairros, total, localizacoes = [] }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [cidade, setCidade] = useState(params.get("cidade") || "");
  const [pendente, iniciar] = useTransition();
  const bairrosDaCidade = cidade ? [...new Set(localizacoes.filter((l) => l.cidade === cidade).map((l) => l.bairro))].sort() : bairros;
  const advancedKeys = ["bairro", "precoMin", "quartos", "banheiros", "vagas", "areaMin"];
  function aplicar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = new URLSearchParams();
    new FormData(e.currentTarget).forEach((value, key) => { if (typeof value === "string" && value.trim()) query.set(key, value.trim()); });
    iniciar(() => router.push(`/imoveis?${query.toString()}`, { scroll: false }));
  }
  return <form className={estilos.painel} onSubmit={aplicar} aria-label="Filtrar imóveis" aria-busy={pendente}>
    <div className={estilos.grade}>
      <div><label htmlFor="filtro-finalidade" className="rotulo-campo">Quero</label><select id="filtro-finalidade" name="finalidade" className="selecao" defaultValue={params.get("finalidade") || ""}><option value="">Comprar ou alugar</option><option value="venda">Comprar</option><option value="aluguel">Alugar</option></select></div>
      <div><label htmlFor="filtro-cidade" className="rotulo-campo">Cidade</label><select id="filtro-cidade" name="cidade" className="selecao" value={cidade} onChange={(e) => setCidade(e.target.value)}><option value="">Todas as cidades</option>{[...new Set([...cidades, ...(cidade ? [cidade] : [])])].map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label htmlFor="filtro-tipo" className="rotulo-campo">Tipo de imóvel</label><select id="filtro-tipo" name="tipo" className="selecao" defaultValue={params.get("tipo") || ""}><option value="">Todos os tipos</option>{tipos.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</select></div>
      <div><label htmlFor="filtro-preco-max" className="rotulo-campo">Valor máximo (R$)</label><input id="filtro-preco-max" name="precoMax" className="campo" type="number" min="0" defaultValue={params.get("precoMax") || ""} placeholder="Ex.: 400000" /></div>
    </div>
    <details className={estilos.avancados} open={advancedKeys.some((key) => params.has(key)) || undefined}><summary><Icone nome="filtros" size={16} /> Mais filtros</summary><div className={estilos.grade}>
      <div><label htmlFor="filtro-bairro" className="rotulo-campo">Bairro</label><select key={cidade} id="filtro-bairro" name="bairro" className="selecao" defaultValue={cidade === (params.get("cidade") || "") ? params.get("bairro") || "" : ""}><option value="">Todos os bairros</option>{[...new Set([...bairrosDaCidade, ...(params.get("bairro") && cidade === (params.get("cidade") || "") ? [params.get("bairro")!] : [])])].map((b) => <option key={b}>{b}</option>)}</select></div>
      <div><label htmlFor="filtro-preco-min" className="rotulo-campo">Valor mínimo (R$)</label><input id="filtro-preco-min" name="precoMin" className="campo" type="number" min="0" defaultValue={params.get("precoMin") || ""} placeholder="Ex.: 150000" /></div>
      {[["quartos", "Quartos"], ["banheiros", "Banheiros"], ["vagas", "Vagas"]].map(([key, label]) => <div key={key}><label htmlFor={`filtro-${key}`} className="rotulo-campo">{label}</label><select id={`filtro-${key}`} name={key} className="selecao" defaultValue={params.get(key) || ""}><option value="">Qualquer quantidade</option>{[1,2,3,4].map((n) => <option key={n} value={n}>{n} ou mais</option>)}</select></div>)}
      <div><label htmlFor="filtro-area" className="rotulo-campo">Área mínima (m²)</label><input id="filtro-area" name="areaMin" className="campo" type="number" min="0" defaultValue={params.get("areaMin") || ""} placeholder="Ex.: 80" /></div>
    </div></details>
    <div className={estilos.rodape}><div className={estilos.busca}><label htmlFor="filtro-busca" className="sr-only">Código, bairro ou palavra-chave</label><Icone nome="busca" size={16} /><input id="filtro-busca" name="busca" defaultValue={params.get("busca") || ""} placeholder="Código, bairro ou palavra-chave" /></div><div className={estilos.acoes}><button type="button" className={estilos.limpar} onClick={() => iniciar(() => router.push("/imoveis", { scroll: false }))}>Limpar filtros</button><button type="submit" className="botao botao-primario" disabled={pendente}>{pendente ? "Buscando…" : "Buscar imóveis"}</button></div></div>
    <input type="hidden" name="ordem" value={params.get("ordem") || ""} /><span className="sr-only" role="status">{pendente ? "Atualizando resultados" : `${total} imóveis encontrados`}</span>
  </form>;
}
