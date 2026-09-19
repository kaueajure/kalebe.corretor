import type { MetadataRoute } from "next";
import { TIPOS_SEO, MINIMO_INDEXAVEL_LOCAL } from "@/dados/seo";
import {
  listarBairrosComImoveis,
  listarCidadesComImoveis,
  listarCondominiosComImoveis,
  listarEntradasDoSitemap,
  listarImoveisPublicados,
} from "@/dados/imoveis";
import { criarSlug } from "@/lib/seo/slug";
import { empresa } from "@/dados/empresa";

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
    const [entradasImoveis, cidades, bairros, condominios, publicados] =
      await Promise.all([
        listarEntradasDoSitemap(),
        listarCidadesComImoveis(),
        listarBairrosComImoveis(),
        listarCondominiosComImoveis(),
        listarImoveisPublicados(),
      ]);

    const disponiveis = publicados.filter((item) => item.status === "disponivel");

    const mapaCidades = new Map(cidades.map((item) => [item.slug, item]));
    for (const nome of empresa.cidadesAtendimento) {
      const slug = criarSlug(nome);
      if (!mapaCidades.has(slug)) {
        mapaCidades.set(slug, {
          nome,
          slug,
          total: 0,
          atualizadoEm: new Date(0).toISOString(),
        });
      }
    }

    const entradasCidade: MetadataRoute.Sitemap = [];
    const entradasTipo: MetadataRoute.Sitemap = [];

    for (const cidade of mapaCidades.values()) {
      const daCidade = disponiveis.filter(
        (item) => item.cidade && criarSlug(item.cidade) === cidade.slug,
      );
      if (daCidade.length === 0) continue;

      const atualizadoCidade = daCidade.reduce(
        (acc, item) => (item.atualizadoEm > acc ? item.atualizadoEm : acc),
        daCidade[0].atualizadoEm,
      );
      entradasCidade.push({
        url: `${BASE}/imoveis/cidade/${cidade.slug}`,
        lastModified: atualizadoCidade,
      });

      for (const tipo of TIPOS_SEO) {
        const doTipo = daCidade.filter((item) => item.tipo === tipo.tipo);
        if (doTipo.length === 0) continue;
        const atualizadoTipo = doTipo.reduce(
          (acc, item) => (item.atualizadoEm > acc ? item.atualizadoEm : acc),
          doTipo[0].atualizadoEm,
        );
        entradasTipo.push({
          url: `${BASE}/imoveis/cidade/${cidade.slug}/${tipo.slug}`,
          lastModified: atualizadoTipo,
        });
      }
    }

    const entradasBairro = bairros
      .filter((item) => item.total >= MINIMO_INDEXAVEL_LOCAL)
      .map((item) => ({
        url: `${BASE}/imoveis/bairro/${item.slug}`,
        lastModified: item.atualizadoEm,
      }));

    const entradasCondominio = condominios
      .filter((item) => item.total >= MINIMO_INDEXAVEL_LOCAL)
      .map((item) => ({
        url: `${BASE}/imoveis/condominio/${item.slug}`,
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
