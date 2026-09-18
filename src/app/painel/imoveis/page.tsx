import Image from "next/image";
import Link from "next/link";
import { AcoesImovelLista } from "@/componentes/painel/AcoesImovelLista";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { criarEnderecoDaMidia } from "@/lib/imoveis/midias";
import { consultarImoveisDoPainel, type FiltrosDaListaDoPainel } from "@/lib/imoveis/repositorio";
import estilos from "./imoveis.module.css";

const rotulosDeTipo: Record<string, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  SOBRADO: "Sobrado",
};
const rotulosDeSituacao: Record<string, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADO: "Publicado",
};
const rotulosDeDisponibilidade: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  EM_NEGOCIACAO: "Em negociação",
  VENDIDO: "Vendido",
  INDISPONIVEL: "Indisponível",
};
const situacoes = ["PUBLICADO", "RASCUNHO"] as const;
const disponibilidades = [
  "DISPONIVEL",
  "RESERVADO",
  "EM_NEGOCIACAO",
  "VENDIDO",
  "INDISPONIVEL",
] as const;
const formatadorDePreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Parametros = {
  criado?: string;
  atualizado?: string;
  busca?: string;
  situacao?: string;
  disponibilidade?: string;
  pagina?: string;
};

function valorPermitido<T extends readonly string[]>(
  valor: string | undefined,
  lista: T,
) {
  return lista.includes(valor as T[number]) ? (valor as T[number]) : undefined;
}

function enderecoDaPagina(parametros: Parametros, pagina: number) {
  const busca = new URLSearchParams();
  if (parametros.busca?.trim()) busca.set("busca", parametros.busca.trim());
  if (parametros.situacao) busca.set("situacao", parametros.situacao);
  if (parametros.disponibilidade) {
    busca.set("disponibilidade", parametros.disponibilidade);
  }
  busca.set("pagina", String(pagina));
  return `/painel/imoveis?${busca.toString()}`;
}

