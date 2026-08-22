import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { turAdi } from "@/lib/galeri";
import { kisaTarih } from "@/lib/tarih";
import { SilButonu, YayinAnahtari } from "./AlbumIslemleri";

export const metadata: Metadata = { title: "Galeri" };
export const dynamic = "force-dynamic";

export default async function AdminGaleriSayfasi() {
  await adminGerekli();

  const albumler = await prisma.galeriAlbum.findMany({
    orderBy: [{ tarih: "desc" }, { olusturma: "desc" }],
    include: {
      fotolar: { orderBy: { sira: "asc" }, take: 1 },
      _count: { select: { fotolar: true } },
    },
  });

  const toplamFoto = albumler.reduce((t, a) => t + a._count.fotolar, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-baslik text-4xl font-semibold">Galeri</h1>
          <p className="mt-2 text-murekkep-700">
            {albumler.length} albüm · {toplamFoto} fotoğraf
          </p>
        </div>

        <Link
          href="/admin/galeri/yeni"
          className="rounded-xl bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700"
        >
          + Yeni Albüm
        </Link>
      </div>

      {albumler.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-20 text-center">
          <p className="font-baslik text-xl font-semibold">Henüz albüm yok</p>
          <p className="mt-2 text-sm text-murekkep-500">
            Bir etkinliğin veya atölye çalışmasının fotoğraflarını albüm olarak
            ekleyin.
          </p>
          <Link
            href="/admin/galeri/yeni"
            className="mt-6 inline-block rounded-xl bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700"
          >
            + Yeni Albüm
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {albumler.map((a) => {
            const kapak = a.fotolar[0];

            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-parsomen-300 bg-parsomen-50 p-4 shadow-kart sm:flex-nowrap"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-parsomen-300 bg-parsomen-200">
                  {kapak ? (
                    <Image
                      src={kapak.url}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
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

                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-parsomen-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-murekkep-700">
                    {turAdi(a.tur)}
                  </span>

                  <Link
                    href={`/admin/galeri/${a.id}`}
                    className="mt-1 block truncate font-medium text-murekkep-900 transition hover:text-muhur-600"
                  >
                    {a.ad}
                  </Link>

                  <p className="mt-0.5 truncate text-xs text-murekkep-500">
                    {a._count.fotolar} fotoğraf
                    {a.tarih && ` · ${kisaTarih(a.tarih)}`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <YayinAnahtari id={a.id} deger={a.yayinda} />
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <Link
                    href={`/admin/galeri/${a.id}`}
                    className="text-xs text-muhur-600 underline-offset-4 transition hover:underline"
                  >
                    Düzenle
                  </Link>
                  <SilButonu
                    id={a.id}
                    ad={a.ad}
                    fotoSayisi={a._count.fotolar}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
