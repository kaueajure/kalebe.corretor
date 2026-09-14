import type { Metadata } from "next";
import Link from "next/link";
import { CardEmpreendimento } from "@/componentes/cardImovel/CardEmpreendimento";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import { empreendimentos } from "@/dados/lancamentos";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./lancamentos.module.css";

export const metadata: Metadata = {
  title: "Lançamentos e empreendimentos",
  description:
    "Casas e apartamentos na planta em Rio Preto, Mirassol e Bady Bassitt. Opções do Minha Casa Minha Vida com o Kalebe.",
};

export default async function PaginaLancamentos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cidade = typeof params.cidade === "string" ? params.cidade : "";
  const tipo = typeof params.tipo === "string" ? params.tipo : "";
  const lista = empreendimentos.filter(
    (i) => (!cidade || i.cidade === cidade) && (!tipo || i.tipo === tipo)
  );

  return (
    <>
      <div className="pagina-interna">
        <div className="conteudo corpo-pagina">
          <header className="intro-pagina">
            <p className="rotulo-secao">Na planta</p>
            <h1 className="titulo-secao">Lançamentos na região</h1>
            <p className="texto-secao">
              Compare casas e apartamentos, inclusive Minha Casa Minha Vida.
              Plantas, vagas e condições de compra saem no atendimento.
            </p>
          </header>

          <div className={estilos.destaqueMcmv}>
            <div>
              <Icone nome="chave" size={22} />
              <strong>Vai usar o Minha Casa Minha Vida?</strong>
              <p>
                Me chame com a cidade e a faixa de valor. Eu te oriento no que
                dá para financiar.
              </p>
            </div>
            <a
              href={linkWhatsApp(
                empresa.whatsapp,
                "Olá, Kalebe! Quero conhecer as opções do Minha Casa Minha Vida."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="link-seta"
            >
              Tirar dúvidas <Icone nome="seta" size={17} />
            </a>
          </div>

          <form action="/lancamentos" className={estilos.filtros}>
            <div>
              <label htmlFor="lancamento-cidade" className="rotulo-campo">
                Cidade
              </label>
              <select
                id="lancamento-cidade"
                name="cidade"
                defaultValue={cidade}
                className="selecao"
              >
                <option value="">Todas as cidades</option>
                {empresa.cidadesAtendimento.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lancamento-tipo" className="rotulo-campo">
                Tipo
              </label>
              <select
                id="lancamento-tipo"
                name="tipo"
                defaultValue={tipo}
                className="selecao"
              >
                <option value="">Casas e apartamentos</option>
                <option value="casa">Casas</option>
                <option value="apartamento">Apartamentos</option>
              </select>
            </div>
            <button className="botao botao-primario" type="submit">
              Filtrar
            </button>
            {cidade || tipo ? (
              <Link href="/lancamentos" className="link-seta">
                Limpar
              </Link>
            ) : null}
          </form>

          <p className={estilos.total}>
            {lista.length}{" "}
            {lista.length === 1
              ? "empreendimento encontrado"
              : "empreendimentos encontrados"}
          </p>

          {lista.length ? (
            <div className="grade-empreendimentos">
              {lista.map((item) => (
                <CardEmpreendimento key={item.id} empreendimento={item} />
              ))}
            </div>
          ) : (
            <div className="mensagem-estado">
              <h2>Nenhum lançamento com esses filtros</h2>
              <p>Troque a cidade ou o tipo para ver as opções.</p>
              <Link href="/lancamentos" className="botao botao-secundario">
                Ver todos os lançamentos
              </Link>
            </div>
          )}

          <p className={estilos.nota}>
            Valores iniciais por empreendimento. Confirme disponibilidade,
            plantas e condições no atendimento.
          </p>
        </div>
      </div>

      <section className="faixa-cta">
        <div className="conteudo faixa-cta-interior">
          <div>
            <h2>Quer visitar um lançamento?</h2>
            <p>
              Combinamos a visita e eu te mostro plantas, valores de entrada e
              o que cabe no seu orçamento.
            </p>
          </div>
          <a
            href={linkWhatsApp(
              empresa.whatsapp,
              "Olá, Kalebe! Quero conhecer os lançamentos disponíveis."
            )}
            className="botao botao-secundario"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agendar conversa <Icone nome="seta" size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