export default async function PaginaImoveisPainel({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  await exigirSessaoPainel();
  const parametros = await searchParams;
  const filtros: FiltrosDaListaDoPainel = {
    busca: parametros.busca?.trim().slice(0, 100) || undefined,
    situacao: valorPermitido(parametros.situacao, situacoes),
    disponibilidade: valorPermitido(
      parametros.disponibilidade,
      disponibilidades,
    ),
    pagina: Math.max(1, Number.parseInt(parametros.pagina ?? "1", 10) || 1),
    porPagina: 20,
  };
  const resultado = await consultarImoveisDoPainel(filtros);
  const temFiltros = Boolean(
    filtros.busca || filtros.situacao || filtros.disponibilidade,
  );

  return (
    <main className={estilos.principal}>
      <header className={estilos.cabecalho}>
        <div>
          <h1>Imóveis</h1>
          <p>Localize, publique e atualize o catálogo com rapidez.</p>
        </div>
        <Link
          className={`botao botao-primario ${estilos.botaoCabecalho}`}
          href="/painel/imoveis/novo"
        >
          Adicionar imóvel
        </Link>
      </header>

      {parametros.criado === "rascunho" || parametros.criado === "publicado" ? (
        <p className={estilos.aviso} role="status">
          {parametros.criado === "publicado"
            ? "Imóvel publicado com sucesso."
            : "Rascunho salvo com sucesso."}
        </p>
      ) : null}
      {parametros.atualizado === "rascunho" ||
      parametros.atualizado === "publicado" ? (
        <p className={estilos.aviso} role="status">
          {parametros.atualizado === "publicado"
            ? "Imóvel atualizado e publicado com sucesso."
            : "Alterações salvas com sucesso."}
        </p>
      ) : null}

      <form className={estilos.filtros} method="get" role="search">
        <label className={estilos.busca}>
          <span>Buscar</span>
          <input
            className="campo"
            type="search"
            name="busca"
            maxLength={100}
            defaultValue={filtros.busca}
            placeholder="Código, título, cidade ou bairro"
          />
        </label>
        <label>
          <span>Publicação</span>
          <select
            className="selecao"
            name="situacao"
            defaultValue={filtros.situacao ?? ""}
          >
            <option value="">Todas</option>
            <option value="PUBLICADO">Publicados</option>
            <option value="RASCUNHO">Rascunhos</option>
          </select>
        </label>
        <label>
          <span>Disponibilidade</span>
          <select
            className="selecao"
            name="disponibilidade"
            defaultValue={filtros.disponibilidade ?? ""}
          >
            <option value="">Todas</option>
            {disponibilidades.map((item) => (
              <option key={item} value={item}>
                {rotulosDeDisponibilidade[item]}
              </option>
            ))}
          </select>
        </label>
        <div className={estilos.acoesFiltro}>
          <button className="botao botao-primario" type="submit">
            Filtrar
          </button>
          {temFiltros ? (
            <Link className="botao botao-secundario" href="/painel/imoveis">
              Limpar
            </Link>
          ) : null}
        </div>
      </form>

      {resultado.imoveis.length === 0 ? (
        <section
          className={estilos.vazio}
          aria-labelledby="titulo-sem-imoveis"
        >
          <h2 id="titulo-sem-imoveis">
            {temFiltros
              ? "Nenhum imóvel encontrado"
              : "Nenhum imóvel cadastrado"}
          </h2>
          <p>
            {temFiltros
              ? "Altere ou limpe os filtros para tentar novamente."
              : "Comece adicionando o primeiro imóvel ao catálogo."}
          </p>
          {temFiltros ? (
            <Link className="botao botao-secundario" href="/painel/imoveis">
              Limpar filtros
            </Link>
          ) : (
            <Link
              className="botao botao-primario"
              href="/painel/imoveis/novo"
            >
              Adicionar primeiro imóvel
            </Link>
          )}
        </section>
      ) : (
        <section className={estilos.lista} aria-label="Imóveis cadastrados">
          <header>
            <p>
              <strong>{resultado.total}</strong>{" "}
              {resultado.total === 1
                ? "imóvel encontrado"
                : "imóveis encontrados"}
            </p>
          </header>
          <ul>
            {resultado.imoveis.map((imovel) => (
              <li key={imovel.id} className={estilos.item}>
                <div className={estilos.capa}>
                  {imovel.capa ? (
                    <Image
                      src={criarEnderecoDaMidia(imovel.capa)}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 88px, 128px"
                      unoptimized
                    />
                  ) : (
                    <span aria-hidden="true">—</span>
                  )}
                </div>
                <div className={estilos.identificacao}>
                  <span>{imovel.codigo}</span>
                  <h2>{imovel.titulo}</h2>
                  {imovel.localizacao ? <p>{imovel.localizacao}</p> : null}
                </div>
                <div className={estilos.meta}>
                  <span className={estilos.tipo}>
                    {rotulosDeTipo[imovel.tipo] ?? imovel.tipo}
                  </span>
                  {imovel.preco !== null ? (
                    <strong className={estilos.preco}>
                      {formatadorDePreco.format(imovel.preco)}
                    </strong>
                  ) : (
                    <span className={estilos.precoVazio}>Sem preço</span>
                  )}
                  <div className={estilos.status}>
                    <span
                      className={`${estilos.situacao} ${
                        imovel.situacao === "PUBLICADO"
                          ? estilos.situacaoPublicado
                          : estilos.situacaoRascunho
                      }`}
                    >
                      {rotulosDeSituacao[imovel.situacao] ?? imovel.situacao}
                    </span>
                    <span className={estilos.disponibilidade}>
                      {rotulosDeDisponibilidade[imovel.disponibilidade] ??
                        imovel.disponibilidade}
                    </span>
                  </div>
                </div>
                <AcoesImovelLista
                  id={imovel.id}
                  titulo={imovel.titulo}
                  identificador={imovel.identificador}
                  publicado={imovel.situacao === "PUBLICADO"}
                />
              </li>
            ))}
          </ul>
          {resultado.totalPaginas > 1 ? (
            <nav
              className={estilos.paginacao}
              aria-label="Paginação dos imóveis"
            >
              {resultado.pagina > 1 ? (
                <Link
                  className="botao botao-secundario"
                  href={enderecoDaPagina(parametros, resultado.pagina - 1)}
                >
                  Anterior
                </Link>
              ) : (
                <span />
              )}
              <span>
                Página {resultado.pagina} de {resultado.totalPaginas}
              </span>
              {resultado.pagina < resultado.totalPaginas ? (
                <Link
                  className="botao botao-secundario"
                  href={enderecoDaPagina(parametros, resultado.pagina + 1)}
                >
                  Próxima
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>
      )}
    </main>
  );
}
