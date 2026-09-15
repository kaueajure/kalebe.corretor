import type { FiltroImoveisEstado, Imovel } from "@/tipos/imovel";

export function formatarPreco(valor: number | null | undefined): string {
  if (valor == null) return "Sob consulta";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatarArea(valor: number | null | undefined): string {
  if (valor == null) return "—";
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²`;
}

export function formatarTipo(tipo: Imovel["tipo"]): string {
  const mapa: Record<Imovel["tipo"], string> = {
    casa: "Casa",
    apartamento: "Apartamento",
    terreno: "Terreno",
    comercial: "Comercial",
    sobrado: "Sobrado",
  };
  return mapa[tipo];
}

export function formatarLocalizacao(
  bairro?: string | null,
  cidade?: string | null,
  estado?: string | null
): string {
  const cidadeEstado = [cidade, estado].filter(Boolean).join("/");
  return [bairro, cidadeEstado].filter(Boolean).join(" · ");
}

export function formatarStatus(status: Imovel["status"]): string {
  const rotulos: Record<Imovel["status"], string> = {
    disponivel: "Disponível",
    reservado: "Reservado",
    em_negociacao: "Em negociação",
    vendido: "Vendido",
    indisponivel: "Indisponível",
  };
  return rotulos[status];
}

export function linkWhatsApp(numero: string, mensagem?: string): string {
  const base = `https://wa.me/${numero}`;
  if (!mensagem) return base;
  return `${base}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemInteresseImovel(imovel: Imovel): string {
  const preco = imovel.preco != null ? ` — ${formatarPreco(imovel.preco)}` : "";
  return `Olá! Tenho interesse no imóvel ${imovel.titulo} (${imovel.codigo})${preco}.`;
}

export const filtroInicial: FiltroImoveisEstado = {
  tipo: "",
  cidade: "",
  bairro: "",
  precoMin: "",
  precoMax: "",
  quartos: "",
  banheiros: "",
  vagas: "",
  areaMin: "",
  busca: "",
};

export function filtrarImoveis(
  lista: Imovel[],
  filtro: FiltroImoveisEstado
): Imovel[] {
  return lista.filter((imovel) => {
    if (filtro.tipo && imovel.tipo !== filtro.tipo) return false;
    if (filtro.cidade && imovel.cidade !== filtro.cidade) return false;
    if (filtro.bairro && imovel.bairro !== filtro.bairro) return false;

    if (filtro.precoMin) {
      const min = Number(filtro.precoMin);
      if (imovel.preco == null || imovel.preco < min) return false;
    }
    if (filtro.precoMax) {
      const max = Number(filtro.precoMax);
      if (imovel.preco == null || imovel.preco > max) return false;
    }
    if (filtro.quartos) {
      const q = Number(filtro.quartos);
      if ((imovel.quartos ?? 0) < q) return false;
    }
    if (filtro.banheiros) {
      const b = Number(filtro.banheiros);
      if ((imovel.banheiros ?? 0) < b) return false;
    }
    if (filtro.vagas) {
      const v = Number(filtro.vagas);
      if ((imovel.vagas ?? 0) < v) return false;
    }
    if (filtro.areaMin) {
      const a = Number(filtro.areaMin);
      if ((imovel.area ?? 0) < a) return false;
    }
    if (filtro.busca) {
      const termo = filtro.busca.toLowerCase();
      const texto = [
        imovel.titulo,
        imovel.bairro ?? "",
        imovel.cidade ?? "",
        imovel.codigo,
        imovel.descricao,
      ]
        .join(" ")
        .toLowerCase();
      if (!texto.includes(termo)) return false;
    }
    return true;
  });
}

export function filtroParaQuery(
  filtro: Partial<FiltroImoveisEstado>
): string {
  const params = new URLSearchParams();
  Object.entries(filtro).forEach(([chave, valor]) => {
    if (valor) params.set(chave, String(valor));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}
