const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Usa o TypeScript já instalado e permite testar os repositórios com banco simulado.
// Nenhuma conexão ou gravação é feita no banco real durante estes testes.
function carregarTs(arquivo, mocks = {}, cache = new Map()) {
  const absoluto = path.resolve(__dirname, "..", arquivo);
  if (cache.has(absoluto)) return cache.get(absoluto).exports;
  const modulo = { exports: {} };
  cache.set(absoluto, modulo);
  const codigo = ts.transpileModule(readFileSync(absoluto, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: absoluto,
  }).outputText;
  const importar = (nome) => {
    if (Object.hasOwn(mocks, nome)) return mocks[nome];
    if (nome === "server-only") return {};
    if (nome.endsWith(".css")) return {};
    if (nome.startsWith("@/")) {
      const base = `src/${nome.slice(2)}`;
      return carregarTs(existsSync(path.resolve(__dirname, "..", `${base}.ts`)) ? `${base}.ts` : `${base}.tsx`, mocks, cache);
    }
    return require(nome);
  };
  new Function("require", "module", "exports", codigo)(importar, modulo, modulo.exports);
  return modulo.exports;
}

const locais = carregarTs("src/lib/localizacoes.ts");
const { obterOpcoesFiltros } = carregarTs("src/lib/imoveis/opcoes-filtros.ts");
const { filtrarImoveis, filtroInicial } = carregarTs("src/lib/formatadores.ts");

function imovel(id, cidade, bairro = "Jardim São José", ajustes = {}) {
  return {
    id: String(id), codigo: `KAL-${id}`, slug: `imovel-${id}`, titulo: "Casa à venda", tipo: "casa",
    status: "disponivel", cidade, bairro, estado: "SP", nomeCondominio: "Residencial São João",
    preco: 350000, quartos: 2, banheiros: 1, vagas: 2, area: 80, descricao: "Próximo à praça",
    midias: [], caracteristicas: [], criadoEm: "2026-10-01T00:00:00.000Z", atualizadoEm: "2026-10-02T00:00:00.000Z",
    ...ajustes,
  };
}

test("acentos, caixa, Unicode e espaços identificam o mesmo local sem fundir cidades diferentes", () => {
  for (const nome of ["sao jose do rio preto", "SÃO JOSÉ DO RIO PRETO", " São  José do Rio Preto ", "São José do Rio Preto".normalize("NFD")]) {
    assert.equal(locais.mesmoLocal(nome, "São José do Rio Preto"), true);
  }
  assert.equal(locais.mesmoLocal("São José do Rio Preto", "São José dos Campos"), false);
  assert.deepEqual(locais.nomesLocaisUnicos(["sao jose do rio preto", "SÃO JOSÉ DO RIO PRETO", "São José do Rio Preto", " ", null]), ["São José do Rio Preto"]);
  assert.deepEqual(locais.nomesLocaisUnicos(["cidade nova"]), ["Cidade Nova"]);
});

test("opções surgem e desaparecem com os anúncios e todos os selects usam valores cadastrados", () => {
  const lista = [imovel(1, "São José do Rio Preto"), imovel(2, "sao jose do rio preto", "jardim sao jose"), imovel(3, "Mirassol", "Centro", { tipo: "terreno", quartos: 0, banheiros: null, vagas: 0, preco: 125000 })];
  assert.deepEqual(obterOpcoesFiltros(lista), {
    cidades: ["Mirassol", "São José do Rio Preto"], bairros: ["Centro", "Jardim São José"],
    tipos: ["casa", "terreno"], precos: [125000, 350000], quartos: [2], banheiros: [1], vagas: [2],
  });
  assert.deepEqual(obterOpcoesFiltros(lista.slice(0, 2)).cidades, ["São José do Rio Preto"]);
  assert.deepEqual(obterOpcoesFiltros([]), { cidades: [], bairros: [], tipos: [], precos: [], quartos: [], banheiros: [], vagas: [] });
});

test("filtros e busca livre encontram todas as grafias, incluindo condomínio", () => {
  const lista = [imovel(1, "São José do Rio Preto"), imovel(2, " sao  jose do rio preto ", "JARDIM SAO JOSE"), imovel(3, "Mirassol")];
  assert.deepEqual(filtrarImoveis(lista, { ...filtroInicial, cidade: "SAO JOSE DO RIO PRETO", bairro: "jardim sao jose" }).map((i) => i.id), ["1", "2"]);
  assert.equal(filtrarImoveis(lista, { ...filtroInicial, busca: "residencial sao joao" }).length, 3);
  assert.equal(filtrarImoveis(lista, { ...filtroInicial, busca: "PRÓXIMO A PRACA" }).length, 3);
});

