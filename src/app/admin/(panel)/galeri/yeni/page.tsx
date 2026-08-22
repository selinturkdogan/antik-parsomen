import type { Metadata } from "next";
import Link from "next/link";
import { adminGerekli } from "@/lib/yetki";
import AlbumFormu from "../AlbumFormu";

export const metadata: Metadata = { title: "Yeni Albüm" };
export const dynamic = "force-dynamic";

export default async function YeniAlbumSayfasi() {
  await adminGerekli();

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="text-sm text-murekkep-500">
        <Link href="/admin/galeri" className="transition hover:text-muhur-600">
          Galeri
        </Link>
        <span className="mx-2 text-parsomen-400">/</span>
        <span className="text-murekkep-700">Yeni Albüm</span>
      </nav>

      <h1 className="mt-4 font-baslik text-4xl font-semibold">Yeni Albüm</h1>
      <p className="mt-2 text-murekkep-700">
        Bir etkinliğin, atölye çalışmasının veya üretim sürecinin
        fotoğraflarını tek başlık altında toplayın.
      </p>

      <div className="mt-8">
        <AlbumFormu />
      </div>
    </div>
  );
}
