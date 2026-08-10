import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REURB — Lote 3 Sergipe",
  description: "Cadastro habitacional REURB — Lote 3/Sergipe (OS nº 03/2026, SEASIC/SE)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
