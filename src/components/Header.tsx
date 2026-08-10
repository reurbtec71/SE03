"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const tabs = [
    { href: "/", label: "📋 Cadastros" },
    { href: "/dashboard", label: "📊 Dashboard" },
  ];

  return (
    <div className="bg-white border-b">
      <div className="flex items-center justify-between px-6 py-3 bg-navy text-white">
        <div>
          <h1 className="font-bold text-lg leading-tight">{title}</h1>
          <p className="text-xs text-bluegray">
            Lote 3 · Sergipe · OS nº 03/2026 — SEASIC/SE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/novo"
            className="btn-accent rounded-md px-3 py-1.5 text-sm font-semibold"
          >
            + Novo
          </Link>
          <a
            href="/api/export"
            className="bg-white/10 hover:bg-white/20 rounded-md px-3 py-1.5 text-sm font-semibold"
          >
            ↓ Exportar
          </a>
          <button
            onClick={sair}
            className="bg-white/10 hover:bg-white/20 rounded-md px-3 py-1.5 text-sm font-semibold"
          >
            Sair
          </button>
        </div>
      </div>
      <div className="flex gap-1 px-6 pt-2">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              pathname === t.href
                ? "border-orange text-navy"
                : "border-transparent text-gray-500 hover:text-navy"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
