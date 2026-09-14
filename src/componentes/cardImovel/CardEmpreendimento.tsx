import Image from "next/image";
import Link from "next/link";
import type { Empreendimento } from "@/tipos/imovel";
import { formatarPreco, formatarArea } from "@/lib/formatadores";
import { Icone } from "@/componentes/ui/Icone";
import estilos from "./cardEmpreendimento.module.css";

export function CardEmpreendimento({
  empreendimento: item,
}: {
  empreendimento: Empreendimento;
}) {
  const foto = item.fotos[0];

  return (
    <article className={estilos.card}>
      <Link href={`/lancamentos/${item.slug}`} className={estilos.link}>
        <div className={estilos.midia}>
          {foto ? (
            <Image
              src={foto}
              alt={item.nome}
              fill
              sizes="(max-width: 700px) 100vw, 400px"
            />
          ) : (
            <div className={estilos.placeholder}>
              <Icone nome={item.tipo === "casa" ? "casa" : "predio"} size={28} />
              <span>{item.cidade}</span>
            </div>
          )}
        </div>
        <div className={estilos.conteudo}>
          <div className={estilos.topo}>
            <span className={estilos.tipo}>
              {item.tipo === "casa" ? "Casas" : "Apartamentos"}
            </span>
            {item.mcmv ? <span className={estilos.mcmv}>MCMV</span> : null}
          </div>
          <h3 className={estilos.nome}>{item.nome}</h3>
          <p className={estilos.local}>
            {item.bairro} · {item.cidade}
          </p>
          <div className={estilos.base}>
            <div>
              <p className={estilos.rotulo}>A partir de</p>
              <p className={estilos.preco}>{formatarPreco(item.precoApartir)}</p>
            </div>
            <Icone nome="seta" size={18} />
          </div>
          <ul className={estilos.detalhes}>
            {item.area != null ? <li>{formatarArea(item.area)}</li> : null}
            {item.quartos != null ? <li>{item.quartos} quartos</li> : null}
            {item.entrega ? <li>Entrega {item.entrega}</li> : null}
          </ul>
        </div>
      </Link>
    </article>
  );
}
