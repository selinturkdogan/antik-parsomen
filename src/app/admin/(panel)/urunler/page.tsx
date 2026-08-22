import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { HizliAnahtar, SilButonu } from "./UrunIslemleri";

export const metadata: Metadata = { title: "Ürünler" };
export const dynamic = "force-dynamic";

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminUrunlerSayfasi() {
  await adminGerekli();

  const urunler = await prisma.urun.findMany({
    include: {
      kategori: true,
      gorseller: { orderBy: { sira: "asc" }, take: 1 },
      _count: { select: { gorseller: true } },
    },
    orderBy: { olusturma: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-baslik text-4xl font-semibold">Ürünler</h1>
          <p className="mt-2 text-murekkep-700">
            {urunler.length} ürün kayıtlı.
          </p>
        </div>

        <Link
          href="/admin/urunler/yeni"
          className="rounded-xl bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700"
        >
          + Yeni Ürün
        </Link>
      </div>

      {urunler.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-20 text-center">
          <p className="font-baslik text-xl font-semibold">Henüz ürün yok</p>
          <p className="mt-2 text-sm text-murekkep-500">
            İlk ürününüzü ekleyerek başlayın.
          </p>
          <Link
            href="/admin/urunler/yeni"
            className="mt-6 inline-block rounded-xl bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700"
          >
            + Yeni Ürün
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {urunler.map((u) => {
            const kapak = u.gorseller[0];

            return (
              <li
                key={u.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-parsomen-300 bg-parsomen-50 p-4 shadow-kart sm:flex-nowrap"
              >
                {/* Kapak */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-parsomen-300 bg-parsomen-200">
                  {kapak ? (
                    <Image
                      src={kapak.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-parsomen-400">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2.5" />
                        <circle cx="8.5" cy="9.5" r="1.5" />
                        <path d="M21 16l-5-5-4 4-2-2-7 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Bilgiler */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/urunler/${u.id}`}
                    className="block truncate font-medium text-murekkep-900 transition hover:text-muhur-600"
                  >
                    {u.ad}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-murekkep-500">
                    {u.kategori.ad} · {u._count.gorseller} fotoğraf ·{" "}
                    {tarihBicimi.format(u.olusturma)}
                  </p>
                </div>

                {/* Durum düğmeleri */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <HizliAnahtar
                    id={u.id}
                    alan="oneCikan"
                    deger={u.oneCikan}
                    etiket="Öne çıkan"
                  />
                  <HizliAnahtar
                    id={u.id}
                    alan="yayinda"
                    deger={u.yayinda}
                    etiket={u.yayinda ? "Yayında" : "Gizli"}
                  />
                </div>

                {/* İşlemler */}
                <div className="flex shrink-0 items-center gap-4">
                  <Link
                    href={`/admin/urunler/${u.id}`}
                    className="text-xs text-muhur-600 underline-offset-4 transition hover:underline"
                  >
                    Düzenle
                  </Link>
                  <SilButonu id={u.id} ad={u.ad} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
