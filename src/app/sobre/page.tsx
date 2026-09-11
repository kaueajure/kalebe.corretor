import type { Metadata } from "next";
import Image from "next/image";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./sobre.module.css";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Conheça ${empresa.nome}, ${empresa.creci}, corretor em ${empresa.regiao}.`,
};

export default function PaginaSobre() {
  return (
    <div className={estilos.pagina}>
      <div className={`conteudo ${estilos.grade}`}>
        <div className={estilos.fotoWrap}>
          <Image
            src="/imagens/sobre/kalebe.webp"
            alt={empresa.nome}
            fill
            sizes="(max-width: 900px) 100vw, 480px"
            className={estilos.foto}
            priority
          />
        </div>

        <div>
          <p className="rotulo-secao">Institucional</p>
          <h1 className="titulo-secao">
            {empresa.nomeCurto}, corretor em{" "}
            <span className="destaque">Rio Preto e região</span>
          </h1>
          <div className="divisor" />
          <p className={estilos.creciLinha}>{empresa.creci}</p>
          <p className={estilos.texto}>{empresa.sobre}</p>

          <ul className={estilos.lista}>
            <li>Imóveis prontos e lançamentos</li>
            <li>Orientação em financiamento habitacional e MCMV</li>
            <li>
              Atendimento em {empresa.cidadesAtendimento.join(", ")} e região
            </li>
            <li>Registro profissional ativo</li>
          </ul>

          <a
            href={linkWhatsApp(empresa.whatsapp)}
            className="botao botao-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
