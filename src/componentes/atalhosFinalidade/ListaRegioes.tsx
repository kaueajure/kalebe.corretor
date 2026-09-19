import Link from "next/link";
import { regioes } from "@/dados/empresa";
import estilos from "./listaRegioes.module.css";

export function ListaRegioes() {
  return (
    <ul className={estilos.lista}>
      {regioes.map((regiao) => (
        <li key={regiao.slug}>
          <Link href={regiao.href}>{regiao.nome}</Link>
        </li>
      ))}
    </ul>
  );
}
