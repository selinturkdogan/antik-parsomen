import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import UrunFormu from "../UrunFormu";

export const metadata: Metadata = { title: "Yeni Ürün" };
export const dynamic = "force-dynamic";

export default async function YeniUrunSayfasi() {
  await adminGerekli();

  const kategoriler = await prisma.kategori.findMany({
    orderBy: { sira: "asc" },
    select: { id: true, ad: true },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-murekkep-500">
        <Link href="/admin/urunler" className="transition hover:text-muhur-600">
          Ürünler
        </Link>
        <span className="mx-2 text-parsomen-400">/</span>
        <span className="text-murekkep-700">Yeni Ürün</span>
      </nav>

      <h1 className="mt-4 font-baslik text-4xl font-semibold">Yeni Ürün</h1>
      <p className="mt-2 text-murekkep-700">
        Ürün bilgilerini doldurun ve fotoğraflarını ekleyin.
      </p>

      <div className="mt-8">
        <UrunFormu kategoriler={kategoriler} />
      </div>
    </div>
  );
}
