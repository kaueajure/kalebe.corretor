import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import { BarraContatoMobile } from "@/componentes/barraContatoMobile/BarraContatoMobile";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { FavoritoBotao } from "@/componentes/favoritoBotao/FavoritoBotao";
import { GaleriaImovel } from "@/componentes/galeriaImovel/GaleriaImovel";
import { Breadcrumbs } from "@/componentes/seo/Breadcrumbs";
import { DadosEstruturados } from "@/componentes/seo/DadosEstruturados";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import { obterImovelPorSlug, obterImoveisSimilares } from "@/dados/imoveis";
import {
  formatarArea,
  formatarLocalizacao,
  formatarPreco,
  formatarStatus,
  formatarTipo,
  linkWhatsApp,
  mensagemInteresseImovel,
} from "@/lib/formatadores";
import {
  schemaBreadcrumbList,
  schemaRealEstateListing,
} from "@/lib/seo/dados-estruturados";
import {
  caminhoBairro,
  caminhoCidade,
  caminhoCondominio,
  criarMetadataImovel,
} from "@/lib/seo/metadata";
import { criarSlug } from "@/lib/seo/slug";
import estilos from "./detalhe.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

const obterImovel = cache(obterImovelPorSlug);

function textoDoStatus(status: Parameters<typeof formatarStatus>[0]) {
  const mensagens = {
    reservado: "Este imóvel está reservado no momento.",
    em_negociacao: "Este imóvel está em negociação no momento.",
    vendido: "Este imóvel já foi vendido.",
    indisponivel: "Este imóvel está indisponível no momento.",
    disponivel: "",
  };
  return mensagens[status];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const imovel = await obterImovel(slug);
  if (!imovel) {
    return {
      title: "Imóvel não encontrado",
      robots: { index: false, follow: false },
    };
  }
  return criarMetadataImovel(imovel);
}

