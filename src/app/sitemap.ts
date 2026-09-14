import type { MetadataRoute } from "next";
import { listarSlugsPublicados } from "@/dados/imoveis";
import { empreendimentos } from "@/dados/lancamentos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://kalebecorretor.com.br";

  const estaticas: MetadataRoute.Sitemap = [
    "",
    "/imoveis",
    "/lancamentos",
    "/sobre",
    "/contato",
    "/favoritos",
  ].map((rota) => ({
    url: `${base}${rota}`,
    changeFrequency: "weekly",
    priority: rota === "" ? 1 : 0.8,
  }));

  let dinamicasImoveis: MetadataRoute.Sitemap = [];
  try {
    const slugs = await listarSlugsPublicados();
    dinamicasImoveis = slugs.map((slug) => ({
      url: `${base}/imoveis/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    dinamicasImoveis = [];
  }

  const dinamicasLancamentos = empreendimentos.map((item) => ({
    url: `${base}/lancamentos/${item.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...estaticas, ...dinamicasImoveis, ...dinamicasLancamentos];
}
