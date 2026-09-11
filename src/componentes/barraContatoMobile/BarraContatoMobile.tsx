import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./barraContatoMobile.module.css";

interface Props {
  mensagem?: string;
}

export function BarraContatoMobile({ mensagem }: Props) {
  return (
    <div className={estilos.barra}>
      <a
        href={`tel:+${empresa.telefoneLink}`}
        className={estilos.ligar}
      >
        Ligar
      </a>
      <a
        href={linkWhatsApp(empresa.whatsapp, mensagem)}
        className={estilos.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>
    </div>
  );
}
