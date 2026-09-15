import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/primeiro-acesso", "/painel", "/api/", "/favoritos"],
    },
    sitemap: "https://kalebecorretor.com.br/sitemap.xml",
  };
}
