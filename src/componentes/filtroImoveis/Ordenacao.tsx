"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
export function Ordenacao() {
  const router = useRouter();
  const params = useSearchParams();
  const [pendente, iniciar] = useTransition();
  return <label className="ordenacao">Ordenar por <select aria-label="Ordenar imóveis" value={params.get("ordem") || "relevancia"} disabled={pendente} onChange={(e) => { const query = new URLSearchParams(params); query.set("ordem", e.target.value); iniciar(() => router.push(`/imoveis?${query}`, { scroll: false })); }}><option value="relevancia">Destaques</option><option value="menor-preco">Menor preço</option><option value="maior-preco">Maior preço</option><option value="recentes">Mais recentes</option></select></label>;
}
