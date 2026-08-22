import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { cikisYap } from "../actions";
import AdminMenu from "./AdminMenu";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim Paneli" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ASIL GÜVENLİK KONTROLÜ BURASI.
  // proxy.ts sadece çerezin varlığına bakar; burada imzası da doğrulanır.
  // Bu layout tüm panel sayfalarını sardığı için hiçbiri korumasız kalamaz.
  const oturum = await adminGerekli();

  const okunmamis = await prisma.mesaj.count({ where: { okundu: false } });

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ---------- Yan menü ---------- */}
      <aside className="border-b border-parsomen-300 bg-parsomen-200/60 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-5">
          <Link href="/admin" className="block px-2 py-2">
            <span className="block font-baslik text-xl font-semibold leading-none">
              Antik Parşömen
            </span>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-altin-500">
              Yönetim Paneli
            </span>
          </Link>

          <div className="mt-6">
            <AdminMenu okunmamis={okunmamis} />
          </div>

          <div className="mt-8 border-t border-parsomen-300 pt-5 lg:mt-auto">
            <p className="px-4 text-sm font-medium text-murekkep-900">
              {oturum.ad}
            </p>
            <p className="mt-0.5 truncate px-4 text-xs text-murekkep-500">
              {oturum.email}
            </p>

            <div className="mt-4 space-y-1">
              <Link
                href="/"
                target="_blank"
                className="block rounded-lg px-4 py-2 text-sm text-murekkep-700 transition hover:bg-parsomen-200"
              >
                Siteyi görüntüle ↗
              </Link>

              <form action={cikisYap}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-4 py-2 text-left text-sm text-muhur-600 transition hover:bg-muhur-600/10"
                >
                  Çıkış Yap
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- İçerik ---------- */}
      <main className="min-w-0 flex-1 px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}
