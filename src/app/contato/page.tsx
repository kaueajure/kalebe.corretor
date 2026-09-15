import Image from "next/image";
import type { Metadata } from "next";
import { FormularioContato } from "@/componentes/formularioContato/FormularioContato";
import { Icone } from "@/componentes/ui/Icone";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./contato.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com ${empresa.nome} pelo WhatsApp ou telefone. Atendimento em ${empresa.regiao}.`,
  alternates: { canonical: "/contato" },
};

export default function PaginaContato() {
  return (
    <>
      <div className="pagina-interna">
        <div className={`conteudo corpo-pagina ${estilos.grade}`}>
          <div>
            <header className="intro-pagina">
              <p className="rotulo-secao">Atendimento</p>
              <h1 className="titulo-secao">
                Me chama. A gente vê o que cabe na sua busca.
              </h1>
              <p className="texto-secao">
                Visita, financiamento ou anúncio do seu imóvel: o caminho mais
                rápido é o WhatsApp.
              </p>
            </header>

            <div className={estilos.corretor}>
              <Image
                src="/imagens/sobre/kalebe.webp"
                alt="Kalebe"
                width={64}
                height={64}
              />
              <div>
                <strong>Kalebe</strong>
                <span>{empresa.creci}</span>
              </div>
            </div>

            <ul className={estilos.canais}>
              <li>
                <span>Telefone</span>
                <a href={`tel:+${empresa.telefoneLink}`}>{empresa.telefone}</a>
              </li>
              <li>
                <span>WhatsApp</span>
                <a
                  href={linkWhatsApp(empresa.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {empresa.telefone}
                </a>
              </li>
              <li>
                <span>Região</span>
                <strong>
                  {empresa.cidade} – {empresa.estado}
                </strong>
              </li>
              <li>
                <span>Registro</span>
                <strong>{empresa.creci}</strong>
              </li>
            </ul>

            <a
              href={linkWhatsApp(empresa.whatsapp)}
              className={`botao botao-whatsapp ${estilos.whatsappDireto}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icone nome="mensagem" size={18} /> Abrir WhatsApp
            </a>
          </div>

          <div className={estilos.formWrap}>
            <h2 className={estilos.formTitulo}>Escreva o que você procura</h2>
            <p className={estilos.formDescricao}>
              A mensagem abre no WhatsApp. Você confere e envia por lá.
            </p>
            <FormularioContato />
          </div>
        </div>
      </div>

      <section className="faixa-cta">
        <div className="conteudo faixa-cta-interior">
          <div>
            <h2>Quer anunciar um imóvel?</h2>
            <p>
              Me chame com o bairro, o tipo e o valor que você tem em mente.
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
