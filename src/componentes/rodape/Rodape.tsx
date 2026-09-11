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
          <p className={estilos.logo}>KALEBE CORRETOR</p>
          <p className={estilos.creci}>{empresa.creci}</p>
          <p className={estilos.texto}>
            Atendimento em {empresa.regiao}. Imóveis prontos e lançamentos com
            orientação de financiamento.
          </p>
        </div>

        <div>
          <h2 className={estilos.titulo}>Navegação</h2>
          <ul className={estilos.lista}>
            <li>
              <Link href="/imoveis">Imóveis</Link>
            </li>
            <li>
              <Link href="/lancamentos">Lançamentos</Link>
            </li>
            <li>
              <Link href="/sobre">Sobre</Link>
            </li>
            <li>
              <Link href="/contato">Contato</Link>
            </li>
            <li>
              <Link href="/favoritos">Favoritos</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={estilos.titulo}>Contato</h2>
          <ul className={estilos.lista}>
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
            <li>
              {empresa.cidade} – {empresa.estado}
            </li>
          </ul>
        </div>
      </div>

      <div className={`conteudo-largo ${estilos.base}`}>
        <p>
          © {ano} {empresa.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
