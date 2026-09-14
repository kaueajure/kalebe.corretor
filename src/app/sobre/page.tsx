import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import { Icone } from "@/componentes/ui/Icone";
import estilos from "./sobre.module.css";

export const metadata: Metadata = {
  title: "O corretor",
  description: `Conheça ${empresa.nome}, ${empresa.creci}, corretor em ${empresa.regiao}.`,
};

const etapas = [
  {
    nome: "mensagem" as const,
    titulo: "Você me conta o que procura",
    texto: "Cidade, tipo de imóvel e quanto pretende investir. Se ainda não souber, a gente afunila juntos.",
  },
  {
    nome: "casa" as const,
    titulo: "Eu te mostro as opções",
    texto: "Fotos, dúvidas e visita nas que fizerem sentido — sem empurrar o que não cabe no seu momento.",
  },
  {
    nome: "chave" as const,
    titulo: "A gente avança na compra",
    texto: "Negociação, orientação de financiamento e os próximos passos até fechar.",
  },
];

export default function PaginaSobre() {
  return (
    <div className={estilos.pagina}>
      <div className="conteudo">
        <div className={estilos.grade}>
          <div className={estilos.fotoWrap}>
            <Image
              src="/imagens/sobre/kalebe.webp"
              alt="Kalebe, corretor de imóveis"
              fill
              sizes="(max-width: 760px) 100vw, 480px"
              className={estilos.foto}
              priority
            />
          </div>
          <div>
            <p className="rotulo-secao">CRECI-SP 322829 F</p>
            <h1 className="titulo-secao">
              Trabalho com quem quer morar em Rio Preto e região.
            </h1>
            <p className={estilos.texto}>{empresa.sobre}</p>
            <p className={estilos.texto}>
              Comprar imóvel tem muita decisão no meio. Meu papel é filtrar o que
              vale visita e acompanhar você até a negociação.
            </p>
            <a
              href={linkWhatsApp(empresa.whatsapp)}
              className="botao botao-primario"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icone nome="mensagem" size={18} /> Falar comigo no WhatsApp
            </a>
          </div>
        </div>

        <section className={estilos.processo}>
          <h2 className="titulo-secao">Como costuma ser o atendimento</h2>
          <div className={estilos.etapas}>
            {etapas.map((etapa, indice) => (
              <div key={etapa.titulo}>
                <span>{String(indice + 1).padStart(2, "0")}</span>
                <Icone nome={etapa.nome} size={26} />
                <h3>{etapa.titulo}</h3>
                <p>{etapa.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <div className={estilos.regiao}>
          <div>
            <h2>São José do Rio Preto, Mirassol e Bady Bassitt</h2>
            <p>Imóveis prontos e lançamentos, inclusive Minha Casa Minha Vida.</p>
          </div>
          <Link href="/imoveis" className="link-seta">
            Ver imóveis <Icone nome="seta" />
          </Link>
        </div>
      </div>
    </div>
  );
}
