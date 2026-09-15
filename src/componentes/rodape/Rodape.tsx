import Link from "next/link";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
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
              <Link href="/imoveis?tipo=casa">Casas</Link>
            </li>
            <li>
              <Link href="/imoveis?tipo=apartamento">
                Apartamentos
              </Link>
            </li>
            <li>
              <Link href="/favoritos">Favoritos</Link>
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
        <Link href="/login">Área do corretor</Link>
      </div>
    </footer>
  );
}
