"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DialogoExclusao } from "./DialogoExclusao";
import estilos from "./acoesImovelLista.module.css";

type Propriedades = {
  id: number;
  titulo: string;
};

export function AcoesImovelLista({ id, titulo }: Propriedades) {
  const router = useRouter();

  async function aoExcluir() {
    const resposta = await fetch(`/painel/imoveis/api/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const resultado = (await resposta.json().catch(() => null)) as {
      mensagem?: string;
    } | null;
    if (!resposta.ok) {
      if (resposta.status === 401) {
        router.push("/login");
        return;
      }
      throw new Error(resultado?.mensagem ?? "Não foi possível excluir o imóvel.");
    }
    router.refresh();
  }

  return (
    <div className={estilos.acoes}>
      <Link
        className="botao botao-secundario"
        href={`/painel/imoveis/${id}/editar`}
        aria-label={`Editar ${titulo}`}
      >
        Editar
      </Link>
      <DialogoExclusao
        titulo="Excluir imóvel"
        nome={titulo}
        descricao="O cadastro e a galeria serão excluídos definitivamente."
        rotuloDoBotao="Excluir"
        aoConfirmar={aoExcluir}
      />
    </div>
  );
}
