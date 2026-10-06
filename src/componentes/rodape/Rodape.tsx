import Link from "next/link";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import { caminhoCidade } from "@/lib/seo/metadata";
import { listarCidades, listarTipos } from "@/dados/imoveis";
import { obterTipoSeoPorTipo } from "@/dados/seo";
import { criarSlug } from "@/lib/seo/slug";
import type { TipoImovel } from "@/tipos/imovel";
import estilos from "./rodape.module.css";

export async function Rodape() {
  const ano = new Date().getFullYear();
  let cidades: string[] = [];
  let tipos: TipoImovel[] = [];
  try {
    [cidades, tipos] = await Promise.all([listarCidades(), listarTipos()]);
  } catch {
    // O rodapé não deve impedir acesso ao login/manutenção se o banco falhar.
    console.error("Não foi possível carregar as localidades do rodapé.");
  }

  return (
    <footer className={estilos.rodape}>
      <div className={`conteudo-largo ${estilos.grade}`}>
        <div>
          <p className={estilos.logo}>Kalebe</p>
          <p className={estilos.creci}>{empresa.creci}</p>
          <p className={estilos.texto}>
            Imóveis à venda. Atendimento direto com o corretor.
          </p>
        </div>

        <div>
          <h2 className={estilos.titulo}>Buscar</h2>
          <ul className={estilos.lista}>
            <li>
              <Link href="/imoveis">Imóveis à venda</Link>
            </li>
            {tipos.map((tipo) => (
              <li key={tipo}>
                <Link href={`/imoveis?tipo=${tipo}`}>{obterTipoSeoPorTipo(tipo).plural}</Link>
              </li>
            ))}
            <li>
              <Link href="/favoritos">Favoritos</Link>
            </li>
          </ul>
        </div>

        {cidades.length > 0 ? (
          <div>
            <h2 className={estilos.titulo}>Localidades</h2>
            <ul className={estilos.lista}>
              {cidades.map((cidade) => (
                <li key={cidade}>
                  <Link href={caminhoCidade(criarSlug(cidade))}>Imóveis em {cidade}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
