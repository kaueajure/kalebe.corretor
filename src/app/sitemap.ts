import type { MetadataRoute } from "next";
import { MINIMO_INDEXAVEL_LOCAL } from "@/dados/seo";
import {
  listarBairrosComImoveis,
  listarCidadesComImoveis,
  listarCidadesTiposComImoveis,
  listarCondominiosComImoveis,
  listarEntradasDoSitemap,
} from "@/dados/imoveis";

export const revalidate = 3600;

const BASE = "https://kalebecorretor.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE },
    { url: `${BASE}/imoveis` },
    { url: `${BASE}/sobre` },
    { url: `${BASE}/contato` },
  ];

  try {
    const [entradasImoveis, cidades, cidadesTipos, bairros, condominios] =
      await Promise.all([
        listarEntradasDoSitemap(),
        listarCidadesComImoveis(),
        listarCidadesTiposComImoveis(),
        listarBairrosComImoveis(),
        listarCondominiosComImoveis(),
      ]);

    const entradasCidade = cidades
      .filter((item) => item.total > 0)
      .map((item) => ({
        url: `${BASE}/imoveis/cidade/${item.slug}`,
        lastModified: item.atualizadoEm,
      }));

    const entradasTipo = cidadesTipos
      .filter((item) => item.total > 0)
      .map((item) => ({
        url: `${BASE}/imoveis/cidade/${item.slugCidade}/${item.slugTipo}`,
        lastModified: item.atualizadoEm,
      }));

    const entradasBairro = bairros
      .filter((item) => item.total >= MINIMO_INDEXAVEL_LOCAL)
      .map((item) => ({
        url: `${BASE}/imoveis/bairro/${item.slugCidade}/${item.slug}`,
        lastModified: item.atualizadoEm,
      }));

    const entradasCondominio = condominios
      .filter((item) => item.total >= MINIMO_INDEXAVEL_LOCAL)
      .map((item) => ({
        url: `${BASE}/imoveis/condominio/${item.slugCidade}/${item.slug}`,
        lastModified: item.atualizadoEm,
      }));

    return [
      ...estaticas,
      ...entradasCidade,
      ...entradasTipo,
      ...entradasBairro,
      ...entradasCondominio,
      ...entradasImoveis.map((item) => ({
        url: `${BASE}/imoveis/${item.slug}`,
        lastModified: item.atualizadoEm,
      })),
    ];
  } catch (erro) {
    console.error("Não foi possível gerar as URLs do sitemap.", erro);
    return estaticas;
  }
}
