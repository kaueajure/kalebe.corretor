import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GaleriaImovel } from "@/componentes/galeriaImovel/GaleriaImovel";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { FavoritoBotao } from "@/componentes/favoritoBotao/FavoritoBotao";
import { BarraContatoMobile } from "@/componentes/barraContatoMobile/BarraContatoMobile";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import {
  listarSlugsPublicados,
  obterImovelPorSlug,
  obterImoveisSimilares,
} from "@/dados/imoveis";
import {
  formatarArea,
  formatarFinalidade,
  formatarLocalizacao,
  formatarPreco,
  formatarTipo,
  linkWhatsApp,
  mensagemInteresseImovel,
} from "@/lib/formatadores";
import estilos from "./detalhe.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await listarSlugsPublicados();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const imovel = await obterImovelPorSlug(slug);
  if (!imovel) return { title: "Imóvel não encontrado" };

  const descricao = `${imovel.titulo} em ${imovel.bairro}, ${imovel.cidade}. ${formatarPreco(imovel.preco)}.`;

  return {
    title: imovel.titulo,
    description: descricao,
    openGraph: {
      title: imovel.titulo,
      description: descricao,
      images: imovel.fotos[0] ? [{ url: imovel.fotos[0] }] : undefined,
    },
  };
}

export default async function PaginaDetalheImovel({ params }: Props) {
  const { slug } = await params;
  const imovel = await obterImovelPorSlug(slug);
  if (!imovel) notFound();

  const similares = await obterImoveisSimilares(imovel);
  const mensagem = mensagemInteresseImovel(imovel);
  const indisponivel = imovel.status !== "disponivel";

  const dadosEstruturados = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: imovel.titulo,
    description: imovel.descricao,
    url: `https://kalebecorretor.com.br/imoveis/${imovel.slug}`,
    datePosted: imovel.criadoEm,
    image: imovel.fotos,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: imovel.preco ?? undefined,
      availability:
        imovel.status === "disponivel"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: imovel.cidade,
      addressRegion: imovel.estado,
      addressCountry: "BR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
      />

      <article className={`${estilos.pagina} ${indisponivel ? estilos.indisponivelPagina : ""}`}>
        <div className="conteudo">
          <nav className="migalha" aria-label="Breadcrumb">
            <Link href="/">Início</Link>
            <span>/</span>
            <Link href="/imoveis">Imóveis</Link>
            <span>/</span>
            <span>{imovel.titulo}</span>
          </nav>

          <GaleriaImovel fotos={imovel.fotos} titulo={imovel.titulo} />

          <div className={estilos.grade}>
            <div>
              <div className={estilos.metaTopo}>
                <span className="pill">{formatarFinalidade(imovel.finalidade)}</span>
                <span className="pill">{formatarTipo(imovel.tipo)}</span>
                {imovel.mcmv ? <span className="pill">MCMV</span> : null}
                <span className={estilos.codigo}>Cód. {imovel.codigo}</span>
              </div>

              <h1 className={estilos.titulo}>{imovel.titulo}</h1>
              <p className={estilos.local}>
                {formatarLocalizacao(imovel.bairro, imovel.cidade, imovel.estado)}
              </p>

              {indisponivel ? (
                <p className={estilos.aviso} role="status">
                  Este imóvel está marcado como indisponível no momento.
                </p>
              ) : null}

              <ul className={estilos.resumo}>
                {imovel.quartos != null ? (
                  <li>
                    <strong>{imovel.quartos}</strong>
                    <span>Quartos</span>
                  </li>
                ) : null}
                {imovel.suites != null && imovel.suites > 0 ? (
                  <li>
                    <strong>{imovel.suites}</strong>
                    <span>Suítes</span>
                  </li>
                ) : null}
                {imovel.banheiros != null ? (
                  <li>
                    <strong>{imovel.banheiros}</strong>
                    <span>Banheiros</span>
                  </li>
                ) : null}
                {imovel.vagas != null ? (
                  <li>
                    <strong>{imovel.vagas}</strong>
                    <span>Vagas</span>
                  </li>
                ) : null}
                {imovel.area != null ? (
                  <li>
                    <strong>{formatarArea(imovel.area)}</strong>
                    <span>Área</span>
                  </li>
                ) : null}
                {imovel.areaTerreno != null ? (
                  <li>
                    <strong>{formatarArea(imovel.areaTerreno)}</strong>
                    <span>Terreno</span>
                  </li>
                ) : null}
              </ul>

              <section className={estilos.bloco}>
                <h2>Descrição</h2>
                <p>{imovel.descricao}</p>
              </section>

              {imovel.caracteristicas.length > 0 ? (
                <section className={estilos.bloco}>
                  <h2>Características</h2>
                  <ul className={estilos.lista}>
                    {imovel.caracteristicas.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {imovel.financiamento ? (
                <section className={estilos.bloco}>
                  <h2>{imovel.financiamento.titulo}</h2>
                  <dl className={estilos.financ}>
                    {imovel.financiamento.itens.map((item) => (
                      <div key={item.rotulo}>
                        <dt>{item.rotulo}</dt>
                        <dd>{item.valor}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              <section className={estilos.bloco}>
                <h2>Localização</h2>
                <p>
                  {imovel.bairro}, {imovel.cidade} – {imovel.estado}
                </p>
                <p className={estilos.obs}>
                  O endereço completo é informado no atendimento, conforme
                  disponibilidade de visita.
                </p>
              </section>
            </div>

            <aside className={estilos.lateral}>
              <div className={estilos.caixa}>
                {imovel.precoAnterior ? (
                  <p className={estilos.precoAntigo}>
                    {formatarPreco(imovel.precoAnterior)}
                  </p>
                ) : null}
                <p className={estilos.preco}>{formatarPreco(imovel.preco)}</p>
                {(imovel.condominio != null || imovel.iptu != null) && (
                  <ul className={estilos.custos}>
                    {imovel.condominio != null ? (
                      <li>
                        Condomínio: {formatarPreco(imovel.condominio)}
                      </li>
                    ) : null}
                    {imovel.iptu != null ? (
                      <li>IPTU: {formatarPreco(imovel.iptu)}</li>
                    ) : null}
                  </ul>
                )}

                <div className={estilos.acoes}>
                  <a
                    href={linkWhatsApp(empresa.whatsapp, mensagem)}
                    className="botao botao-whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chamar no WhatsApp
                  </a>
                  <a
                    href={`tel:+${empresa.telefoneLink}`}
                    className="botao botao-secundario"
                  >
                    Ligar
                  </a>
                  <FavoritoBotao
                    id={imovel.id}
                    titulo={imovel.titulo}
                    variante="texto"
                  />
                </div>

                <div className={estilos.corretor}>
                  <Image
                    src="/imagens/sobre/kalebe.webp"
                    alt="Kalebe"
                    width={48}
                    height={48}
                  />
                  <div>
                    <strong>Kalebe</strong>
                    <span>Corretor · {empresa.creci}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {similares.length > 0 ? (
            <section className={estilos.similares}>
              <div className={estilos.similaresCabecalho}>
                <div>
                  <p className="rotulo-secao">Continue olhando</p>
                  <h2 className="titulo-secao">Imóveis semelhantes</h2>
                </div>
                <Link href="/imoveis" className="link-seta">
                  Ver todos <Icone nome="seta" size={18} />
                </Link>
              </div>
              <div className="grade-imoveis">
                {similares.map((item) => (
                  <CardImovel key={item.id} imovel={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>

      <BarraContatoMobile mensagem={mensagem} />
      <div className={estilos.espacoMobile} />
    </>
  );
}
