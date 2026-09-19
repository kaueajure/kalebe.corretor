import Link from "next/link";
import { headers } from "next/headers";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { Breadcrumbs } from "@/componentes/seo/Breadcrumbs";
import { DadosEstruturados } from "@/componentes/seo/DadosEstruturados";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import type { ItemBreadcrumb } from "@/lib/seo/dados-estruturados";
import { formatarPreco, linkWhatsApp } from "@/lib/formatadores";
import type { Imovel } from "@/tipos/imovel";
import estilos from "./paginaListagemSeo.module.css";

export interface LinkRelacionado {
  href: string;
  rotulo: string;
}

export interface EstatisticasListagem {
  total: number;
  bairros?: number;
  precoMin?: number | null;
  precoMax?: number | null;
}

interface Props {
  breadcrumbs: ItemBreadcrumb[];
  titulo: string;
  descricao: string;
  textoUtil: string;
  imoveis: Imovel[];
  linksRelacionados?: LinkRelacionado[];
  estatisticas?: EstatisticasListagem;
  schemas: unknown[];
  mensagemWhatsApp?: string;
}

export async function PaginaListagemSeo({
  breadcrumbs,
  titulo,
  descricao,
  textoUtil,
  imoveis,
  linksRelacionados = [],
  estatisticas,
  schemas,
  mensagemWhatsApp,
}: Props) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const disponiveis = imoveis.filter((item) => item.status === "disponivel");

  return (
    <>
      <DadosEstruturados nonce={nonce} dados={schemas} />
      <div className="pagina-interna">
        <div className={`conteudo corpo-pagina ${estilos.corpo}`}>
          <Breadcrumbs itens={breadcrumbs} />
          <header className="intro-pagina">
            <p className="rotulo-secao">Catálogo</p>
            <h1 className="titulo-secao">{titulo}</h1>
            <p className="texto-secao">{descricao}</p>
          </header>

          {estatisticas && estatisticas.total > 0 ? (
            <ul className={estilos.stats} aria-label="Resumo da busca">
              <li>
                <strong>{estatisticas.total}</strong>{" "}
                {estatisticas.total === 1 ? "imóvel" : "imóveis"}
              </li>
              {estatisticas.bairros != null && estatisticas.bairros > 0 ? (
                <li>
                  <strong>{estatisticas.bairros}</strong>{" "}
                  {estatisticas.bairros === 1 ? "bairro" : "bairros"}
                </li>
              ) : null}
              {estatisticas.precoMin != null &&
              estatisticas.precoMax != null &&
              estatisticas.precoMin > 0 ? (
                <li>
                  de {formatarPreco(estatisticas.precoMin)} a{" "}
                  {formatarPreco(estatisticas.precoMax)}
                </li>
              ) : null}
            </ul>
          ) : null}

          <p className={estilos.textoUtil}>{textoUtil}</p>

          {linksRelacionados.length > 0 ? (
            <div className={estilos.atalhos} aria-label="Categorias relacionadas">
              {linksRelacionados.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.rotulo}
                </Link>
              ))}
            </div>
          ) : null}

          {disponiveis.length === 0 ? (
            <div className="mensagem-estado">
              <h2>Nenhum imóvel disponível no momento</h2>
              <p>
                Me conte o que você procura — cidade, tipo e faixa de valor —
                que eu busco opções com você.
              </p>
              <Link href="/imoveis" className="botao botao-secundario">
                Ver todos os imóveis
              </Link>
            </div>
          ) : (
            <div className="grade-imoveis">
              {disponiveis.map((imovel, indice) => (
                <CardImovel
                  key={imovel.id}
                  imovel={imovel}
                  prioridade={indice < 3}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="faixa-cta">
        <div className="conteudo faixa-cta-interior">
          <div>
            <h2>Quer ajuda para escolher?</h2>
            <p>
              Me chame no WhatsApp com a cidade, o tipo e o valor que você tem
              em mente.
            </p>
          </div>
          <a
            href={linkWhatsApp(
              empresa.whatsapp,
              mensagemWhatsApp ??
                "Olá, Kalebe! Gostaria de ajuda para encontrar um imóvel.",
            )}
            className="botao botao-secundario"
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar no WhatsApp <Icone nome="seta" size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
