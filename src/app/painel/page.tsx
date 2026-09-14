import Link from "next/link";
import estilos from "./painel.module.css";

export default function PaginaPainel() {
  return (
    <div className={estilos.inicio}>
      <h1>Painel</h1>
      <p>Gerencie o catálogo de imóveis publicados no site.</p>
      <Link href="/painel/imoveis" className="botao botao-primario">
        Ir para imóveis
      </Link>
    </div>
  );
}
