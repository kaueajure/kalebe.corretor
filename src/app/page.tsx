import Image from "next/image";
import Link from "next/link";
import { BuscaPrincipal } from "@/componentes/buscaPrincipal/BuscaPrincipal";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { CardEmpreendimento } from "@/componentes/cardImovel/CardEmpreendimento";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import { listarImoveisPublicados } from "@/dados/imoveis";
import { empreendimentos } from "@/dados/lancamentos";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./inicio.module.css";

export const dynamic = "force-dynamic";

export default async function PaginaInicial() {
  const imoveis = await listarImoveisPublicados();
  const disponiveis = imoveis.filter((i) => i.status === "disponivel");
  const selecao = [...disponiveis]
    .sort((a, b) => Number(Boolean(b.destaque)) - Number(Boolean(a.destaque)))
    .slice(0, 6);
  const cidades = empresa.cidadesAtendimento;

  return (
    <>
      <section className={estilos.hero}>
        <div className={estilos.heroFotoWrap}>
          <Image
            src="/imagens/imoveis/jardim-arroio/05.webp"
            alt="Casa à venda no Jardim Arroio, em São José do Rio Preto"
            fill
            priority
            sizes="100vw"
            className={estilos.heroFoto}
          />
        </div>
        <div className={estilos.heroSombra} />
        <div className={`conteudo-largo ${estilos.heroConteudo}`}>
          <p className={estilos.local}>
            <Icone nome="local" size={16} />
            São José do Rio Preto · Mirassol · Bady Bassitt
          </p>
          <h1 className={estilos.titulo}>
            Encontre um imóvel em Rio Preto e região.
          </h1>
          <p className={estilos.subtitulo}>
            Casas, apartamentos e lançamentos do Minha Casa Minha Vida.
            Você busca aqui e conversa direto comigo.
          </p>
          <BuscaPrincipal />
        </div>
      </section>

      <div className={`conteudo ${estilos.atalhos}`} aria-label="Buscas rápidas">
        <Link href="/imoveis?tipo=casa&finalidade=venda">
          <Icone nome="casa" size={18} />
          Casas à venda
        </Link>
        <Link href="/imoveis?tipo=apartamento&finalidade=venda">
          <Icone nome="predio" size={18} />
          Apartamentos
        </Link>
        <Link href="/lancamentos">
          <Icone nome="chave" size={18} />
          Minha Casa Minha Vida
        </Link>
        <Link href="/imoveis?cidade=S%C3%A3o%20Jos%C3%A9%20do%20Rio%20Preto">
          <Icone nome="local" size={18} />
          Rio Preto
        </Link>
      </div>

      <section className="secao">
        <div className="conteudo">
          <div className={estilos.cabecalhoSecao}>
            <div>
              <h2 className="titulo-secao">Imóveis para visitar</h2>
              <p className="texto-secao">
                Opções disponíveis agora. Abra o anúncio, veja as fotos e chame
                no WhatsApp para agendar.
              </p>
            </div>
            <Link href="/imoveis" className="link-seta">
              Ver todos os imóveis <Icone nome="seta" />
            </Link>
          </div>
          {selecao.length ? (
            <div className="grade-imoveis">
              {selecao.map((imovel, indice) => (
                <CardImovel
                  key={imovel.id}
                  imovel={imovel}
                  prioridade={indice < 3}
                />
              ))}
            </div>
          ) : (
            <div className="mensagem-estado">
              <h3>O catálogo está sendo atualizado</h3>
              <p>Me conte o que você procura que eu busco as opções com você.</p>
              <Link href="/contato" className="botao botao-primario">
                Falar sobre minha busca
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className={estilos.lancamentos}>
        <div className="conteudo">
          <div className={estilos.cabecalhoSecao}>
            <div>
              <p className="rotulo-secao">Lançamentos</p>
              <h2 className="titulo-secao">Primeiro imóvel, com calma.</h2>
              <p className="texto-secao">
                Casas e apartamentos na planta, muitos pelo Minha Casa Minha
                Vida. Compare cidade, metragem e valor de entrada.
              </p>
            </div>
            <Link href="/lancamentos" className="link-seta">
              Ver lançamentos <Icone nome="seta" />
            </Link>
          </div>
          <div className={estilos.gradeEmp}>
            {empreendimentos.slice(0, 6).map((item) => (
              <CardEmpreendimento key={item.id} empreendimento={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="conteudo">
          <h2 className="titulo-secao">Onde você quer morar?</h2>
          <p className={`texto-secao ${estilos.cidadeIntro}`}>
            Atendo estas três cidades. Escolha uma para ver o que está
            disponível.
          </p>
          <div className={estilos.cidades}>
            {cidades.map((cidade) => {
              const total = disponiveis.filter((i) => i.cidade === cidade).length;
              return (
                <Link
                  key={cidade}
                  href={`/imoveis?cidade=${encodeURIComponent(cidade)}`}
                >
                  <Icone nome="local" size={22} />
                  <div>
                    <h3>{cidade}</h3>
                    <p>
                      {total
                        ? `${total} ${total === 1 ? "imóvel à venda" : "imóveis à venda"}`
                        : "Ver imóveis e lançamentos"}
                    </p>
                  </div>
                  <Icone nome="seta" size={18} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={estilos.sobreSecao}>
        <div className={`conteudo ${estilos.sobre}`}>
          <div className={estilos.sobreFoto}>
            <Image
              src="/imagens/sobre/kalebe.webp"
              alt="Kalebe, corretor de imóveis em Rio Preto e região"
              fill
              sizes="(max-width: 760px) 100vw, 440px"
            />
          </div>
          <div>
            <p className="rotulo-secao">Quem atende você</p>
            <h2 className={estilos.sobreTitulo}>
              Kalebe. Corretor aqui da região.
            </h2>
            <p>{empresa.sobre}</p>
            <p>
              Se ainda não estiver claro o tipo de imóvel ou o valor, a gente
              começa por aí — sem compromisso de visita.
            </p>
            <div className={estilos.acoes}>
              <a
                href={linkWhatsApp(empresa.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="botao botao-primario"
              >
                <Icone nome="mensagem" size={18} /> Conversar no WhatsApp
              </a>
              <Link href="/sobre" className="link-seta">
                Como eu trabalho <Icone nome="seta" size={18} />
              </Link>
            </div>
            <small>{empresa.creci}</small>
          </div>
        </div>
      </section>

      <section className={estilos.contato}>
        <div className={`conteudo ${estilos.contatoInterior}`}>
          <div>
            <h2>Quer vender um imóvel?</h2>
            <p>
              Me chame com o bairro, o tipo e o valor que você tem em mente.
              Combinamos a visita e os próximos passos.
            </p>
          </div>
          <a
            href={linkWhatsApp(
              empresa.whatsapp,
              "Olá, Kalebe! Tenho um imóvel para vender e gostaria de saber como anunciar."
            )}
            className="botao botao-secundario"
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero anunciar <Icone nome="seta" size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
