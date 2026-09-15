import type { MetadataRoute } from "next";
import { listarEntradasDoSitemap } from "@/dados/imoveis";

export const revalidate = 3600;

const BASE = "https://kalebecorretor.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/imoveis`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contato`, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const entradas = await listarEntradasDoSitemap();
    return [
      ...estaticas,
      ...entradas.map((item) => ({
        url: `${BASE}/imoveis/${item.slug}`,
        lastModified: item.atualizadoEm,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch (erro) {
    console.error("Não foi possível gerar as URLs dos imóveis no sitemap.", erro);
    return estaticas;
  }
}
