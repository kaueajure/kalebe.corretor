"use client";

import { FormEvent, useState } from "react";
import { empresa } from "@/dados/empresa";
import { linkWhatsApp } from "@/lib/formatadores";
import estilos from "./formularioContato.module.css";

export function FormularioContato() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !telefone.trim() || !mensagem.trim()) {
      setErro("Preencha nome, telefone e mensagem.");
      return;
    }

    const texto = `Olá, meu nome é ${nome}. Telefone: ${telefone}. ${mensagem}`;
    window.open(linkWhatsApp(empresa.whatsapp, texto), "_blank", "noopener,noreferrer");
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="mensagem-estado" role="status">
        <h3>Mensagem pronta</h3>
        <p>
          Abrimos o WhatsApp com sua mensagem. Se a conversa não abriu, use o
          botão abaixo.
        </p>
        <a
          href={linkWhatsApp(empresa.whatsapp)}
          className="botao botao-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form className={estilos.form} onSubmit={enviar} noValidate>
      <div>
        <label htmlFor="contato-nome" className="rotulo-campo">
          Nome
        </label>
        <input
          id="contato-nome"
          className="campo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label htmlFor="contato-telefone" className="rotulo-campo">
          Telefone / WhatsApp
        </label>
        <input
          id="contato-telefone"
          className="campo"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          autoComplete="tel"
          required
        />
      </div>
      <div>
        <label htmlFor="contato-mensagem" className="rotulo-campo">
          Mensagem
        </label>
        <textarea
          id="contato-mensagem"
          className="area-texto"
          rows={5}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Conte o que você procura: cidade, faixa de preço, quartos..."
          required
        />
      </div>
      {erro ? (
        <p className={estilos.erro} role="alert">
          {erro}
        </p>
      ) : null}
      <button type="submit" className="botao botao-primario">
        Enviar pelo WhatsApp
      </button>
    </form>
  );
}
