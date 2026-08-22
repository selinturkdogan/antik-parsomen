import type { Metadata } from "next";
import Link from "next/link";
import { adminGerekli } from "@/lib/yetki";
import DuyuruFormu from "../DuyuruFormu";

export const metadata: Metadata = { title: "Yeni Duyuru" };
export const dynamic = "force-dynamic";

export default async function YeniDuyuruSayfasi() {
  await adminGerekli();

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-murekkep-500">
        <Link href="/admin/duyurular" className="transition hover:text-muhur-600">
          Duyurular
        </Link>
        <span className="mx-2 text-parsomen-400">/</span>
        <span className="text-murekkep-700">Yeni</span>
      </nav>

      <h1 className="mt-4 font-baslik text-4xl font-semibold">
        Yeni Duyuru / Etkinlik
      </h1>
      <p className="mt-2 text-murekkep-700">
        Önce türünü seçin — etkinlikler sitede tarihe göre yaklaşan ve geçmiş
        olarak ayrılır.
      </p>

      <div className="mt-8">
        <DuyuruFormu />
      </div>
    </div>
  );
}
