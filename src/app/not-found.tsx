import Link from "next/link";
import estilos from "./nao-encontrado.module.css";

export default function NaoEncontrado() {
  return (
    <div className={estilos.pagina}>
      <div className="conteudo mensagem-estado">
        <h1>Página não encontrada</h1>
        <p>O endereço acessado não existe ou o imóvel foi removido.</p>
        <div className={estilos.acoes}>
          <Link href="/" className="botao botao-primario">
            Ir ao início
          </Link>
          <Link href="/imoveis" className="botao botao-secundario">
            Ver imóveis
          </Link>
        </div>
      </div>
    </div>
  );
}
