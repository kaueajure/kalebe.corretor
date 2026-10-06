import { Icone } from "@/componentes/ui/Icone";
import { formatarPreco, formatarTipo } from "@/lib/formatadores";
import type { OpcoesFiltros } from "@/lib/imoveis/opcoes-filtros";
import estilos from "./buscaPrincipal.module.css";

export function BuscaPrincipal({ opcoes }: { opcoes: OpcoesFiltros }) {

  return (
    <div className={estilos.busca}>
      <form action="/imoveis" className={estilos.form} aria-label="Buscar imóveis">
        <div className={estilos.campo}>
          <label htmlFor="busca-cidade">Onde você quer morar?</label>
          <select id="busca-cidade" name="cidade" className="selecao" defaultValue="">
            <option value="">Todas as cidades</option>
            {opcoes.cidades.map((cidade) => (
              <option key={cidade}>{cidade}</option>
            ))}
          </select>
        </div>
        <div className={estilos.campo}>
          <label htmlFor="busca-tipo">Tipo de imóvel</label>
          <select id="busca-tipo" name="tipo" className="selecao" defaultValue="">
            <option value="">Todos os tipos</option>
            {opcoes.tipos.map((tipo) => <option key={tipo} value={tipo}>{formatarTipo(tipo)}</option>)}
          </select>
        </div>
        <div className={estilos.campo}>
          <label htmlFor="busca-preco">Até quanto?</label>
          <select
            id="busca-preco"
            name="precoMax"
            className="selecao"
            defaultValue=""
          >
            <option value="">Qualquer valor</option>
            {opcoes.precos.map((preco) => (
              <option key={preco} value={preco}>
                Até {formatarPreco(preco)}
              </option>
            ))}
          </select>
        </div>
        <div className={estilos.campo}>
          <label htmlFor="busca-quartos">Quantos quartos?</label>
          <select id="busca-quartos" name="quartos" className="selecao" defaultValue="">
            <option value="">Qualquer quantidade</option>
            {opcoes.quartos.map((quantidade) => (
              <option key={quantidade} value={quantidade}>{quantidade} ou mais</option>
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
