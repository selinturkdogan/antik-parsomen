import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGerekli } from "@/lib/yetki";
import AyarFormu from "./AyarFormu";

export const metadata: Metadata = { title: "Site Bilgileri" };
export const dynamic = "force-dynamic";

export default async function AyarlarSayfasi() {
  await adminGerekli();

  const ayar = await prisma.siteAyar.findUnique({ where: { id: "tek" } });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-baslik text-4xl font-semibold">Site Bilgileri</h1>
          <p className="mt-2 text-murekkep-700">
            Telefon, adres, sosyal medya ve Hakkımızda metinleri.
          </p>
        </div>

        <Link
          href="/iletisim"
          target="_blank"
          className="text-sm text-muhur-600 underline-offset-4 transition hover:underline"
        >
          İletişim sayfasını gör ↗
        </Link>
      </div>

      <div className="mt-8">
        <AyarFormu
          ayar={
            ayar
              ? {
                  telefon: ayar.telefon,
                  whatsapp: ayar.whatsapp,
                  email: ayar.email,
                  adres: ayar.adres,
                  mapsUrl: ayar.mapsUrl,
                  calismaSaatleri: ayar.calismaSaatleri,
                  instagram: ayar.instagram,
                  facebook: ayar.facebook,
                  youtube: ayar.youtube,
                  sahipAdi: ayar.sahipAdi,
                  sahipBiyografi: ayar.sahipBiyografi,
                  hikaye: ayar.hikaye,
                  malzemeBilgi: ayar.malzemeBilgi,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
