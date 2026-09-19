import type { Metadata } from "next";
import { Bricolage_Grotesque, Source_Sans_3 } from "next/font/google";
import { headers } from "next/headers";
import { ShellSite } from "@/componentes/shell/ShellSite";
import { DadosEstruturados } from "@/componentes/seo/DadosEstruturados";
import { FavoritosProvedor } from "@/hooks/useFavoritos";
import { empresa } from "@/dados/empresa";
import {
  schemaOrganization,
  schemaWebSite,
} from "@/lib/seo/dados-estruturados";
import { IMAGEM_OG_PADRAO } from "@/lib/seo/metadata";
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

const verificacaoGoogle = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL("https://kalebecorretor.com.br"),
  title: {
    default: `Corretor de Imóveis em ${empresa.cidade} | ${empresa.nomeCurto}`,
    template: `%s | ${empresa.nomeCurto}`,
  },
  description: `Encontre casas, apartamentos, sobrados e terrenos à venda em São José do Rio Preto, Mirassol e Bady Bassitt. Atendimento direto com Kalebe, corretor ${empresa.creci}.`,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: empresa.nome,
    images: [
      {
        url: IMAGEM_OG_PADRAO,
        alt: `${empresa.nome} — corretor de imóveis em ${empresa.cidade}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  ...(verificacaoGoogle
    ? { verification: { google: verificacaoGoogle } }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${corpo.variable}`}>
        <DadosEstruturados
          nonce={nonce}
          dados={[schemaWebSite(), schemaOrganization()]}
        />
        <FavoritosProvedor>
          <ShellSite>{children}</ShellSite>
        </FavoritosProvedor>
      </body>
    </html>
  );
}
