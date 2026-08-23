import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import SoruListesi from "./SoruListesi";

export const metadata: Metadata = { title: "Sıkça Sorulan Sorular" };
export const dynamic = "force-dynamic";

export default async function AdminSSSSayfasi() {
  await adminGerekli();

  const sorular = await prisma.soruCevap.findMany({
    orderBy: { sira: "asc" },
  });

  const yayindaOlan = sorular.filter((s) => s.yayinda).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-baslik text-4xl font-semibold">
            Sıkça Sorulan Sorular
          </h1>
          <p className="mt-2 text-murekkep-700">
            {sorular.length} soru · {yayindaOlan} tanesi yayında
          </p>
        </div>

        <Link
          href="/sss"
          target="_blank"
          className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
        >
          Sayfayı gör ↗
        </Link>
      </div>

      <div className="mt-8">
        <SoruListesi
          sorular={sorular.map((s) => ({
            id: s.id,
            soru: s.soru,
            cevap: s.cevap,
            yayinda: s.yayinda,
          }))}
        />
      </div>

      <div className="mt-10 rounded-2xl border border-parsomen-300 bg-parsomen-200/60 p-6 text-sm leading-relaxed text-murekkep-700">
        <p className="font-medium text-murekkep-900">İpucu</p>
        <p className="mt-2">
          Müşterilerinizin size en çok sorduğu şeyleri buraya ekleyin. İyi bir
          S.S.S. hem ziyaretçinin işini kolaylaştırır hem de size gelen aynı
          soruları azaltır. Sıralamayı oklarla değiştirebilir, en çok sorulanı
          en üste alabilirsiniz.
        </p>
      </div>
    </div>
  );
}
