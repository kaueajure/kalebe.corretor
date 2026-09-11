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
          <h1 className="titulo-secao">Contato</h1>
          <div className="divisor" />
          <p className="texto-secao">
            Envie sua mensagem ou chame diretamente no WhatsApp. Informe cidade,
            faixa de preço e quantidade de quartos para agilizar o atendimento.
          </p>

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

          <p className={estilos.obs}>
            Endereço comercial e horário de atendimento podem ser confirmados no
            primeiro contato.
          </p>
        </div>

        <div className={estilos.formWrap}>
          <h2 className={estilos.formTitulo}>Enviar mensagem</h2>
          <FormularioContato />
        </div>
      </div>
    </div>
  );
}
