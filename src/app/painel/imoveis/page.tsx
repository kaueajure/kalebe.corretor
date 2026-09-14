import Image from "next/image";
import Link from "next/link";
import { AcoesImovelLista } from "@/componentes/painel/AcoesImovelLista";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { criarEnderecoDaMidia } from "@/lib/imoveis/midias";
import {
  listarImoveisDoPainel,
  type ImovelDoPainel,
} from "@/lib/imoveis/repositorio";
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

const formatadorDePreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type PropriedadesDaPagina = {
  searchParams: Promise<{
    criado?: string;
    atualizado?: string;
  }>;
};

export default async function PaginaImoveisPainel({
  searchParams,
}: PropriedadesDaPagina) {
  await exigirSessaoPainel();
  const [imoveis, parametros] = await Promise.all([
    listarImoveisDoPainel(),
    searchParams,
  ]);

  return (
    <main className={estilos.principal}>
      <header className={estilos.cabecalho}>
        <div>
          <h1>Imóveis</h1>
          <p>Cadastre e acompanhe os imóveis disponíveis no catálogo.</p>
        </div>
        <Link className="botao botao-primario" href="/painel/imoveis/novo">
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

      {imoveis.length === 0 ? (
        <section className={estilos.vazio} aria-labelledby="titulo-sem-imoveis">
          <h2 id="titulo-sem-imoveis">Nenhum imóvel cadastrado</h2>
          <p>Comece adicionando o primeiro imóvel ao catálogo.</p>
          <Link className="botao botao-primario" href="/painel/imoveis/novo">
            Adicionar primeiro imóvel
          </Link>
        </section>
      ) : (
        <section className={estilos.lista} aria-label="Imóveis cadastrados">
          <header>
            <p>
              <strong>{imoveis.length}</strong>{" "}
              {imoveis.length === 1
                ? "imóvel cadastrado"
                : "imóveis cadastrados"}
            </p>
          </header>
          <ul>
            {imoveis.map((imovel: ImovelDoPainel) => (
              <li key={imovel.id} className={estilos.item}>
                <div className={estilos.capa}>
                  {imovel.capa ? (
                    <Image
                      src={criarEnderecoDaMidia(imovel.capa)}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 96px, 128px"
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
                <div className={estilos.dados}>
                  <span>{rotulosDeTipo[imovel.tipo] ?? imovel.tipo}</span>
                </div>
                {imovel.preco !== null ? (
                  <strong className={estilos.preco}>
                    {formatadorDePreco.format(imovel.preco)}
                  </strong>
                ) : (
                  <span />
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
                <AcoesImovelLista id={imovel.id} titulo={imovel.titulo} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
