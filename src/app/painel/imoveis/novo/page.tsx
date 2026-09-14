import Link from "next/link";
import { FormularioImovel } from "@/componentes/painel/FormularioImovel";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import estilos from "../imoveis.module.css";
import estilosForm from "./novo.module.css";

export default async function PaginaNovoImovel() {
  await exigirSessaoPainel();

  return (
    <main className={estilos.principal}>
      <header className={estilosForm.cabecalho}>
        <div>
          <Link className={estilosForm.voltar} href="/painel/imoveis">
            ← Voltar para imóveis
          </Link>
          <h1>Adicionar imóvel</h1>
          <p>Preencha as informações e envie os arquivos do novo imóvel.</p>
        </div>
      </header>
      <FormularioImovel />
    </main>
  );
}
