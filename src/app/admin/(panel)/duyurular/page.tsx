import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { gelecekteMi, kisaTarih, tarihYaz } from "@/lib/tarih";
import { SilButonu, YayinAnahtari } from "./DuyuruIslemleri";

export const metadata: Metadata = { title: "Duyurular" };
export const dynamic = "force-dynamic";

export default async function AdminDuyurularSayfasi() {
  await adminGerekli();

  const duyurular = await prisma.duyuru.findMany({
    orderBy: [{ tarih: "desc" }, { olusturma: "desc" }],
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-baslik text-4xl font-semibold">
            Duyurular ve Etkinlikler
          </h1>
          <p className="mt-2 text-murekkep-700">
            {duyurular.length} kayıt.
          </p>
        </div>

        <Link
          href="/admin/duyurular/yeni"
          className="rounded-xl bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 shadow-kart transition hover:bg-muhur-700"
        >
          + Yeni Duyuru / Etkinlik
        </Link>
      </div>

      {duyurular.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-20 text-center">
          <p className="font-baslik text-xl font-semibold">Henüz kayıt yok</p>
          <p className="mt-2 text-sm text-murekkep-500">
            Atölye çalışması, sergi veya yeni ürün duyurusu ekleyin.
          </p>
          <Link
            href="/admin/duyurular/yeni"
            className="mt-6 inline-block rounded-xl bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700"
          >
            + Yeni Duyuru / Etkinlik
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {duyurular.map((d) => {
            const etkinlik = d.tur === "ETKINLIK";
            const yaklasan = etkinlik && d.tarih && gelecekteMi(d.tarih);

            return (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-parsomen-300 bg-parsomen-50 p-4 shadow-kart sm:flex-nowrap"
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-parsomen-300 bg-parsomen-200">
                  {d.kapakUrl ? (
                    <Image
                      src={d.kapakUrl}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        etkinlik
                          ? "bg-altin-500 text-parsomen-50"
                          : "bg-parsomen-200 text-murekkep-700"
                      }`}
                    >
                      {etkinlik ? "Etkinlik" : "Duyuru"}
                    </span>
                    {yaklasan && (
                      <span className="rounded-full bg-muhur-600/10 px-2.5 py-0.5 text-[10px] font-medium text-muhur-700">
                        Yaklaşan
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/admin/duyurular/${d.id}`}
                    className="mt-1 block truncate font-medium text-murekkep-900 transition hover:text-muhur-600"
                  >
                    {d.baslik}
                  </Link>

                  <p className="mt-0.5 truncate text-xs text-murekkep-500">
                    {d.tarih ? tarihYaz(d.tarih) : "Tarihsiz"}
                    {d.yer && ` · ${d.yer}`}
                    {` · eklendi ${kisaTarih(d.olusturma)}`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <YayinAnahtari id={d.id} deger={d.yayinda} />
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <Link
                    href={`/admin/duyurular/${d.id}`}
                    className="text-xs text-muhur-600 underline-offset-4 transition hover:underline"
                  >
                    Düzenle
                  </Link>
                  <SilButonu id={d.id} baslik={d.baslik} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
