import Link from "next/link";

const menu = [
  { ad: "Ana Sayfa", yol: "/" },
  { ad: "Hakkımızda", yol: "/hakkimizda" },
  { ad: "Ürünler", yol: "/urunler" },
  { ad: "Duyurular", yol: "/duyurular" },
  { ad: "Galeri", yol: "/galeri" },
  { ad: "S.S.S.", yol: "/sss" },
  { ad: "İletişim", yol: "/iletisim" },
];

export default function Footer() {
  const yil = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-parsomen-300 bg-parsomen-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. sütun — logo ve açıklama */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-baslik text-2xl font-semibold">Antik Parşömen</p>
          <p className="mt-3 text-sm leading-relaxed text-murekkep-700">
            El yapımı parşömen sanatı, hat ve kaligrafi ile hazırlanan kişiye
            özel tasarımlar.
          </p>
        </div>

        {/* 2. sütun — hızlı menü */}
        <div>
          <h3 className="font-baslik text-lg font-semibold">Hızlı Menü</h3>
          <ul className="mt-4 space-y-2">
            {menu.map((m) => (
              <li key={m.yol}>
                <Link
                  href={m.yol}
                  className="text-sm text-murekkep-700 transition hover:text-muhur-600"
                >
                  {m.ad}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. sütun — iletişim */}
        <div>
          <h3 className="font-baslik text-lg font-semibold">İletişim</h3>
          <ul className="mt-4 space-y-2 text-sm text-murekkep-700">
            <li>Telefon: —</li>
            <li>E-posta: —</li>
            <li>Adres: —</li>
          </ul>
          <p className="mt-3 text-xs text-murekkep-500">
            Bu bilgiler ileride admin panelinden düzenlenecek.
          </p>
        </div>

        {/* 4. sütun — çalışma saatleri */}
        <div>
          <h3 className="font-baslik text-lg font-semibold">Çalışma Saatleri</h3>
          <ul className="mt-4 space-y-2 text-sm text-murekkep-700">
            <li>Pazartesi – Cuma: —</li>
            <li>Cumartesi: —</li>
            <li>Pazar: —</li>
          </ul>
        </div>
      </div>

      {/* Alt şerit — telif hakkı */}
      <div className="border-t border-parsomen-300">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <p className="text-xs text-murekkep-500">
            © {yil} Antik Parşömen. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}