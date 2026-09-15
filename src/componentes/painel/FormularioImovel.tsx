"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { MidiaDoImovelParaEdicao } from "@/lib/imoveis/repositorio";
import {
  enviarFormularioDeImovel,
  focarCampoDoFormulario,
  montarCorpoDoFormularioDeImovel,
  validarFormularioAntesDoEnvio,
} from "./enviarFormularioImovel";
import { GaleriaMidias, type MidiaSelecionada } from "./GaleriaMidias";
import estilos from "./formularioImovel.module.css";

type EstadoDoEnvio = { tipo: "erro"; mensagem: string } | null;

type PropriedadesDoFormulario = {
  modo?: "criar" | "editar";
  imovelId?: number;
  codigo?: string;
  situacaoAtual?: string;
  valoresIniciais?: Record<string, string | boolean | string[]>;
  midiasIniciais?: MidiaDoImovelParaEdicao[];
};

const ESTADO_INICIAL: Record<string, string | boolean | string[]> = {
  tipo: "CASA",
  disponibilidade: "DISPONIVEL",
  periodicidadeIptu: "ANUAL",
  recursosAdicionais: [],
};

const SUBTIPOS: Record<string, string[]> = {
  CASA: ["Casa térrea", "Sobrado", "Casa em condomínio"],
  APARTAMENTO: ["Apartamento padrão", "Cobertura", "Studio", "Loft"],
  COMERCIAL: [
    "Sala comercial",
    "Loja",
    "Galpão",
    "Prédio comercial",
    "Terreno comercial",
  ],
  SOBRADO: ["Sobrado residencial", "Sobrado em condomínio", "Duplex"],
  TERRENO: ["Residencial", "Comercial", "Industrial", "Rural"],
};

