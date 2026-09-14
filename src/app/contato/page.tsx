import Image from "next/image";
import type { Metadata } from "next";
import { FormularioContato } from "@/componentes/formularioContato/FormularioContato";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./contato.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com ${empresa.nome} pelo WhatsApp ou telefone. Atendimento em ${empresa.regiao}.`,
};

export default function PaginaContato() {
  return (
    <div className={estilos.pagina}>
      <div className={`conteudo ${estilos.grade}`}>
        <div>
          <p className="rotulo-secao">Atendimento</p>
          <h1 className="titulo-secao">
            Me chama. A gente vê o que cabe na sua busca.
          </h1>
          <p className="texto-secao">
            Visita, financiamento ou anúncio do seu imóvel: o caminho mais
            rápido é o WhatsApp.
          </p>

          <div className={estilos.corretor}>
            <Image
              src="/imagens/sobre/kalebe.webp"
              alt="Kalebe"
              width={56}
              height={56}
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
  );
}
