"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { ad: "Kontrol Paneli", yol: "/admin" },
  { ad: "Ürünler", yol: "/admin/urunler" },
  { ad: "Duyurular", yol: "/admin/duyurular" },
  { ad: "Galeri", yol: "/admin/galeri" },
  { ad: "S.S.S.", yol: "/admin/sss" },
  { ad: "Mesajlar", yol: "/admin/mesajlar" },
  { ad: "Site Bilgileri", yol: "/admin/ayarlar" },
];

export default function AdminMenu({ okunmamis }: { okunmamis: number }) {
  const pathname = usePathname();

  const aktifMi = (yol: string) =>
    yol === "/admin" ? pathname === "/admin" : pathname.startsWith(yol);

  return (
    <nav className="space-y-1">
      {menu.map((m) => (
        <Link
          key={m.yol}
          href={m.yol}
          className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition ${
            aktifMi(m.yol)
              ? "bg-muhur-600 font-medium text-parsomen-50"
              : "text-murekkep-700 hover:bg-parsomen-200"
          }`}
        >
          {m.ad}
          {m.yol === "/admin/mesajlar" && okunmamis > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                aktifMi(m.yol)
                  ? "bg-parsomen-50 text-muhur-600"
                  : "bg-muhur-600 text-parsomen-50"
              }`}
            >
              {okunmamis}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
