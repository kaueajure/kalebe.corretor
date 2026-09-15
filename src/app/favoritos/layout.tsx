import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false, follow: false },
};

export default function LayoutFavoritos({ children }: { children: React.ReactNode }) {
  return children;
}
