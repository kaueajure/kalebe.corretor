"use server";

import { redirect } from "next/navigation";
import { limparSessao } from "@/lib/sessao";

export async function sairDaManutencao() {
  await limparSessao();
  redirect("/manutencao");
}
