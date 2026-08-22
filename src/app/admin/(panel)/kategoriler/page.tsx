import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import KategoriListesi from "./KategoriListesi";

export const metadata: Metadata = { title: "Kategoriler" };
export const dynamic = "force-dynamic";

export default async function KategorilerSayfasi() {
  await adminGerekli();

  const kategoriler = await prisma.kategori.findMany({
    orderBy: { sira: "asc" },
    include: { _count: { select: { urunler: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-baslik text-4xl font-semibold">Kategoriler</h1>
      <p className="mt-2 text-murekkep-700">
        Ürünlerinizi grupladığınız başlıklar. Buradaki sıra, sitedeki filtre
        düğmelerinin sırasını belirler.
      </p>

      <div className="mt-8">
        <KategoriListesi
          kategoriler={kategoriler.map((k) => ({
            id: k.id,
            ad: k.ad,
            slug: k.slug,
            urunSayisi: k._count.urunler,
          }))}
        />
      </div>

      <div className="mt-10 rounded-2xl border border-parsomen-300 bg-parsomen-200/60 p-6 text-sm leading-relaxed text-murekkep-700">
        <p className="font-medium text-murekkep-900">Bilmeniz gerekenler</p>
        <ul className="mt-3 space-y-2">
          <li>
            · Kategori adına <strong>tıklayarak</strong> değiştirebilirsiniz.
            Enter ile kaydedin, Esc ile vazgeçin.
          </li>
          <li>
            · <strong>İçinde ürün olan kategori silinemez.</strong> Önce
            ürünleri başka bir kategoriye taşımanız gerekir — yoksa ürünler
            sahipsiz kalırdı.
          </li>
          <li>
            · Sitedeki filtrede <strong>yalnızca içinde yayında ürün olan</strong>{" "}
            kategoriler görünür. Boş kategoriler ziyaretçiye gösterilmez.
          </li>
          <li>
            · Ürün eklerken de listede olmayan bir kategori adı yazıp anında
            oluşturabilirsiniz.
          </li>
        </ul>
      </div>
    </div>
  );
}
