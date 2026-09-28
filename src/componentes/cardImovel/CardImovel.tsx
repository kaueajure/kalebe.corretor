import Image from "next/image";
import Link from "next/link";
import type { Imovel } from "@/tipos/imovel";
import {
  formatarArea,
  formatarLocalizacao,
  formatarPreco,
  formatarStatus,
} from "@/lib/formatadores";
import { altImovel } from "@/lib/seo/metadata";
import { FavoritoBotao } from "@/componentes/favoritoBotao/FavoritoBotao";
import estilos from "./cardImovel.module.css";

interface Props {
  imovel: Imovel;
  prioridade?: boolean;
}

export function CardImovel({ imovel, prioridade = false }: Props) {
  const foto = imovel.midias.find((midia) => midia.tipo === "imagem");
  const localizacao = formatarLocalizacao(
    imovel.bairro,
    imovel.cidade,
    imovel.estado,
  );

  return (
    <article className={estilos.card}>
      <Link href={`/imoveis/${imovel.slug}`} className={estilos.link}>
        <div className={estilos.midia}>
          {foto ? (
            <Image
              src={foto.url}
              alt={altImovel(imovel, foto.descricao)}
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 980px) 50vw, 33vw"
              className={estilos.foto}
              priority={prioridade}
            />
          ) : (
            <div className={estilos.semFoto}>Foto indisponível</div>
          )}
          {imovel.status !== "disponivel" ? (
            <span className={estilos.status}>
              {formatarStatus(imovel.status)}
            </span>
          ) : null}
        </div>

        <div className={estilos.corpo}>
          <p className={estilos.preco}>
            {imovel.preco != null ? formatarPreco(imovel.preco) : "Valor sob consulta"}
          </p>
          {imovel.precoAnterior ? (
            <p className={estilos.precoAnterior}>
              {formatarPreco(imovel.precoAnterior)}
            </p>
          ) : null}
          <h3 className={estilos.titulo}>{imovel.titulo}</h3>
          {localizacao ? <p className={estilos.local}>{localizacao}</p> : null}

          {[imovel.quartos, imovel.banheiros, imovel.vagas, imovel.area].some(
            (valor) => valor != null,
          ) ? (
            <ul className={estilos.specs} aria-label="Características">
              {imovel.quartos != null ? (
                <li>
                  <strong>{imovel.quartos}</strong> quartos
                </li>
              ) : null}
              {imovel.banheiros != null ? (
                <li>
                  <strong>{imovel.banheiros}</strong> banheiros
                </li>
              ) : null}
              {imovel.vagas != null ? (
                <li>
                  <strong>{imovel.vagas}</strong> vagas
                </li>
              ) : null}
              {imovel.area != null ? (
                <li>
                  <strong>{formatarArea(imovel.area)}</strong>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </Link>

      <div className={estilos.acaoFavorito}>
        <FavoritoBotao id={imovel.id} titulo={imovel.titulo} />
      </div>
    </article>
  );
}
