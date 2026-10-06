import Link from "next/link";
import { listarCidades } from "@/dados/imoveis";
import { caminhoCidade } from "@/lib/seo/metadata";
import { criarSlug } from "@/lib/seo/slug";
import estilos from "./listaRegioes.module.css";

export async function ListaRegioes() {
  const cidades = await listarCidades();
  return (
    <ul className={estilos.lista}>
      {cidades.map((cidade) => (
        <li key={cidade}>
          <Link href={caminhoCidade(criarSlug(cidade))}>{cidade}</Link>
        </li>
      ))}
    </ul>
  );
}
