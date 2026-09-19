import Link from "next/link";
import type { ItemBreadcrumb } from "@/lib/seo/dados-estruturados";

interface Props {
  itens: ItemBreadcrumb[];
}

export function Breadcrumbs({ itens }: Props) {
  return (
    <nav className="migalha" aria-label="Breadcrumb">
      {itens.map((item, indice) => {
        const ultimo = indice === itens.length - 1;
        return (
          <span key={`${item.nome}-${indice}`} style={{ display: "contents" }}>
            {indice > 0 ? <span>/</span> : null}
            {item.url && !ultimo ? (
              <Link href={item.url}>{item.nome}</Link>
            ) : (
              <span>{item.nome}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
