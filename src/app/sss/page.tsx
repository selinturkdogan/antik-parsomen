import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
};

// Her ziyarette veritabanından taze veri oku.
// Bu satır olmasaydı sayfa bir kez oluşturulup dondurulurdu ve
// panelden eklediğiniz yeni soru sitede hiç görünmezdi.
export const dynamic = "force-dynamic";

export default async function SSSSayfasi() {
  const sorular = await prisma.soruCevap.findMany({
    where: { yayinda: true }, // gizlenenler gelmesin
    orderBy: { sira: "asc" }, // panelden verdiğiniz sıraya göre
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-muhur-600">
        Yardım
      </p>
      <h1 className="mt-3 font-baslik text-5xl font-semibold">
        Sıkça Sorulan Sorular
      </h1>
      <p className="mt-4 leading-relaxed text-murekkep-700">
        Aklınıza takılan bir soru mu var? En çok merak edilenleri aşağıda
        yanıtladık.
      </p>

      {sorular.length === 0 ? (
        <p className="mt-12 rounded-lg border border-parsomen-300 bg-parsomen-50 p-10 text-center text-murekkep-500">
          Henüz soru eklenmemiş.
        </p>
      ) : (
        <div className="mt-10 space-y-3">
          {sorular.map((s) => (
            <details
              key={s.id}
              className="group rounded-lg border border-parsomen-300 bg-parsomen-50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-baslik text-xl font-semibold [&::-webkit-details-marker]:hidden">
                {s.soru}
                <svg
                  className="shrink-0 text-muhur-600 transition-transform duration-200 group-open:rotate-45"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="border-t border-parsomen-200 px-6 py-5 leading-relaxed text-murekkep-700">
                {s.cevap}
              </p>
            </details>
          ))}
        </div>
      )}

      <div className="mt-14 rounded-lg border border-parsomen-300 bg-parsomen-200 p-8 text-center">
        <h2 className="font-baslik text-2xl font-semibold">
          Cevabını bulamadınız mı?
        </h2>
        <p className="mt-2 text-murekkep-700">
          Bize doğrudan yazın, en kısa sürede dönüş yapalım.
        </p>
        <Link
          href="/iletisim"
          className="mt-5 inline-block rounded-md bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700"
        >
          İletişime Geç
        </Link>
      </div>
    </main>
  );
}