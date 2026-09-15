import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import estilos from "./buscaPrincipal.module.css";

function rotuloPreco(valor: number) {
  if (valor >= 1_000_000) {
    return "Até R$ 1 milhão";
  }

  return `Até R$ ${valor / 1000} mil`;
}

export function BuscaPrincipal() {
  const precos = [200000, 300000, 400000, 600000, 1000000];

  return (
    <div className={estilos.busca}>
      <div className={estilos.intencoes}>
        <strong>Imóveis à venda</strong>
      </div>
      <form action="/imoveis" className={estilos.form} aria-label="Buscar imóveis">
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
          >
            <option value="">Qualquer valor</option>
            {precos.map((preco) => (
              <option key={preco} value={preco}>
                {rotuloPreco(preco)}
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
