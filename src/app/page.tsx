import Image from "next/image";
import Link from "next/link";
import { BuscaPrincipal } from "@/componentes/buscaPrincipal/BuscaPrincipal";
import { CardImovel } from "@/componentes/cardImovel/CardImovel";
import { CardEmpreendimento } from "@/componentes/cardImovel/CardEmpreendimento";
import { AtalhosFinalidade } from "@/componentes/atalhosFinalidade/AtalhosFinalidade";
import { ListaRegioes } from "@/componentes/atalhosFinalidade/ListaRegioes";
import { empresa } from "@/dados/empresa";
import { imoveis } from "@/dados/imoveis";
import { empreendimentos } from "@/dados/lancamentos";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./inicio.module.css";

export default function PaginaInicial() {
  const destaques = imoveis.filter((i) => i.destaque).slice(0, 3);
  const recentes = [...imoveis]
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .slice(0, 3);
  const lancamentos = empreendimentos.slice(0, 6);

  return (
    <>
      <section className={estilos.hero}>
        <div className={`conteudo-largo ${estilos.heroGrade}`}>
          <div className={`${estilos.heroTexto} aparecer`}>
            <p className="rotulo-secao">São José do Rio Preto e região</p>
            <h1 className={estilos.titulo}>
              Imóveis prontos e lançamentos com atendimento direto.
            </h1>
            <p className={estilos.subtitulo}>
              Busque por cidade, tipo e quartos. Fale com o corretor pelo
              WhatsApp quando encontrar uma opção.
            </p>
            <p className={estilos.creci}>{empresa.creci}</p>
            <BuscaPrincipal />
          </div>

          <div className={estilos.heroMidia}>
            <div className={estilos.moldura}>
              <Image
                src="/imagens/hero/kalebe.webp"
                alt={`${empresa.nome} — ${empresa.creci}`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 420px"
                className={estilos.foto}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="conteudo">
          <AtalhosFinalidade />
        </div>
      </section>

      <section className="secao secao-escura">
        <div className="conteudo">
          <div className={estilos.cabecalhoSecao}>
            <div>
              <p className="rotulo-secao">Seleção</p>
              <h2 className="titulo-secao">Imóveis em destaque</h2>
              <div className="divisor" />
            </div>
            <Link href="/imoveis" className="botao botao-secundario">
              Ver todos
            </Link>
          </div>
          <div className="grade-imoveis">
            {destaques.map((imovel, i) => (
              <CardImovel key={imovel.id} imovel={imovel} prioridade={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="conteudo">
          <div className={estilos.cabecalhoSecao}>
            <div>
              <p className="rotulo-secao">Na planta</p>
              <h2 className="titulo-secao">Lançamentos</h2>
              <div className="divisor" />
              <p className="texto-secao">
                Empreendimentos em Rio Preto, Mirassol e Bady Bassitt, incluindo
                opções do Minha Casa Minha Vida.
              </p>
            </div>
            <Link href="/lancamentos" className="botao botao-secundario">
              Ver lançamentos
            </Link>
          </div>
          <div className={estilos.gradeEmp}>
            {lancamentos.map((item) => (
              <CardEmpreendimento key={item.id} empreendimento={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="secao secao-escura">
        <div className="conteudo">
          <div className={estilos.cabecalhoSecao}>
            <div>
              <p className="rotulo-secao">Atualizações</p>
              <h2 className="titulo-secao">Imóveis recentes</h2>
              <div className="divisor" />
            </div>
          </div>
          <div className="grade-imoveis">
            {recentes.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="conteudo">
          <p className="rotulo-secao">Onde atuo</p>
          <h2 className="titulo-secao">Cidades e bairros</h2>
          <div className="divisor" />
          <ListaRegioes />
        </div>
      </section>

      <section className="secao secao-escura">
        <div className={`conteudo ${estilos.sobre}`}>
          <div>
            <p className="rotulo-secao">Sobre</p>
            <h2 className="titulo-secao">
              {empresa.nomeCurto}, corretor em{" "}
              <span className="destaque">Rio Preto e região</span>
            </h2>
            <div className="divisor" />
            <p className="texto-secao">{empresa.sobre}</p>
            <div className={estilos.acoes}>
              <Link href="/sobre" className="botao botao-secundario">
                Conhecer melhor
              </Link>
              <a
                href={linkWhatsApp(empresa.whatsapp)}
                className="botao botao-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div className={estilos.sobreFoto}>
            <Image
              src="/imagens/sobre/kalebe.webp"
              alt={empresa.nome}
              fill
              sizes="(max-width: 900px) 100vw, 420px"
              className={estilos.foto}
            />
          </div>
        </div>
      </section>

      <section className={estilos.contato}>
        <div className="conteudo">
          <p className="rotulo-secao" style={{ textAlign: "center" }}>
            Contato
          </p>
          <h2 className="titulo-secao" style={{ textAlign: "center" }}>
            Quer ver um imóvel ou simular financiamento?
          </h2>
          <div className="divisor" style={{ marginInline: "auto" }} />
          <p className={estilos.contatoTexto}>
            Chame no WhatsApp com o código do imóvel ou descreva o que procura.
            Atendimento em {empresa.cidade} e região.
          </p>
          <div className={estilos.acoesCentro}>
            <a
              href={linkWhatsApp(
                empresa.whatsapp,
                "Olá! Gostaria de atendimento sobre imóveis."
              )}
              className="botao botao-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com {empresa.nomeCurto}
            </a>
            <Link href="/contato" className="botao botao-secundario">
              Página de contato
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
