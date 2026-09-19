import { serializarJsonLd } from "@/lib/seo/dados-estruturados";

interface Props {
  dados: unknown | unknown[];
  nonce?: string;
}

export function DadosEstruturados({ dados, nonce }: Props) {
  const lista = Array.isArray(dados) ? dados : [dados];
  return (
    <>
      {lista.map((item, indice) => (
        <script
          // Índice estável: cada página monta a lista em ordem fixa.
          key={indice}
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(item) }}
        />
      ))}
    </>
  );
}
