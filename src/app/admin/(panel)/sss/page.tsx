import type { Metadata } from "next";
import { adminGerekli } from "@/lib/yetki";

export const metadata: Metadata = { title: "Sıkça Sorulan Sorular" };
export const dynamic = "force-dynamic";

export default async function Sayfa() {
  await adminGerekli();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-baslik text-4xl font-semibold">Sıkça Sorulan Sorular</h1>
      <p className="mt-3 text-murekkep-700">Ziyaretçilerin en çok sorduğu soruları düzenleyin.</p>

      <div className="mt-10 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-16 text-center">
        <p className="font-baslik text-xl font-semibold">Bu bölüm hazırlanıyor</p>
        <p className="mt-2 text-sm text-murekkep-500">
          Sıradaki adımlarda eklenecek.
        </p>
      </div>
    </div>
  );
}
