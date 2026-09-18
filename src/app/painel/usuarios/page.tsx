import { notFound } from "next/navigation";
import { FormularioNovoUsuario } from "@/componentes/painel/FormularioNovoUsuario";
import { exigirSessaoPainel } from "@/lib/imoveis/auth-painel";
import { listarUsuarios } from "@/lib/usuarios";
import estilos from "./usuarios.module.css";

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

export default async function PaginaUsuarios() {
  const sessao = await exigirSessaoPainel();
  if (!sessao.desenvolvedor) notFound();
  const usuarios = await listarUsuarios();

  return (
    <main className={estilos.principal}>
      <header className={estilos.cabecalho}>
        <h1>Usuários</h1>
        <p>
          Crie acessos administrativos e acompanhe quem ainda precisa definir a
          senha pessoal.
        </p>
      </header>

      <section className={estilos.bloco} aria-labelledby="novo-usuario">
        <div className={estilos.tituloBloco}>
          <h2 id="novo-usuario">Novo usuário</h2>
          <p>
            A senha informada será temporária e deverá ser trocada no primeiro
            acesso.
          </p>
        </div>
        <FormularioNovoUsuario />
      </section>

      <section
        className={estilos.bloco}
        aria-labelledby="usuarios-cadastrados"
      >
        <div className={estilos.tituloBloco}>
          <h2 id="usuarios-cadastrados">Usuários cadastrados</h2>
          <p>
            {usuarios.length}{" "}
            {usuarios.length === 1
              ? "conta cadastrada"
              : "contas cadastradas"}
          </p>
        </div>
        <ul className={estilos.listaUsuarios}>
          {usuarios.map((usuario) => (
            <li key={usuario.id} className={estilos.cartaoUsuario}>
              <div>
                <strong>{usuario.nome}</strong>
                <span className={estilos.email}>{usuario.email}</span>
              </div>
              <div className={estilos.detalhes}>
                <span>
                  <small>Perfil</small>
                  <p>
                    {usuario.desenvolvedor
                      ? "Desenvolvedor"
                      : "Administrador"}
                  </p>
                </span>
                <span>
                  <small>Acesso</small>
                  <p>
                    <span
                      className={
                        usuario.alterarSenha ? estilos.pendente : estilos.ativo
                      }
                    >
                      {usuario.alterarSenha
                        ? "Aguardando troca de senha"
                        : "Ativo"}
                    </span>
                  </p>
                </span>
                <span>
                  <small>Criado em</small>
                  <p>{data.format(usuario.criadoEm)}</p>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
