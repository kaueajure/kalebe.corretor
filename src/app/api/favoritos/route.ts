import { NextResponse } from "next/server";
import { listarImoveisPorIds } from "@/lib/imoveis/publico";

export async function GET(requisicao: Request) {
  const { searchParams } = new URL(requisicao.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const imoveis = await listarImoveisPorIds(ids);
  return NextResponse.json(imoveis);
}
