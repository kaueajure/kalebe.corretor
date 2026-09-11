import Link from "next/link";
import type { Empreendimento } from "@/tipos/imovel";
import { formatarPreco, formatarArea } from "@/lib/formatadores";
import estilos from "./cardEmpreendimento.module.css";

export function CardEmpreendimento({
  empreendimento,
}: {
  empreendimento: Empreendimento;
}) {
  return (
    <article className={estilos.card}>
      <Link href={`/lancamentos/${empreendimento.slug}`}>
        <div className={estilos.topo}>
          <span className={estilos.tipo}>
            {empreendimento.tipo === "casa" ? "Casa" : "Apartamento"}
          </span>
          {empreendimento.mcmv ? <span className={estilos.mcmv}>MCMV</span> : null}
        </div>
        <h3 className={estilos.nome}>{empreendimento.nome}</h3>
        <p className={estilos.local}>
          {empreendimento.bairro} · {empreendimento.cidade}/{empreendimento.estado}
        </p>
        <p className={estilos.rotulo}>A partir de</p>
        <p className={estilos.preco}>
          {formatarPreco(empreendimento.precoApartir)}
        </p>
        <ul className={estilos.detalhes}>
          {empreendimento.area != null ? (
            <li>{formatarArea(empreendimento.area)}</li>
          ) : null}
          {empreendimento.quartos != null ? (
            <li>{empreendimento.quartos} dorm.</li>
          ) : null}
          {empreendimento.entrega ? <li>{empreendimento.entrega}</li> : null}
          {empreendimento.detalhesExtras?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Link>
    </article>
  );
}
