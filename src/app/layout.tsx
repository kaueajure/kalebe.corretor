import type { Metadata } from "next";
import { Bricolage_Grotesque, Source_Sans_3 } from "next/font/google";
import { ShellSite } from "@/componentes/shell/ShellSite";
import { FavoritosProvedor } from "@/hooks/useFavoritos";
import { empresa } from "@/dados/empresa";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const corpo = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kalebecorretor.com.br"),
  title: {
    default: `${empresa.nome} | Imóveis em ${empresa.cidade}`,
    template: `%s | ${empresa.nome}`,
  },
  description: `Casas, apartamentos e lançamentos em ${empresa.regiao}. Atendimento direto com o Kalebe, ${empresa.creci}.`,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: empresa.nome,
    title: `${empresa.nome} | Imóveis em ${empresa.cidade}`,
    description: `Imóveis à venda e lançamentos do Minha Casa Minha Vida em ${empresa.regiao}.`,
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
      <body className={`${display.variable} ${corpo.variable}`}>
        <FavoritosProvedor>
          <ShellSite>{children}</ShellSite>
        </FavoritosProvedor>
      </body>
    </html>
  );
}
