import type { Metadata } from "next";
import { Source_Serif_4, Plus_Jakarta_Sans } from "next/font/google";
import { ShellSite } from "@/componentes/shell/ShellSite";
import { FavoritosProvedor } from "@/hooks/useFavoritos";
import { empresa } from "@/dados/empresa";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
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
      <body className={`${sourceSerif.variable} ${jakarta.variable}`}>
        <FavoritosProvedor>
          <ShellSite>{children}</ShellSite>
        </FavoritosProvedor>
      </body>
    </html>
  );
}
