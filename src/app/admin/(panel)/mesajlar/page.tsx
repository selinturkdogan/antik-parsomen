import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import { tarihYaz } from "@/lib/tarih";
import MesajKarti from "./MesajKarti";
import { tumunuOkunduYap } from "./actions";

export const metadata: Metadata = { title: "Gelen Mesajlar" };
export const dynamic = "force-dynamic";

export default async function MesajlarSayfasi() {
  await adminGerekli();

  const mesajlar = await prisma.mesaj.findMany({
    orderBy: { olusturma: "desc" },
  });

  const okunmamis = mesajlar.filter((m) => !m.okundu).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-baslik text-4xl font-semibold">Gelen Mesajlar</h1>
          <p className="mt-2 text-murekkep-700">
            {mesajlar.length} mesaj
            {okunmamis > 0 && (
              <>
                {" · "}
                <span className="font-medium text-muhur-600">
                  {okunmamis} okunmamış
                </span>
              </>
            )}
          </p>
        </div>

        {okunmamis > 0 && (
          <form action={tumunuOkunduYap}>
            <button
              type="submit"
              className="rounded-xl border border-parsomen-400 px-5 py-2.5 text-sm text-murekkep-700 transition hover:bg-parsomen-200"
            >
              Tümünü okundu yap
            </button>
          </form>
        )}
      </div>

      {mesajlar.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-20 text-center">
          <p className="font-baslik text-xl font-semibold">Henüz mesaj yok</p>
          <p className="mt-2 text-sm text-murekkep-500">
            İletişim formundan gelen mesajlar burada listelenir.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {mesajlar.map((m) => (
            <MesajKarti
              key={m.id}
              mesaj={{
                id: m.id,
                adSoyad: m.adSoyad,
                email: m.email,
                konu: m.konu,
                icerik: m.icerik,
                okundu: m.okundu,
                tarihYazisi: tarihYaz(m.olusturma),
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
