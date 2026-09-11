import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Cabecalho } from "@/componentes/cabecalho/Cabecalho";
import { Rodape } from "@/componentes/rodape/Rodape";
import { FavoritosProvedor } from "@/hooks/useFavoritos";
import { empresa } from "@/dados/empresa";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kalebecorretor.com.br"),
  title: {
    default: `${empresa.nome} | Imóveis em ${empresa.cidade}`,
    template: `%s | ${empresa.nome}`,
  },
  description: `Imóveis à venda e lançamentos em ${empresa.regiao}. Atendimento com ${empresa.creci}.`,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: empresa.nome,
    title: `${empresa.nome} | Imóveis em ${empresa.cidade}`,
    description: `Imóveis prontos e lançamentos em ${empresa.regiao}.`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <FavoritosProvedor>
          <Cabecalho />
          <main className="pagina">{children}</main>
          <Rodape />
        </FavoritosProvedor>
      </body>
    </html>
  );
}
