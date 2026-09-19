import Link from "next/link";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import {
  caminhoCidade,
  caminhoCidadeTipo,
} from "@/lib/seo/metadata";
import estilos from "./rodape.module.css";

export function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className={estilos.rodape}>
      <div className={`conteudo-largo ${estilos.grade}`}>
        <div>
          <p className={estilos.logo}>Kalebe</p>
          <p className={estilos.creci}>{empresa.creci}</p>
          <p className={estilos.texto}>
            Imóveis em São José do Rio Preto, Mirassol e Bady Bassitt.
            Atendimento direto com o corretor.
          </p>
        </div>

        <div>
          <h2 className={estilos.titulo}>Buscar</h2>
          <ul className={estilos.lista}>
            <li>
              <Link href="/imoveis">Imóveis à venda</Link>
            </li>
            <li>
              <Link href={caminhoCidadeTipo("sao-jose-do-rio-preto", "casas")}>
                Casas
              </Link>
            </li>
            <li>
              <Link
                href={caminhoCidadeTipo("sao-jose-do-rio-preto", "apartamentos")}
              >
                Apartamentos
              </Link>
            </li>
            <li>
              <Link href="/favoritos">Favoritos</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={estilos.titulo}>Localidades</h2>
          <ul className={estilos.lista}>
            <li>
              <Link href={caminhoCidade("sao-jose-do-rio-preto")}>
                Imóveis em Rio Preto
              </Link>
            </li>
            <li>
              <Link href={caminhoCidade("mirassol")}>Imóveis em Mirassol</Link>
            </li>
            <li>
              <Link href={caminhoCidade("bady-bassitt")}>
                Imóveis em Bady Bassitt
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={estilos.titulo}>Kalebe</h2>
          <ul className={estilos.lista}>
            <li>
              <Link href="/sobre">O corretor</Link>
            </li>
            <li>
              <Link href="/contato">Contato</Link>
            </li>
            <li>
              <a href={`tel:+${empresa.telefoneLink}`}>{empresa.telefone}</a>
            </li>
            <li>
              <a
                href={linkWhatsApp(empresa.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={`conteudo-largo ${estilos.base}`}>
        <p>
          © {ano} {empresa.nome}. Todos os direitos reservados.
        </p>
        <p>
          Desenvolvido por{" "}
          <a
            className={estilos.desenvolvedor}
            href="https://kaueajure.website"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kauê Ajure
          </a>
        </p>
      </div>
    </footer>
  );
}
