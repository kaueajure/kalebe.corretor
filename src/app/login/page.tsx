import { redirect } from "next/navigation";
import { FormularioLogin } from "@/componentes/painel/FormularioLogin";
import { lerSessao } from "@/lib/sessao";
import estilos from "./login.module.css";

export default async function PaginaLogin() {
  const sessao = await lerSessao();
  if (sessao) {
    redirect("/painel");
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.caixa}>
        <h1 className={estilos.marca}>Kalebe Corretor</h1>
        <p className={estilos.subtitulo}>Acesso ao painel administrativo</p>
        <FormularioLogin />
      </div>
    </div>
  );
}