function catalogoSimulado(lista) {
  const linhas = () => lista.filter((i) => i.situacao !== "RASCUNHO").map((i) => ({
    ...i, id: Number(i.id), identificador: i.slug, tipo: i.tipo.toUpperCase(),
    disponibilidade: i.status === "disponivel" ? "DISPONIVEL" : "VENDIDO", nome_condominio: i.nomeCondominio,
    valor_venda: String(i.preco), atualizado_em: i.atualizadoEm, criado_em: i.criadoEm,
  }));
  const banco = { query: async (sql, params = []) => {
    if (sql.includes("FROM midias") || sql.includes("FROM caracteristicas")) return [[]];
    assert.match(sql, /situacao = 'PUBLICADO'/);
    return [sql.includes("AND id IN") ? linhas().filter((i) => params.includes(i.id)) : linhas()];
  } };
  return carregarTs("src/lib/imoveis/publico.ts", {
    "@/lib/banco": { banco }, "@/lib/imoveis/midias": { criarEnderecoDaMidia: (valor) => valor },
  });
}

test("repositório exclui rascunhos e não sugere cidades sem anúncios", async () => {
  const lista = [imovel(1, "São José do Rio Preto"), imovel(2, "sao jose do rio preto"), imovel(3, "Mirassol", "Centro", { situacao: "RASCUNHO" })];
  const publico = catalogoSimulado(lista);
  assert.deepEqual(await publico.listarCidades(), ["São José do Rio Preto"]);
  assert.equal(await publico.resolverCidadePorSlug("mirassol"), null);
  lista[2].situacao = "PUBLICADO";
  assert.deepEqual(await publico.listarCidades(), ["Mirassol", "São José do Rio Preto"]);
  lista.pop();
  assert.equal(await publico.resolverCidadePorSlug("mirassol"), null);
});

test("páginas por local, totais e sitemap agrupam variantes e respeitam a cidade de cada bairro/condomínio", async () => {
  const lista = [imovel(1, "São José do Rio Preto"), imovel(2, " sao  jose do rio preto ", "jardim sao jose", { nomeCondominio: "RESIDENCIAL SAO JOAO" }), imovel(3, "Mirassol"), imovel(4, "SÃO JOSÉ DO RIO PRETO", undefined, { status: "vendido" })];
  const publico = catalogoSimulado(lista);
  assert.deepEqual((await publico.listarImoveisPorCidade("sao-jose-do-rio-preto")).map((i) => i.id), ["1", "2", "4"]);
  assert.equal((await publico.listarImoveisPorCidadeETipo("sao-jose-do-rio-preto", "terreno")).length, 0);
  assert.equal((await publico.listarImoveisPorBairro("sao-jose-do-rio-preto", "jardim-sao-jose")).length, 3);
  assert.equal((await publico.listarImoveisPorCondominio("sao-jose-do-rio-preto", "residencial-sao-joao")).length, 3);
  assert.equal((await publico.listarImoveisPorBairro("mirassol", "jardim-sao-jose")).length, 1);
  assert.equal((await publico.resolverBairroPorSlug("sao-jose-do-rio-preto", "jardim-sao-jose")).total, 2);
  assert.equal((await publico.resolverCondominioPorSlug("sao-jose-do-rio-preto", "residencial-sao-joao")).total, 2);
  const cidades = await publico.listarCidadesComImoveis();
  assert.equal(cidades.length, 2);
  assert.equal(cidades.find((i) => i.slug === "sao-jose-do-rio-preto").total, 2);
  assert.equal((await publico.listarBairrosComImoveis()).length, 2);
  assert.equal((await publico.listarCondominiosComImoveis()).length, 2);
  assert.equal((await publico.listarCidadesTiposComImoveis()).length, 2);
  assert.deepEqual(await publico.listarBairros("SAO JOSE DO RIO PRETO"), ["Jardim São José"]);
  assert.equal(publico.calcularEstatisticasListagem(lista.slice(0, 2)).bairros, 1);
});