const RECURSOS: Record<string, string[]> = {
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

function valorDoFormulario(formulario: HTMLFormElement) {
  const dados = new FormData(formulario);
  const resumo: Record<string, string | boolean | string[]> = {
    ...ESTADO_INICIAL,
  };
  for (const [nome, valor] of dados.entries()) {
    if (typeof valor === "string") resumo[nome] = valor;
  }
  resumo.condominioIsento = dados.get("condominioIsento") === "SIM";
  resumo.iptuIsento = dados.get("iptuIsento") === "SIM";
  resumo.exibirEnderecoExato = dados.get("exibirEnderecoExato") === "SIM";
  resumo.destaque = dados.get("destaque") === "SIM";
  resumo.recursosAdicionais = dados
    .getAll("recursosAdicionais")
    .filter((valor): valor is string => typeof valor === "string");
  return resumo;
}

function texto(valor: string | boolean | string[] | undefined) {
  return typeof valor === "string" ? valor : "";
}

function lista(valor: string | boolean | string[] | undefined) {
  return Array.isArray(valor) ? valor : [];
}

function marcado(valor: string | boolean | string[] | undefined) {
  return valor === true || valor === "SIM";
}

function midiasIniciaisParaSelecao(
  midias: MidiaDoImovelParaEdicao[],
): MidiaSelecionada[] {
  return midias.map((midia) => ({
    id: String(midia.id),
    idBanco: midia.id,
    url: midia.url,
    natureza: midia.tipo === "VIDEO" ? "video" : "imagem",
    classificacao: midia.tipo === "PLANTA" ? "PLANTA" : "IMAGEM",
    descricao: midia.descricao ?? "",
    principal: midia.principal,
    largura: midia.largura,
    altura: midia.altura,
  }));
}

function CampoMonetario({
  nome,
  rotulo,
  valorInicial = "",
}: {
  nome: string;
  rotulo: string;
  valorInicial?: string;
}) {
  return (
    <label className={estilos.campo}>
      <span>{rotulo}</span>
      <div className={estilos.preco}>
        <span aria-hidden="true">R$</span>
        <input
          className="campo"
          name={nome}
          type="number"
          min="0"
          max="999999999999.99"
          step="0.01"
          inputMode="decimal"
          defaultValue={valorInicial}
        />
      </div>
    </label>
  );
}

function CampoNumero({
  nome,
  rotulo,
  unidade,
  inteiro = false,
  valorInicial = "",
}: {
  nome: string;
  rotulo: string;
  unidade?: string;
  inteiro?: boolean;
  valorInicial?: string;
}) {
  return (
    <label className={estilos.campo}>
      <span>{rotulo}</span>
      <div className={unidade ? estilos.unidade : undefined}>
        <input
          className="campo"
          name={nome}
          type="number"
          min="0"
          max="99999999.99"
          step={inteiro ? "1" : "0.01"}
          inputMode={inteiro ? "numeric" : "decimal"}
          defaultValue={valorInicial}
        />
        {unidade ? <span aria-hidden="true">{unidade}</span> : null}
      </div>
    </label>
  );
}

function RespostaOpcional({
  nome,
  rotulo,
  valorInicial = "",
}: {
  nome: string;
  rotulo: string;
  valorInicial?: string;
}) {
  return (
    <label className={estilos.campo}>
      <span>{rotulo}</span>
      <select className="selecao" name={nome} defaultValue={valorInicial}>
        <option value="">Não especificado</option>
        <option value="SIM">Sim</option>
        <option value="NAO">Não</option>
      </select>
    </label>
  );
}

export function FormularioImovel({
  modo = "criar",
  imovelId,
  codigo,
  situacaoAtual,
  valoresIniciais,
  midiasIniciais = [],
}: PropriedadesDoFormulario) {
  const router = useRouter();
  const formulario = useRef<HTMLFormElement>(null);
  const estadoInicial = { ...ESTADO_INICIAL, ...valoresIniciais };
  const [enviando, setEnviando] = useState<"RASCUNHO" | "PUBLICAR" | null>(null);
  const [estado, setEstado] = useState<EstadoDoEnvio>(null);
  const [alterado, setAlterado] = useState(false);
  const [dados, setDados] = useState(estadoInicial);
  const [midias, setMidias] = useState<MidiaSelecionada[]>(() =>
    midiasIniciaisParaSelecao(midiasIniciais),
  );

  const tipo = String(dados.tipo ?? "CASA");
  const recursosSelecionados = lista(dados.recursosAdicionais);
  const capa = midias.some(
    (midia) =>
      midia.principal &&
      midia.natureza === "imagem" &&
      midia.classificacao === "IMAGEM",
  );
  const localizacao = Boolean(
    texto(dados.cidade) || texto(dados.bairro) || texto(dados.nomeCondominio),
  );
  const pendencias = [
    !texto(dados.titulo).trim() && "Título",
    !Number(dados.valorVenda) && "Valor de venda",
    !localizacao && "Cidade, bairro ou condomínio",
    !capa && "Foto de capa",
  ].filter(Boolean) as string[];
  const itensDeQualidade = [
    Boolean(texto(dados.titulo).trim()),
    Boolean(Number(dados.valorVenda)),
    localizacao,
    Boolean(texto(dados.descricao).trim()),
    Boolean(dados.areaUtil || dados.areaTerreno || dados.areaConstruida),
    Boolean(
      texto(dados.caracteristicas).trim() ||
        lista(dados.recursosAdicionais).length,
    ),
    capa,
  ];
  const completude = Math.round(
    (itensDeQualidade.filter(Boolean).length / itensDeQualidade.length) * 100,
  );

  useEffect(() => {
    function avisarSaida(evento: BeforeUnloadEvent) {
      if (!alterado) return;
      evento.preventDefault();
    }
    window.addEventListener("beforeunload", avisarSaida);
    return () => window.removeEventListener("beforeunload", avisarSaida);
  }, [alterado]);

  function atualizarDados() {
    setAlterado(true);
    if (formulario.current) setDados(valorDoFormulario(formulario.current));
  }

  function impedirEnvioPadrao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
  }

  async function executarEnvio(acaoEnviada: "RASCUNHO" | "PUBLICAR") {
    const elemento = formulario.current;
    if (!elemento) {
      setEstado({
        tipo: "erro",
        mensagem:
          "Não foi possível localizar o formulário. Recarregue a página e tente novamente.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const acao = acaoEnviada;

    const erroLocal = validarFormularioAntesDoEnvio({
      modo,
      imovelId,
      acao,
      temCapa: capa,
    });
    if (erroLocal) {
      setEstado({ tipo: "erro", mensagem: erroLocal });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (acaoEnviada === "PUBLICAR" && !elemento.reportValidity()) {
      return;
    }

    const corpo = montarCorpoDoFormularioDeImovel(elemento, midias, acao);

    setEnviando(acaoEnviada);
    setEstado(null);

    try {
      const resultado = await enviarFormularioDeImovel({
        corpo,
        modo,
        imovelId,
        acao,
      });

      if (!resultado.sucesso) {
        if (resultado.status === 401) {
          setAlterado(false);
          router.push("/login");
          return;
        }
        focarCampoDoFormulario(formulario.current, resultado.campo);
        throw new Error(resultado.mensagem);
      }

      const parametro =
        modo === "editar"
          ? `atualizado=${resultado.acao === "PUBLICAR" ? "publicado" : "rascunho"}`
          : `criado=${resultado.acao === "PUBLICAR" ? "publicado" : "rascunho"}`;
      setAlterado(false);
      router.push(`/painel/imoveis?${parametro}`);
      router.refresh();
    } catch (erro) {
      setEstado({
        tipo: "erro",
        mensagem:
          erro instanceof Error
            ? erro.message
            : `Não foi possível ${modo === "editar" ? "atualizar" : "cadastrar"} o imóvel.`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setEnviando(null);
    }
  }

  return (
    <form
      key={imovelId ?? "novo"}
      ref={formulario}
      className={estilos.formulario}
      onSubmit={impedirEnvioPadrao}
      onInput={atualizarDados}
      onChange={atualizarDados}
    >
      {estado ? (
        <div className={estilos.mensagemErro} role="alert">
          <strong>
            {modo === "editar"
              ? "A atualização não foi concluída."
              : "O cadastro não foi concluído."}
          </strong>
          <span>{estado.mensagem}</span>
        </div>
      ) : null}

      <div className={estilos.orientacao}>
        <div>
          <strong>
            {modo === "editar"
              ? `Editando ${codigo ?? "imóvel"}`
              : "Cadastro flexível"}
          </strong>
          <p>
            {modo === "editar"
              ? "Atualize as informações e a galeria do imóvel."
              : "Somente o título é necessário para salvar um rascunho. Campos não preenchidos ficam ocultos no site."}
          </p>
        </div>
        <span>Campos essenciais para publicação são verificados ao final.</span>
      </div>

      <fieldset className={estilos.secao}>
        <legend>
          <span>01</span>
          <span>
            <strong>Apresentação</strong>
            <small>Identificação, tipo e descrição do imóvel.</small>
          </span>
        </legend>
        <div className={`${estilos.grade} ${estilos.duasColunas}`}>
          <label className={`${estilos.campo} ${estilos.campoLargo}`}>
            <span>
              Título <em>Obrigatório</em>
            </span>
            <input
              className="campo"
              name="titulo"
              type="text"
              maxLength={220}
              autoComplete="off"
              placeholder="Ex.: Casa térrea com área gourmet no Jardim Vivendas"
              defaultValue={texto(estadoInicial.titulo)}
              required
            />
          </label>
          <label className={estilos.campo}>
            <span>Disponibilidade</span>
            <select
              className="selecao"
              name="disponibilidade"
              defaultValue={texto(estadoInicial.disponibilidade) || "DISPONIVEL"}
            >
              <option value="DISPONIVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="EM_NEGOCIACAO">Em negociação</option>
              <option value="VENDIDO">Vendido</option>
              <option value="INDISPONIVEL">Indisponível</option>
            </select>
            <small>O status de publicação é definido ao salvar ou publicar.</small>
          </label>
          <label className={estilos.campo}>
            <span>Tipo</span>
            <select
              className="selecao"
              name="tipo"
              defaultValue={texto(estadoInicial.tipo) || "CASA"}
            >
              <option value="CASA">Casa</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="SOBRADO">Sobrado</option>
            </select>
          </label>
          <label className={estilos.campo}>
            <span>Subtipo</span>
            <select
              className="selecao"
              name="subtipo"
              defaultValue={texto(estadoInicial.subtipo)}
              key={tipo}
            >
              <option value="">Não especificado</option>
              {(SUBTIPOS[tipo] ?? []).map((subtipo) => (
                <option key={subtipo} value={subtipo}>
                  {subtipo}
                </option>
              ))}
            </select>
          </label>
          <label className={`${estilos.campo} ${estilos.campoLargo}`}>
            <span>Descrição</span>
            <textarea
              className="area-texto"
              name="descricao"
              rows={7}
              maxLength={20000}
              defaultValue={texto(estadoInicial.descricao)}
              placeholder="Apresente os principais diferenciais, o entorno e a experiência de morar ou investir neste imóvel."
            />
            <small>
              Use uma descrição objetiva. Informações técnicas podem ser
              preenchidas nos campos abaixo.
            </small>
          </label>
        </div>
      </fieldset>

      <fieldset className={estilos.secao}>
        <legend>
          <span>02</span>
          <span>
            <strong>Valores e condições</strong>
            <small>Preço de venda, despesas e condições comerciais.</small>
          </span>
        </legend>
        <div className={`${estilos.grade} ${estilos.quatroColunas}`}>
          <CampoMonetario
            nome="valorVenda"
            rotulo="Valor de venda"
            valorInicial={texto(estadoInicial.valorVenda)}
          />
          <CampoMonetario
            nome="valorCondominio"
            rotulo="Condomínio"
            valorInicial={texto(estadoInicial.valorCondominio)}
          />
          <CampoMonetario
            nome="valorIptu"
            rotulo="IPTU"
            valorInicial={texto(estadoInicial.valorIptu)}
          />
          <label className={estilos.campo}>
            <span>Periodicidade do IPTU</span>
            <select
              className="selecao"
              name="periodicidadeIptu"
              defaultValue={texto(estadoInicial.periodicidadeIptu) || "ANUAL"}
            >
              <option value="ANUAL">Anual</option>
              <option value="MENSAL">Mensal</option>
            </select>
          </label>
          <CampoMonetario
            nome="valorOutrasDespesas"
            rotulo="Outras despesas mensais"
            valorInicial={texto(estadoInicial.valorOutrasDespesas)}
          />
          <div className={`${estilos.checks} ${estilos.campoLargo}`}>
            <label>
              <input
                name="condominioIsento"
                type="checkbox"
                value="SIM"
                defaultChecked={marcado(estadoInicial.condominioIsento)}
              />{" "}
              Condomínio isento
            </label>
            <label>
              <input
                name="iptuIsento"
                type="checkbox"
                value="SIM"
                defaultChecked={marcado(estadoInicial.iptuIsento)}
              />{" "}
              IPTU isento
            </label>
          </div>
          <RespostaOpcional
            nome="aceitaFinanciamento"
            rotulo="Aceita financiamento?"
            valorInicial={texto(estadoInicial.aceitaFinanciamento)}
          />
          <RespostaOpcional
            nome="aceitaPermuta"
            rotulo="Aceita permuta?"
            valorInicial={texto(estadoInicial.aceitaPermuta)}
          />
        </div>
      </fieldset>

      <fieldset className={estilos.secao}>
        <legend>
          <span>03</span>
          <span>
            <strong>Localização</strong>
            <small>Informe somente o nível de detalhe adequado ao anúncio.</small>
          </span>
        </legend>
        <div className={`${estilos.grade} ${estilos.quatroColunas}`}>
          <label className={estilos.campo}>
            <span>CEP</span>
            <input
              className="campo"
              name="cep"
              type="text"
              maxLength={10}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="15000-000"
              defaultValue={texto(estadoInicial.cep)}
            />
          </label>
          <label className={estilos.campo}>
            <span>Estado</span>
            <input
              className="campo"
              name="estado"
              type="text"
              maxLength={2}
              autoComplete="address-level1"
              placeholder="SP"
              defaultValue={texto(estadoInicial.estado)}
            />
          </label>
          <label className={estilos.campo}>
            <span>Cidade</span>
            <input
              className="campo"
              name="cidade"
              type="text"
              maxLength={160}
              autoComplete="address-level2"
              defaultValue={texto(estadoInicial.cidade)}
            />
          </label>
          <label className={estilos.campo}>
            <span>Bairro</span>
            <input
              className="campo"
              name="bairro"
              type="text"
              maxLength={160}
              autoComplete="address-level3"
              defaultValue={texto(estadoInicial.bairro)}
            />
          </label>
          <label className={`${estilos.campo} ${estilos.campoDuplo}`}>
            <span>Condomínio</span>
            <input
              className="campo"
              name="nomeCondominio"
              type="text"
              maxLength={180}
              defaultValue={texto(estadoInicial.nomeCondominio)}
            />
          </label>
          <label className={`${estilos.campo} ${estilos.campoDuplo}`}>
            <span>Logradouro</span>
            <input
              className="campo"
              name="logradouro"
              type="text"
              maxLength={220}
              autoComplete="address-line1"
              defaultValue={texto(estadoInicial.logradouro)}
            />
          </label>
          <label className={estilos.campo}>
            <span>Número</span>
            <input
              className="campo"
              name="numero"
              type="text"
              maxLength={30}
              defaultValue={texto(estadoInicial.numero)}
            />
          </label>
          <label className={estilos.campo}>
            <span>Complemento</span>
            <input
              className="campo"
              name="complemento"
              type="text"
              maxLength={120}
              autoComplete="address-line2"
              defaultValue={texto(estadoInicial.complemento)}
            />
          </label>
          <label className={`${estilos.campo} ${estilos.campoDuplo}`}>
            <span>Ponto de referência</span>
            <input
              className="campo"
              name="pontoReferencia"
              type="text"
              maxLength={180}
              defaultValue={texto(estadoInicial.pontoReferencia)}
            />
          </label>
          <label className={`${estilos.alternador} ${estilos.campoLargo}`}>
            <input
              name="exibirEnderecoExato"
              type="checkbox"
              value="SIM"
              defaultChecked={marcado(estadoInicial.exibirEnderecoExato)}
            />
            <span>
              <strong>Exibir o endereço exato no site</strong>
              <small>
                Desmarcado, o anúncio mostra apenas condomínio, bairro e cidade.
              </small>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className={estilos.secao}>
        <legend>
          <span>04</span>
          <span>
            <strong>Detalhes do imóvel</strong>
            <small>
              Os campos se adaptam ao tipo escolhido e todos são opcionais.
            </small>
          </span>
        </legend>
        <div className={`${estilos.grade} ${estilos.quatroColunas}`}>
          {tipo !== "TERRENO" ? (
            <CampoNumero
              nome="quartos"
              rotulo="Quartos"
              inteiro
              valorInicial={texto(estadoInicial.quartos)}
            />
          ) : null}
          {tipo !== "TERRENO" ? (
            <CampoNumero
              nome="suites"
              rotulo="Suítes"
              inteiro
              valorInicial={texto(estadoInicial.suites)}
            />
          ) : null}
          {tipo !== "TERRENO" ? (
            <CampoNumero
              nome="banheiros"
              rotulo="Banheiros"
              inteiro
              valorInicial={texto(estadoInicial.banheiros)}
            />
          ) : null}
          {tipo !== "TERRENO" ? (
            <CampoNumero
              nome="vagas"
              rotulo="Vagas"
              inteiro
              valorInicial={texto(estadoInicial.vagas)}
            />
          ) : null}
          {tipo !== "TERRENO" ? (
            <CampoNumero
              nome="areaUtil"
              rotulo="Área útil"
              unidade="m²"
              valorInicial={texto(estadoInicial.areaUtil)}
            />
          ) : null}
          {tipo === "CASA" || tipo === "SOBRADO" || tipo === "COMERCIAL" ? (
            <CampoNumero
              nome="areaConstruida"
              rotulo="Área construída"
              unidade="m²"
              valorInicial={texto(estadoInicial.areaConstruida)}
            />
          ) : null}
          {tipo === "CASA" || tipo === "TERRENO" || tipo === "SOBRADO" ? (
            <CampoNumero
              nome="areaTerreno"
              rotulo="Área do terreno"
              unidade="m²"
              valorInicial={texto(estadoInicial.areaTerreno)}
            />
          ) : null}
          {tipo === "TERRENO" ? (
            <CampoNumero
              nome="frenteTerreno"
              rotulo="Frente do terreno"
              unidade="m"
              valorInicial={texto(estadoInicial.frenteTerreno)}
            />
          ) : null}
          {tipo === "TERRENO" ? (
            <CampoNumero
              nome="fundosTerreno"
              rotulo="Fundos do terreno"
              unidade="m"
              valorInicial={texto(estadoInicial.fundosTerreno)}
            />
          ) : null}
          {tipo === "TERRENO" ? (
            <label className={estilos.campo}>
              <span>Topografia</span>
              <select
                className="selecao"
                name="topografia"
                defaultValue={texto(estadoInicial.topografia)}
              >
                <option value="">Não especificada</option>
                <option value="PLANO">Plano</option>
                <option value="ACLIVE">Aclive</option>
                <option value="DECLIVE">Declive</option>
                <option value="IRREGULAR">Irregular</option>
              </select>
            </label>
          ) : null}
          {tipo === "APARTAMENTO" || tipo === "COMERCIAL" ? (
            <CampoNumero
              nome="andar"
              rotulo="Andar"
              inteiro
              valorInicial={texto(estadoInicial.andar)}
            />
          ) : null}
          {tipo === "APARTAMENTO" || tipo === "COMERCIAL" ? (
            <label className={estilos.campo}>
              <span>Unidade</span>
              <input
                className="campo"
                name="unidade"
                type="text"
                maxLength={30}
                defaultValue={texto(estadoInicial.unidade)}
              />
            </label>
          ) : null}
          {tipo === "APARTAMENTO" ? (
            <CampoNumero
              nome="totalAndares"
              rotulo="Total de andares"
              inteiro
              valorInicial={texto(estadoInicial.totalAndares)}
            />
          ) : null}
          {tipo === "APARTAMENTO" ? (
            <RespostaOpcional
              nome="elevador"
              rotulo="Possui elevador?"
              valorInicial={texto(estadoInicial.elevador)}
            />
          ) : null}
          {tipo === "COMERCIAL" ? (
            <CampoNumero
              nome="peDireito"
              rotulo="Pé-direito"
              unidade="m"
              valorInicial={texto(estadoInicial.peDireito)}
            />
          ) : null}
        </div>
      </fieldset>

      <fieldset className={estilos.secao}>
        <legend>
          <span>05</span>
          <span>
            <strong>Características</strong>
            <small>Destaques que ajudam o cliente a entender o imóvel.</small>
          </span>
        </legend>
        <div className={estilos.grade}>
          <fieldset className={estilos.subgrupo}>
            <legend>
              Sugestões para {tipo.toLocaleLowerCase("pt-BR")}
            </legend>
            <div className={`${estilos.checks} ${estilos.checksRecursos}`}>
              {(RECURSOS[tipo] ?? []).map((recurso) => (
                <label key={recurso}>
                  <input
                    name="recursosAdicionais"
                    type="checkbox"
                    value={recurso}
                    defaultChecked={recursosSelecionados.includes(recurso)}
                  />{" "}
                  {recurso}
                </label>
              ))}
            </div>
          </fieldset>
          <label className={estilos.campo}>
            <span>Outras características</span>
            <input
              className="campo"
              name="caracteristicas"
              type="text"
              maxLength={4000}
              defaultValue={texto(estadoInicial.caracteristicas)}
              placeholder="Armários planejados, aquecimento solar, rua tranquila"
            />
            <small>Separe cada característica por vírgula.</small>
          </label>
        </div>
      </fieldset>

      <fieldset className={estilos.secao}>
        <legend>
          <span>06</span>
          <span>
            <strong>Galeria do imóvel</strong>
            <small>
              Organize fotos, vídeos, plantas e escolha a capa do anúncio.
            </small>
          </span>
        </legend>
        <div className={estilos.grade}>
          <GaleriaMidias
            midias={midias}
            aoAlterar={(novasMidias) => {
              setAlterado(true);
              setMidias(novasMidias);
            }}
            aoErro={(mensagem) =>
              setEstado(mensagem ? { tipo: "erro", mensagem } : null)
            }
          />
        </div>
      </fieldset>

      <fieldset className={`${estilos.secao} ${estilos.publicacao}`}>
        <legend>
          <span>07</span>
          <span>
            <strong>Revisão e publicação</strong>
            <small>
              Confira o nível de preenchimento antes de disponibilizar o
              anúncio.
            </small>
          </span>
        </legend>
        <div className={`${estilos.grade} ${estilos.revisao}`}>
          <div className={estilos.completude}>
            <div>
              <span>Qualidade do cadastro</span>
              <strong>{completude}%</strong>
            </div>
            <progress max="100" value={completude}>
              {completude}%
            </progress>
            <small>
              Descrição, detalhes e características são opcionais, mas tornam o
              anúncio mais completo.
            </small>
          </div>
          <div className={estilos.pendencias}>
            <strong>
              {pendencias.length ? "Antes de publicar" : "Pronto para publicar"}
            </strong>
            {pendencias.length ? (
              <ul>
                {pendencias.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>As informações essenciais estão preenchidas.</p>
            )}
          </div>
          <label className={estilos.alternador}>
            <input
              name="destaque"
              type="checkbox"
              value="SIM"
              defaultChecked={marcado(estadoInicial.destaque)}
            />
            <span>
              <strong>Destacar este imóvel</strong>
              <small>Permite priorizá-lo nas seleções do site.</small>
            </span>
          </label>
        </div>
      </fieldset>

      <footer className={estilos.acoes}>
        <Link
          className="botao botao-fantasma"
          href="/painel/imoveis"
          onClick={(evento) => {
            if (alterado && !window.confirm("Descartar as alterações não salvas?")) {
              evento.preventDefault();
            }
          }}
        >
          Cancelar
        </Link>
        <button
          className="botao botao-secundario"
          type="button"
          disabled={Boolean(enviando)}
          onClick={() => void executarEnvio("RASCUNHO")}
        >
          {enviando === "RASCUNHO"
            ? "Salvando…"
            : modo === "editar"
              ? situacaoAtual === "PUBLICADO"
                ? "Despublicar e salvar rascunho"
                : "Salvar alterações"
              : "Salvar rascunho"}
        </button>
        <button
          className="botao botao-primario"
          type="button"
          disabled={Boolean(enviando)}
          onClick={() => void executarEnvio("PUBLICAR")}
        >
          {enviando === "PUBLICAR"
            ? "Publicando…"
            : modo === "editar"
              ? "Atualizar e publicar"
              : "Publicar imóvel"}
        </button>
      </footer>
    </form>
  );
}
