import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarraContatoMobile } from "@/componentes/barraContatoMobile/BarraContatoMobile";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import {
  empreendimentos,
  obterEmpreendimentoPorSlug,
} from "@/dados/lancamentos";
import { formatarArea, formatarPreco, linkWhatsApp } from "@/lib/formatadores";
import estilos from "./detalhe.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return empreendimentos.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = obterEmpreendimentoPorSlug(slug);
  if (!item) return { title: "Empreendimento não encontrado" };
  return {
    title: item.nome,
    description: `${item.nome} em ${item.cidade}. A partir de ${formatarPreco(item.precoApartir)}.`,
  };
}

export default async function PaginaDetalheLancamento({ params }: Props) {
  const { slug } = await params;
  const item = obterEmpreendimentoPorSlug(slug);
  if (!item) notFound();

  const mensagem = `Olá! Tenho interesse no lançamento ${item.nome}.`;

  return (
    <>
      <article className={estilos.pagina}>
        <div className="conteudo">
          <nav className="migalha" aria-label="Breadcrumb">
            <Link href="/">Início</Link>
            <span>/</span>
            <Link href="/lancamentos">Lançamentos</Link>
            <span>/</span>
            <span>{item.nome}</span>
          </nav>

          <header className={estilos.capa}>
            <p className="rotulo-secao">
              {item.tipo === "casa" ? "Casa" : "Apartamento"}
              {item.mcmv ? " · Minha Casa Minha Vida" : ""}
            </p>
            <h1 className={estilos.titulo}>{item.nome}</h1>
            <p className={estilos.local}>
              {item.bairro} · {item.cidade}/{item.estado}
            </p>
          </header>

          <div className={estilos.grade}>
            <div>
              <section className={estilos.bloco}>
                <h2>Sobre o empreendimento</h2>
                <p>{item.descricao}</p>
              </section>

              <section className={estilos.bloco}>
                <h2>Informações</h2>
                <ul className={estilos.lista}>
                  {item.area != null ? (
                    <li>
                      <span>Área</span>
                      <strong>{formatarArea(item.area)}</strong>
                    </li>
                  ) : null}
                  {item.quartos != null ? (
                    <li>
                      <span>Dormitórios</span>
                      <strong>{item.quartos}</strong>
                    </li>
                  ) : null}
                  {item.entrega ? (
                    <li>
                      <span>Entrega prevista</span>
                      <strong>{item.entrega}</strong>
                    </li>
                  ) : null}
                  {item.detalhesExtras?.map((extra) => (
                    <li key={extra}>
                      <span>Detalhe</span>
                      <strong>{extra}</strong>
                    </li>
                  ))}
                </ul>
              </section>

              {item.caracteristicas.length > 0 ? (
                <section className={estilos.bloco}>
                  <h2>Características</h2>
                  <ul className={estilos.chips}>
                    {item.caracteristicas.map((c) => (
                      <li key={c} className="pill">
                        {c}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {item.fotos.length === 0 ? (
                <p className={estilos.obs}>
                  Fotos e plantas adicionais são enviadas no atendimento.
                </p>
              ) : null}
            </div>

            <aside className={estilos.caixa}>
              <p className={estilos.rotulo}>A partir de</p>
              <p className={estilos.preco}>
                {formatarPreco(item.precoApartir)}
              </p>
              <div className={estilos.acoes}>
                <a
                  href={linkWhatsApp(empresa.whatsapp, mensagem)}
                  className="botao botao-whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar no WhatsApp
                </a>
                <a
                  href={`tel:+${empresa.telefoneLink}`}
                  className="botao botao-secundario"
                >
                  Ligar
                </a>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="faixa-cta">
        <div className="conteudo faixa-cta-interior">
          <div>
            <h2>Quer conhecer outros lançamentos?</h2>
            <p>
              Veja casas e apartamentos na planta em Rio Preto e região.
            </p>
          </div>
          <Link href="/lancamentos" className="botao botao-secundario">
            Ver lançamentos <Icone nome="seta" size={18} />
          </Link>
        </div>
      </section>

      <BarraContatoMobile mensagem={mensagem} />
      <div className={estilos.espacoMobile} />
    </>
  );
}