test("cadastro e edição reaproveitam nomes com acentos e mantêm bairros de cidades diferentes separados", async () => {
  const existentes = [{ cidade: "São José do Rio Preto", bairro: "Jardim São José", nome_condominio: "Residencial São João" }, { cidade: "Mirassol", bairro: "Bairro Á", nome_condominio: null }];
  const gravacoes = [];
  const conexao = { query: async () => [existentes], execute: async (sql, params) => { gravacoes.push({ sql, params }); return [{ insertId: 99 }]; } };
  const repo = carregarTs("src/lib/imoveis/repositorio.ts", { "@/lib/banco": { banco: {} }, "@/lib/imoveis/midias": { criarEnderecoDaMidia: (valor) => valor } });
  const dados = {
    cidade: "sao jose do rio preto", bairro: "jardim sao jose", nomeCondominio: "residencial sao joao", situacao: "PUBLICADO",
    titulo: "Casa", identificador: "casa", midias: [], novasMidias: [], midiasRemovidas: [], midiasExistentes: [], metadados: [], caracteristicasSeparadas: [],
  };
  await repo.cadastrarImovel(conexao, dados);
  const insercao = gravacoes.find((g) => g.sql.includes("INSERT INTO imoveis"));
  assert.equal(insercao.params[32], "São José do Rio Preto");
  assert.equal(insercao.params[31], "Jardim São José");
  assert.equal(insercao.params[4], "Residencial São João");
  await repo.atualizarImovel(conexao, 99, { ...dados, bairro: "bairro a" });
  const edicao = gravacoes.find((g) => g.sql.includes("UPDATE imoveis"));
  assert.equal(edicao.params[30], "São José do Rio Preto");
  assert.equal(edicao.params[29], "Bairro A");
});

test("busca inicial vazia não oferece localidades/tipos fixos e renderiza as opções cadastradas", () => {
  const { renderToStaticMarkup } = require("react-dom/server");
  const { BuscaPrincipal } = carregarTs("src/componentes/buscaPrincipal/BuscaPrincipal.tsx");
  const vazio = renderToStaticMarkup(BuscaPrincipal({ opcoes: obterOpcoesFiltros([]) }));
  assert.doesNotMatch(vazio, /Mirassol|Bady Bassitt|value="casa"|value="apartamento"/);
  const html = renderToStaticMarkup(BuscaPrincipal({ opcoes: obterOpcoesFiltros([imovel(1, "Cidade Nova", "Centro", { quartos: 5 })]) }));
  assert.match(html, /Cidade Nova/);
  assert.match(html, /value="casa"/);
  assert.match(html, /5 ou mais/);
  assert.doesNotMatch(html, /value="apartamento"/);
});

test("filtro mantém cidade e bairro selecionados em URLs sem acentos e restringe bairros à cidade", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const lista = [imovel(1, "São José do Rio Preto"), imovel(2, "sao jose do rio preto", "jardim sao jose"), imovel(3, "Mirassol", "Centro")];
  const { FiltroImoveis } = carregarTs("src/componentes/filtroImoveis/FiltroImoveis.tsx", {
    "next/navigation": { useRouter: () => ({ push() {} }), useSearchParams: () => new URLSearchParams("cidade=SAO+JOSE+DO+RIO+PRETO&bairro=jardim+sao+jose") },
  });
  const html = renderToStaticMarkup(React.createElement(FiltroImoveis, {
    ...obterOpcoesFiltros(lista), total: 2, localizacoes: lista,
  }));
  const cidade = html.match(/<select[^>]+name="cidade"[^>]*>(.*?)<\/select>/s)[1];
  const bairro = html.match(/<select[^>]+name="bairro"[^>]*>(.*?)<\/select>/s)[1];
  assert.match(cidade, /<option selected="">São José do Rio Preto<\/option>/);
  assert.match(bairro, /<option selected="">Jardim São José<\/option>/);
  assert.doesNotMatch(bairro, /Centro/);
  assert.equal((bairro.match(/<option/g) || []).length, 2);
});

test("validação limpa espaços/Unicode de localidades sem retirar acentos e deduplica características", () => {
  const { esquemaDoCadastroDeImovel, separarCaracteristicas } = carregarTs("src/lib/imoveis/validacao.ts");
  const dados = esquemaDoCadastroDeImovel.parse({
    titulo: "Casa para vender", tipo: "CASA", situacao: "RASCUNHO", disponibilidade: "DISPONIVEL",
    cidade: "  São   José do Rio Preto  ".normalize("NFD"), bairro: " Jardim  São José ", nomeCondominio: " ",
    condominioIsento: false, iptuIsento: false, aceitaFinanciamento: "", aceitaPermuta: "", periodicidadeIptu: "",
    topografia: "", elevador: "", exibirEnderecoExato: false, destaque: false, recursosAdicionais: [],
  });
  assert.equal(dados.cidade, "São José do Rio Preto");
  assert.equal(dados.bairro, "Jardim São José");
  assert.equal(dados.nomeCondominio, null);
  assert.deepEqual(separarCaracteristicas("Área gourmet, area gourmet, Piscina", ["PISCINA"]), ["Área gourmet", "Piscina"]);
});
