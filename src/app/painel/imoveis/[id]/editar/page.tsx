import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioImovel } from "@/componentes/painel/FormularioImovel";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { obterImovelParaEdicao } from "@/lib/imoveis/repositorio";
import estilos from "../../imoveis.module.css";
import estilosForm from "../../novo/novo.module.css";

const RECURSOS_SUGERIDOS: Record<string, string[]> = {
  CASA: ["Piscina", "Área gourmet", "Quintal", "Lavanderia", "Escritório"],
  APARTAMENTO: ["Varanda", "Portaria", "Academia", "Piscina", "Salão de festas"],
  TERRENO: ["Terreno de esquina", "Murado", "Infraestrutura instalada"],
  COMERCIAL: [
    "Recepção",
    "Copa",
    "Ar-condicionado",
    "Acesso para carga",
    "Estacionamento",
  ],
  SOBRADO: ["Piscina", "Área gourmet", "Quintal", "Lavanderia", "Escritório"],
};

function prepararValoresParaEdicao(
  valores: Record<string, string | boolean | string[]>,
) {
  const tipo = String(valores.tipo ?? "CASA");
  const sugestoes = RECURSOS_SUGERIDOS[tipo] ?? [];
  const nomes = String(valores.caracteristicas ?? "")
    .split(",")
    .map((nome) => nome.trim())
    .filter(Boolean);
  const recursosAdicionais: string[] = [];
  const outras: string[] = [];

  for (const nome of nomes) {
    const sugestao = sugestoes.find(
      (item) =>
        item.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR"),
    );
    if (sugestao) recursosAdicionais.push(sugestao);
    else outras.push(nome);
  }

  return { ...valores, recursosAdicionais, caracteristicas: outras.join(", ") };
}

type PropriedadesDaPagina = {
  params: Promise<{ id: string }>;
};

export default async function PaginaEditarImovel({
  params,
}: PropriedadesDaPagina) {
  await exigirSessaoPainel();
  const { id: idTexto } = await params;
  const id = Number(idTexto);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const imovel = await obterImovelParaEdicao(id);
  if (!imovel) notFound();

  return (
    <main className={estilos.principal}>
      <header className={estilosForm.cabecalho}>
        <div>
          <Link className={estilosForm.voltar} href="/painel/imoveis">
            ← Voltar para imóveis
          </Link>
          <h1>Editar imóvel</h1>
          <p>Atualize as informações de {imovel.codigo}.</p>
        </div>
      </header>
      <FormularioImovel
        modo="editar"
        imovelId={imovel.id}
        codigo={imovel.codigo}
        situacaoAtual={imovel.situacao}
        valoresIniciais={prepararValoresParaEdicao(imovel.valores)}
        midiasIniciais={imovel.midias}
      />
    </main>
  );
}
