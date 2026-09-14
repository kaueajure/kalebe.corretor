import { z } from "zod";

export const tiposDoImovel = [
  "CASA",
  "APARTAMENTO",
  "TERRENO",
  "COMERCIAL",
  "SOBRADO",
] as const;
export const situacoesDoImovel = ["RASCUNHO", "PUBLICADO"] as const;
export const disponibilidadesDoImovel = [
  "DISPONIVEL",
  "RESERVADO",
  "EM_NEGOCIACAO",
  "VENDIDO",
  "INDISPONIVEL",
] as const;

export const esquemaDosMetadadosDasMidias = z
  .array(
    z.object({
      id: z.number().int().positive().optional(),
      descricao: z.string().trim().max(300).nullable(),
      classificacao: z.enum(["IMAGEM", "PLANTA"]),
      principal: z.boolean(),
      ordem: z.number().int().min(0).max(1_000),
    }),
  )
  .max(60);

function textoOpcional(maximo: number, mensagem: string) {
  return z.preprocess(
    (valor) => (typeof valor === "string" && valor.trim() ? valor.trim() : null),
    z.string().max(maximo, mensagem).nullable(),
  );
}

function numeroOpcional(rotulo: string, maximo: number) {
  return z.preprocess(
    (valor) => (typeof valor === "string" && valor.trim() ? Number(valor) : null),
    z
      .number({ error: `${rotulo} deve ser um número válido.` })
      .finite(`${rotulo} deve ser um número válido.`)
      .min(0, `${rotulo} não pode ser negativo.`)
      .max(maximo, `${rotulo} está acima do limite permitido.`)
      .nullable(),
  );
}

function inteiroOpcional(rotulo: string, maximo: number) {
  return numeroOpcional(rotulo, maximo).refine(
    (valor) => valor === null || Number.isInteger(valor),
    `${rotulo} deve ser um número inteiro.`,
  );
}

const respostaOpcional = z.enum(["", "SIM", "NAO"]).transform((valor) =>
  valor === "" ? null : valor === "SIM",
);

const idOpcional = z.preprocess(
  (valor) => (typeof valor === "string" && valor.trim() ? Number(valor) : null),
  z
    .number({ error: "Selecione um lançamento válido." })
    .int()
    .positive()
    .nullable(),
);

export const esquemaDoCadastroDeImovel = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(3, "Informe um título com pelo menos 3 caracteres.")
      .max(220, "O título pode ter no máximo 220 caracteres."),
    descricao: textoOpcional(20_000, "A descrição pode ter no máximo 20.000 caracteres."),
    tipo: z.enum(tiposDoImovel, { error: "Selecione um tipo de imóvel válido." }),
    subtipo: textoOpcional(80, "O subtipo pode ter no máximo 80 caracteres."),
    lancamentoId: idOpcional,
    situacao: z.enum(situacoesDoImovel, {
      error: "Selecione uma ação de publicação válida.",
    }),
    disponibilidade: z.enum(disponibilidadesDoImovel, {
      error: "Selecione uma disponibilidade válida.",
    }),

    valorVenda: numeroOpcional("O valor de venda", 999_999_999_999.99),
    valorCondominio: numeroOpcional("O valor do condomínio", 99_999_999_999.99),
    valorIptu: numeroOpcional("O valor do IPTU", 99_999_999_999.99),
    periodicidadeIptu: z
      .enum(["", "MENSAL", "ANUAL"])
      .transform((valor) => valor || null),
    valorOutrasDespesas: numeroOpcional(
      "O valor das outras despesas",
      99_999_999_999.99,
    ),
    condominioIsento: z.boolean(),
    iptuIsento: z.boolean(),
    aceitaFinanciamento: respostaOpcional,
    aceitaPermuta: respostaOpcional,

    quartos: inteiroOpcional("A quantidade de quartos", 100),
    suites: inteiroOpcional("A quantidade de suítes", 100),
    banheiros: inteiroOpcional("A quantidade de banheiros", 100),
    vagas: inteiroOpcional("A quantidade de vagas", 100),
    areaTerreno: numeroOpcional("A área do terreno", 99_999_999.99),
    areaUtil: numeroOpcional("A área útil", 99_999_999.99),
    areaConstruida: numeroOpcional("A área construída", 99_999_999.99),
    unidadeAreaTerreno: z.enum(["M2", "HECTARE"]),
    frenteTerreno: numeroOpcional("A frente do terreno", 99_999_999.99),
    fundosTerreno: numeroOpcional("O fundo do terreno", 99_999_999.99),
    topografia: z
      .enum(["", "PLANO", "ACLIVE", "DECLIVE", "IRREGULAR"])
      .transform((valor) => valor || null),
    andar: inteiroOpcional("O andar", 1_000),
    unidade: textoOpcional(30, "A unidade pode ter no máximo 30 caracteres."),
    totalAndares: inteiroOpcional("O total de andares", 1_000),
    elevador: respostaOpcional,
    peDireito: numeroOpcional("O pé-direito", 9_999.99),

    cep: textoOpcional(10, "O CEP pode ter no máximo 10 caracteres."),
    estado: textoOpcional(2, "Use a sigla do estado com 2 caracteres."),
    cidade: textoOpcional(160, "A cidade pode ter no máximo 160 caracteres."),
    bairro: textoOpcional(160, "O bairro pode ter no máximo 160 caracteres."),
    logradouro: textoOpcional(220, "O logradouro pode ter no máximo 220 caracteres."),
    numero: textoOpcional(30, "O número pode ter no máximo 30 caracteres."),
    complemento: textoOpcional(120, "O complemento pode ter no máximo 120 caracteres."),
    nomeCondominio: textoOpcional(180, "O condomínio pode ter no máximo 180 caracteres."),
    pontoReferencia: textoOpcional(
      180,
      "O ponto de referência pode ter no máximo 180 caracteres.",
    ),
    exibirEnderecoExato: z.boolean(),
    destaque: z.boolean(),

    caracteristicas: textoOpcional(
      4_000,
      "A lista de características está muito extensa.",
    ),
    recursosAdicionais: z.array(z.string().trim().min(1).max(120)).max(30),
  })
  .superRefine((dados, contexto) => {
    if (dados.situacao !== "PUBLICADO") return;

    if (!dados.valorVenda) {
      contexto.addIssue({
        code: "custom",
        path: ["valorVenda"],
        message: "Informe o valor de venda antes de publicar.",
      });
    }
    if (!dados.cidade && !dados.bairro && !dados.nomeCondominio) {
      contexto.addIssue({
        code: "custom",
        path: ["cidade"],
        message:
          "Informe ao menos cidade, bairro ou condomínio antes de publicar.",
      });
    }
    if (dados.exibirEnderecoExato && !dados.logradouro) {
      contexto.addIssue({
        code: "custom",
        path: ["logradouro"],
        message: "Informe o logradouro para exibir o endereço exato.",
      });
    }
  });

export type DadosValidadosDoImovel = z.infer<typeof esquemaDoCadastroDeImovel>;

export function separarCaracteristicas(
  valor: string | null,
  adicionais: string[] = [],
) {
  const nomes = [...(valor?.split(",") ?? []), ...adicionais]
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const unicas = new Map<string, string>();

  for (const nome of nomes) {
    if (nome.length > 120) {
      throw new Error("Cada característica pode ter no máximo 120 caracteres.");
    }
    unicas.set(nome.toLocaleLowerCase("pt-BR"), nome);
  }
  if (unicas.size > 50) throw new Error("Informe no máximo 50 características.");
  return [...unicas.values()];
}
