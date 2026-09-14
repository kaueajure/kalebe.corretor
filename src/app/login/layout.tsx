import type { Metadata } from "next";
import estilos from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LayoutLogin({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={estilos.envolve}>{children}</div>;
}
