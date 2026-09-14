import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/painel"],
    },
    sitemap: "https://kalebecorretor.com.br/sitemap.xml",
  };
}
