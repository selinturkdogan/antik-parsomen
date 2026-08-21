import Link from "next/link";

export default function BulunamadiSayfasi() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <p className="font-baslik text-7xl font-semibold text-parsomen-400">404</p>
      <h1 className="mt-4 font-baslik text-3xl font-semibold">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="mt-3 leading-relaxed text-murekkep-700">
        Sayfa taşınmış, kaldırılmış veya adres yanlış yazılmış olabilir.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-muhur-600 px-6 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700"
        >
          Ana Sayfaya Dön
        </Link>
        <Link
          href="/urunler"
          className="rounded-md border border-parsomen-400 px-6 py-3 text-sm font-medium text-murekkep-700 transition hover:border-murekkep-500 hover:bg-parsomen-50"
        >
          Ürünleri İncele
        </Link>
      </div>
    </main>
  );
}