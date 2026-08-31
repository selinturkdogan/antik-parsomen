"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Kategori = { id: string; ad: string; slug: string };

export default function UrunFiltre({ kategoriler }: { kategoriler: Kategori[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mevcutArama = searchParams.get("q") ?? "";
  const mevcutKategori = searchParams.get("kategori") ?? "";

  const [arama, setArama] = useState(mevcutArama);

  // Kullanıcı her harfte değil, yazmayı bıraktıktan 300ms sonra arasın.
  useEffect(() => {
    if (arama === mevcutArama) return;

    const zamanlayici = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString());
      if (arama.trim()) p.set("q", arama.trim());
      else p.delete("q");
      // Arama değişti: 3. sayfada kalırsak boş liste görünebilir
      p.delete("sayfa");
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(zamanlayici);
  }, [arama, mevcutArama, pathname, router, searchParams]);

  function kategoriSec(slug: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (slug) p.set("kategori", slug);
    else p.delete("kategori");
    p.delete("sayfa"); // yeni filtrede baştan başla
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }

  return (
    <div>
      {/* ---------------- Arama kutusu ----------------
          type="search" yerine type="text" kullanıyoruz: Safari, arama
          alanlarına kendi yerleşimini dayatıp iç boşlukları yok sayıyor.
          Temizleme düğmesini zaten kendimiz koyuyoruz. */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-murekkep-500"
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>

        <input
          type="text"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ürün adı veya açıklamasında ara..."
          aria-label="Ürünlerde ara"
          className="h-14 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-50 pl-14 pr-12 text-[15px] text-murekkep-900 outline-none transition placeholder:text-murekkep-500 focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10"
        />

        {arama && (
          <button
            type="button"
            onClick={() => setArama("")}
            aria-label="Aramayı temizle"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-murekkep-500 transition hover:bg-parsomen-200 hover:text-murekkep-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* ---------------- Kategori düğmeleri ---------------- */}
      <div className="mt-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-murekkep-500">
          Kategori
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            onClick={() => kategoriSec("")}
            className={`rounded-full border px-5 py-2.5 text-sm transition duration-150 ${
              mevcutKategori === ""
                ? "border-muhur-600 bg-muhur-600 text-parsomen-50 shadow-kart"
                : "border-parsomen-300 bg-parsomen-50 text-murekkep-700 hover:border-murekkep-500 hover:text-murekkep-900"
            }`}
          >
            Tümü
          </button>

          {kategoriler.map((k) => (
            <button
              key={k.id}
              onClick={() => kategoriSec(k.slug)}
              className={`rounded-full border px-5 py-2.5 text-sm transition duration-150 ${
                mevcutKategori === k.slug
                  ? "border-muhur-600 bg-muhur-600 text-parsomen-50 shadow-kart"
                  : "border-parsomen-300 bg-parsomen-50 text-murekkep-700 hover:border-murekkep-500 hover:text-murekkep-900"
              }`}
            >
              {k.ad}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
