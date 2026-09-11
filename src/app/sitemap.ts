import type { MetadataRoute } from "next";
import { imoveis } from "@/dados/imoveis";
import { empreendimentos } from "@/dados/lancamentos";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const dinamicasImoveis = imoveis.map((imovel) => ({
    url: `${base}/imoveis/${imovel.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const dinamicasLancamentos = empreendimentos.map((item) => ({
    url: `${base}/lancamentos/${item.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...estaticas, ...dinamicasImoveis, ...dinamicasLancamentos];
}
