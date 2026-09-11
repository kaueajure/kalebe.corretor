import Link from "next/link";
import estilos from "./atalhosFinalidade.module.css";

const atalhos = [
  {
    titulo: "Comprar",
    texto: "Casas e apartamentos à venda em Rio Preto e região.",
    href: "/imoveis?finalidade=venda",
  },
  {
    titulo: "Alugar",
    texto: "Opções de locação quando disponíveis no portfólio.",
    href: "/imoveis?finalidade=aluguel",
  },
  {
    titulo: "Lançamentos",
    texto: "Empreendimentos na planta e Minha Casa Minha Vida.",
    href: "/lancamentos",
  },
];

export function AtalhosFinalidade() {
  return (
    <div className={estilos.grade}>
      {atalhos.map((item) => (
        <Link key={item.href} href={item.href} className={estilos.card}>
          <h3>{item.titulo}</h3>
          <p>{item.texto}</p>
          <span>Ver opções</span>
        </Link>
      ))}
    </div>
  );
}
