"use client";

import { useActionState, useState } from "react";
import { alterarManutencao, type EstadoManutencao } from "@/app/painel/manutencao/acoes";
import { empresa } from "@/dados/empresa";
import type { ConfiguracaoManutencao } from "@/lib/manutencao";
import estilos from "@/app/painel/manutencao/manutencao.module.css";

type Textos = Pick<ConfiguracaoManutencao, "rotulo" | "titulo" | "mensagemPrincipal" | "mensagemComplementar">;

export function ControleManutencao({ configuracao }: { configuracao: ConfiguracaoManutencao }) {
  const [estado, acao, pendente] = useActionState<EstadoManutencao, FormData>(alterarManutencao, configuracao);
  const [textos, setTextos] = useState<Textos>({
    rotulo: configuracao.rotulo,
    titulo: configuracao.titulo,
    mensagemPrincipal: configuracao.mensagemPrincipal,
    mensagemComplementar: configuracao.mensagemComplementar,
  });

  function atualizar(chave: keyof Textos, valor: string) {
    setTextos((atual) => ({ ...atual, [chave]: valor }));
  }

  return (
    <section className={estilos.cartao} aria-labelledby="estado-manutencao">
      <div className={estilos.linhaEstado}>
        <div>
          <h2 id="estado-manutencao">Página de manutenção</h2>
          <p className={estilos.descricao}>
            Edite o aviso que aparece aos visitantes. Você pode salvar os textos sem ativar a manutenção.
          </p>
        </div>
        <strong className={`${estilos.estado} ${estado.ativa ? estilos.ativo : estilos.inativo}`}>
          {estado.ativa ? "Ativa" : "Desativada"}
        </strong>
      </div>

      <form action={acao} className={estilos.formulario} aria-busy={pendente}>
        <div className={estilos.campos}>
          <label>
            <span>Texto superior <small>Opcional · até 80 caracteres</small></span>
            <input
              className="campo"
              name="rotulo"
              type="text"
              maxLength={80}
              value={textos.rotulo}
              onChange={(evento) => atualizar("rotulo", evento.target.value)}
              placeholder="Ex.: Aviso importante"
            />
          </label>
          <label>
            <span>Título <small>Obrigatório · até 140 caracteres</small></span>
            <input
              className="campo"
              name="titulo"
              type="text"
              required
              minLength={3}
              maxLength={140}
              value={textos.titulo}
              onChange={(evento) => atualizar("titulo", evento.target.value)}
            />
          </label>
          <label>
            <span>Mensagem principal <small>Obrigatória · até 1.000 caracteres</small></span>
            <textarea
              className="area-texto"
              name="mensagemPrincipal"
              required
              minLength={5}
              maxLength={1000}
              rows={4}
              value={textos.mensagemPrincipal}
              onChange={(evento) => atualizar("mensagemPrincipal", evento.target.value)}
            />
          </label>
          <label>
            <span>Mensagem complementar <small>Opcional · até 600 caracteres</small></span>
            <textarea
              className="area-texto"
              name="mensagemComplementar"
              maxLength={600}
              rows={3}
              value={textos.mensagemComplementar}
              onChange={(evento) => atualizar("mensagemComplementar", evento.target.value)}
              placeholder="Ex.: Para assuntos urgentes, entre em contato pelo telefone."
            />
          </label>
        </div>

        <div className={estilos.previaBloco}>
          <h3>Prévia do aviso</h3>
          <div className={estilos.previa}>
            <div className={estilos.previaConteudo}>
              <p className={estilos.previaMarca}>{empresa.nomeCurto}</p>
              <span className={estilos.previaLinha} aria-hidden="true" />
              {textos.rotulo.trim() ? <p className={estilos.previaRotulo}>{textos.rotulo}</p> : null}
              <strong>{textos.titulo || "Título da manutenção"}</strong>
              <p>{textos.mensagemPrincipal || "Mensagem principal da manutenção"}</p>
              {textos.mensagemComplementar.trim() ? (
                <p className={estilos.previaComplementar}>{textos.mensagemComplementar}</p>
              ) : null}
            </div>
          </div>
          <small>A prévia acompanha sua edição. O público vê os textos salvos quando a manutenção está ativa.</small>
        </div>

        <div className={estilos.acoes}>
          <button className="botao botao-secundario" type="submit" name="intencao" value="salvar" disabled={pendente}>
            {pendente ? "Salvando…" : "Salvar mensagem"}
          </button>
          <button className="botao botao-primario" type="submit" name="intencao" value={estado.ativa ? "desativar" : "ativar"} disabled={pendente}>
            {pendente ? "Salvando…" : estado.ativa ? "Salvar e desativar" : "Salvar e ativar"}
          </button>
        </div>
        {estado.mensagem ? <p className={estilos.sucesso} role="status">{estado.mensagem}</p> : null}
        {estado.erro ? <p className={estilos.erro} role="alert">{estado.erro}</p> : null}
      </form>

      <p className={estilos.explicacao}>
        Durante a manutenção, o desenvolvedor pode abrir <code>/login</code> e entrar com sua conta.
        Visitantes e administradores veem apenas este aviso.
      </p>
    </section>
  );
}
