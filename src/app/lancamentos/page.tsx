import type { Metadata } from "next";
import { CardEmpreendimento } from "@/componentes/cardImovel/CardEmpreendimento";
import { empreendimentos } from "@/dados/lancamentos";
import estilos from "./lancamentos.module.css";

export const metadata: Metadata = {
  title: "Lançamentos e empreendimentos",
  description:
    "Lançamentos residenciais em São José do Rio Preto, Mirassol e Bady Bassitt, incluindo Minha Casa Minha Vida.",
};

export default function PaginaLancamentos() {
  return (
    <div className={estilos.pagina}>
      <div className="conteudo">
        <header className={estilos.cabecalho}>
          <p className="rotulo-secao">Na planta</p>
          <h1 className="titulo-secao">Lançamentos</h1>
          <div className="divisor" />
          <p className="texto-secao">
            Empreendimentos com valores a partir de e tipologias informadas pelas
            construtoras. Para plantas, condições e disponibilidade, fale no
            WhatsApp.
          </p>
        </header>

        {empreendimentos.length === 0 ? (
          <div className="mensagem-estado">
            <h2>Nenhum lançamento cadastrado</h2>
            <p>Novos empreendimentos serão publicados aqui.</p>
          </div>
        ) : (
          <div className={estilos.grade}>
            {empreendimentos.map((item) => (
              <CardEmpreendimento key={item.id} empreendimento={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