export default async function PaginaDetalheImovel({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { slug } = await params;
  const imovel = await obterImovel(slug);
  if (!imovel) notFound();

  const similares = await obterImoveisSimilares(imovel);
  const mensagem = mensagemInteresseImovel(imovel);
  const localizacao = formatarLocalizacao(
    imovel.bairro,
    imovel.cidade,
    imovel.estado,
  );
  const enderecoExato =
    imovel.exibirEnderecoExato && imovel.logradouro
      ? [
          [imovel.logradouro, imovel.numero].filter(Boolean).join(", "),
          imovel.complemento,
          imovel.nomeCondominio,
          localizacao,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";
  const temLocalizacao = Boolean(
    enderecoExato || localizacao || imovel.nomeCondominio,
  );

  const slugCidade = imovel.cidade ? criarSlug(imovel.cidade) : null;
  const slugBairro = imovel.bairro ? criarSlug(imovel.bairro) : null;
  const slugCondominio = imovel.nomeCondominio
    ? criarSlug(imovel.nomeCondominio)
    : null;

  const breadcrumbs = [
    { nome: "Início", url: "/" },
    { nome: "Imóveis", url: "/imoveis" },
    ...(imovel.cidade && slugCidade
      ? [{ nome: imovel.cidade, url: caminhoCidade(slugCidade) }]
      : []),
    { nome: imovel.titulo },
  ];

  return (
    <>
      <DadosEstruturados
        nonce={nonce}
        dados={[
          schemaRealEstateListing(imovel),
          schemaBreadcrumbList(breadcrumbs),
        ]}
      />
      <article
        className={`${estilos.pagina} ${imovel.status !== "disponivel" ? estilos.indisponivelPagina : ""}`}
      >
        <div className="conteudo">
          <Breadcrumbs itens={breadcrumbs} />

          {imovel.midias.length > 0 ? (
            <GaleriaImovel midias={imovel.midias} titulo={imovel.titulo} />
          ) : null}

          <div className={estilos.grade}>
            <div>
              <div className={estilos.metaTopo}>
                <span className="pill">Venda</span>
                <span className="pill">{formatarTipo(imovel.tipo)}</span>
                <span className={estilos.codigo}>Cód. {imovel.codigo}</span>
              </div>
              <h1 className={estilos.titulo}>{imovel.titulo}</h1>
              {localizacao || imovel.nomeCondominio ? (
                <p className={estilos.local}>
                  {imovel.nomeCondominio && slugCondominio ? (
                    <>
                      <Link href={caminhoCondominio(slugCondominio)}>
                        {imovel.nomeCondominio}
                      </Link>
                      {localizacao ? " · " : null}
                    </>
                  ) : null}
                  {imovel.bairro && slugBairro ? (
                    <Link href={caminhoBairro(slugBairro)}>{imovel.bairro}</Link>
                  ) : null}
                  {imovel.bairro && imovel.cidade ? ", " : null}
                  {imovel.cidade && slugCidade ? (
                    <Link href={caminhoCidade(slugCidade)}>{imovel.cidade}</Link>
                  ) : null}
                  {imovel.estado ? ` - ${imovel.estado}` : null}
                </p>
              ) : null}

              {imovel.status !== "disponivel" ? (
                <p className={estilos.aviso} role="status">
                  {textoDoStatus(imovel.status)}
                </p>
              ) : null}

              {[
                imovel.quartos,
                imovel.suites,
                imovel.banheiros,
                imovel.vagas,
                imovel.area,
                imovel.areaTerreno,
              ].some((valor) => valor != null) ? (
                <ul className={estilos.resumo}>
                  {imovel.quartos != null ? (
                    <li>
                      <strong>{imovel.quartos}</strong>
                      <span>Quartos</span>
                    </li>
                  ) : null}
                  {imovel.suites != null ? (
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
              ) : null}

              {imovel.descricao ? (
                <section className={estilos.bloco}>
                  <h2>Descrição</h2>
                  <p>{imovel.descricao}</p>
                </section>
              ) : null}

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

              {imovel.aceitaFinanciamento === true ||
              imovel.aceitaPermuta === true ? (
                <section className={estilos.bloco}>
                  <h2>Condições</h2>
                  <ul className={estilos.lista}>
                    {imovel.aceitaFinanciamento === true ? (
                      <li>Aceita financiamento</li>
                    ) : null}
                    {imovel.aceitaPermuta === true ? (
                      <li>Aceita permuta</li>
                    ) : null}
                  </ul>
                </section>
              ) : null}

              {temLocalizacao ? (
                <section className={estilos.bloco}>
                  <h2>Localização</h2>
                  {enderecoExato ? (
                    <p>{enderecoExato}</p>
                  ) : (
                    <p>
                      {imovel.nomeCondominio && slugCondominio ? (
                        <Link href={caminhoCondominio(slugCondominio)}>
                          {imovel.nomeCondominio}
                        </Link>
                      ) : (
                        imovel.nomeCondominio
                      )}
                      {imovel.nomeCondominio && (imovel.bairro || imovel.cidade)
                        ? " · "
                        : null}
                      {imovel.bairro && slugBairro ? (
                        <Link href={caminhoBairro(slugBairro)}>
                          {imovel.bairro}
                        </Link>
                      ) : (
                        imovel.bairro
                      )}
                      {imovel.bairro && imovel.cidade ? ", " : null}
                      {imovel.cidade && slugCidade ? (
                        <Link href={caminhoCidade(slugCidade)}>
                          {imovel.cidade}
                        </Link>
                      ) : (
                        imovel.cidade
                      )}
                      {imovel.estado ? ` - ${imovel.estado}` : null}
                    </p>
                  )}
                  {imovel.exibirEnderecoExato && imovel.pontoReferencia ? (
                    <p className={estilos.obs}>
                      Referência: {imovel.pontoReferencia}
                    </p>
                  ) : null}
                  {!imovel.exibirEnderecoExato ? (
                    <p className={estilos.obs}>
                      O endereço completo é informado durante o atendimento.
                    </p>
                  ) : null}
                </section>
              ) : null}
            </div>

            <aside className={estilos.lateral}>
              <div className={estilos.caixa}>
                {imovel.precoAnterior ? (
                  <p className={estilos.precoAntigo}>
                    {formatarPreco(imovel.precoAnterior)}
                  </p>
                ) : null}
                {imovel.preco != null ? (
                  <p className={estilos.preco}>{formatarPreco(imovel.preco)}</p>
                ) : null}
                {[imovel.condominio, imovel.iptu, imovel.outrasDespesas].some(
                  (valor) => valor != null,
                ) ? (
                  <ul className={estilos.custos}>
                    {imovel.condominio != null ? (
                      <li>
                        Condomínio:{" "}
                        {imovel.condominio === 0
                          ? "Isento"
                          : formatarPreco(imovel.condominio)}
                      </li>
                    ) : null}
                    {imovel.iptu != null ? (
                      <li>
                        IPTU
                        {imovel.iptu > 0 && imovel.periodicidadeIptu
                          ? ` (${imovel.periodicidadeIptu})`
                          : ""}
                        :{" "}
                        {imovel.iptu === 0
                          ? "Isento"
                          : formatarPreco(imovel.iptu)}
                      </li>
                    ) : null}
                    {imovel.outrasDespesas != null ? (
                      <li>
                        Outras despesas: {formatarPreco(imovel.outrasDespesas)}
                      </li>
                    ) : null}
                  </ul>
                ) : null}
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
