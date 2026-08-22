import type { Metadata } from "next";
import { adminGerekli } from "@/lib/yetki";

export const metadata: Metadata = { title: "Duyurular ve Etkinlikler" };
export const dynamic = "force-dynamic";

export default async function Sayfa() {
  await adminGerekli();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-baslik text-4xl font-semibold">Duyurular ve Etkinlikler</h1>
      <p className="mt-3 text-murekkep-700">Atölye, sergi ve kermes duyurularını yönetin.</p>

      <div className="mt-10 rounded-2xl border border-dashed border-parsomen-400 bg-parsomen-50 px-6 py-16 text-center">
        <p className="font-baslik text-xl font-semibold">Bu bölüm hazırlanıyor</p>
        <p className="mt-2 text-sm text-murekkep-500">
          Sıradaki adımlarda eklenecek.
        </p>
      </div>
    </div>
  );
}
