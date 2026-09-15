import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sairPainel } from "@/app/painel/acoes";
import { FormularioPrimeiroAcesso } from "@/componentes/painel/FormularioPrimeiroAcesso";
import { lerSessao } from "@/lib/sessao";
import estilos from "./primeiroAcesso.module.css";

export const metadata: Metadata = {
  title: "Definir nova senha",
  robots: { index: false, follow: false },
};

export default async function PaginaPrimeiroAcesso() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");
  if (!sessao.alterarSenha) redirect("/painel");

  return (
    <main className={estilos.pagina}>
      <section className={estilos.caixa}>
        <p className={estilos.selo}>Primeiro acesso</p>
        <h1>Defina sua senha pessoal</h1>
        <p className={estilos.descricao}>Olá, {sessao.nome}. Confirme a senha temporária recebida e escolha uma nova senha para liberar o painel.</p>
        <FormularioPrimeiroAcesso />
        <form action={sairPainel} className={estilos.sair}>
          <button type="submit">Sair e usar outra conta</button>
        </form>
      </section>
    </main>
  );
}
