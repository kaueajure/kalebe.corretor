import Link from "next/link";
import { regioes } from "@/dados/empresa";
import estilos from "./listaRegioes.module.css";

export function ListaRegioes() {
  return (
    <ul className={estilos.lista}>
      {regioes.map((regiao) => (
        <li key={regiao.slug}>
          <Link
            href={
              "bairro" in regiao && regiao.bairro
                ? `/imoveis?bairro=${encodeURIComponent(regiao.nome)}`
                : `/imoveis?cidade=${encodeURIComponent(regiao.nome)}`
            }
          >
            {regiao.nome}
          </Link>
        </li>
      ))}
    </ul>
  );
}
