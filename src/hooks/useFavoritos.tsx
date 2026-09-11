"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface FavoritosContexto {
  ids: string[];
  pronto: boolean;
  estaFavorito: (id: string) => boolean;
  alternarFavorito: (id: string) => void;
}

const FavoritosCtx = createContext<FavoritosContexto | null>(null);
const CHAVE = "kalebe-favoritos";

export function FavoritosProvedor({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (salvo) setIds(JSON.parse(salvo) as string[]);
    } catch {
      setIds([]);
    } finally {
      setPronto(true);
    }
  }, []);

  useEffect(() => {
    if (!pronto) return;
    localStorage.setItem(CHAVE, JSON.stringify(ids));
  }, [ids, pronto]);

  const estaFavorito = useCallback(
    (id: string) => ids.includes(id),
    [ids]
  );

  const alternarFavorito = useCallback((id: string) => {
    setIds((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );
  }, []);

  const valor = useMemo(
    () => ({ ids, pronto, estaFavorito, alternarFavorito }),
    [ids, pronto, estaFavorito, alternarFavorito]
  );

  return (
    <FavoritosCtx.Provider value={valor}>{children}</FavoritosCtx.Provider>
  );
}

export function useFavoritos() {
  const ctx = useContext(FavoritosCtx);
  if (!ctx) {
    throw new Error("useFavoritos deve ser usado dentro de FavoritosProvedor");
  }
  return ctx;
}
