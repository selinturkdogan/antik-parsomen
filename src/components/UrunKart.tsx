import Image from "next/image";
import Link from "next/link";

type Props = {
  urun: {
    slug: string;
    ad: string;
    aciklama: string;
    oneCikan: boolean;
    olusturma: Date;
    kategori: { ad: string };
    gorseller: { url: string; alt: string | null }[];
  };
};

const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function UrunKart({ urun }: Props) {
  const kapak = urun.gorseller[0];

  return (
    <Link
      href={`/urunler/${urun.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-parsomen-300 bg-parsomen-50 shadow-kart transition duration-300 hover:-translate-y-1.5 hover:border-parsomen-400 hover:shadow-kart-havada"
    >
      {/* ---------- Görsel ---------- */}
      {/* Izgarada kartlar eşit olsun diye sabit kare kutu; fotoğraf
          kırpılmasın diye object-contain. Aradaki boşluk parşömen
          renginde kalıyor — çerçeve paspartusu gibi duruyor. */}
      <div className="relative aspect-square overflow-hidden bg-parsomen-200 p-4">
        {kapak ? (
          <Image
            src={kapak.url}
            alt={kapak.alt ?? urun.ad}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2.5 text-parsomen-400">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="4" width="18" height="16" rx="2.5" />
              <circle cx="8.5" cy="9.5" r="1.5" />
              <path d="M21 16l-5-5-4 4-2-2-7 7" />
            </svg>
            <span className="text-xs tracking-wide text-murekkep-500">
              Fotoğraf eklenmemiş
            </span>
          </div>
        )}

        {urun.oneCikan && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-altin-500 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-parsomen-50 shadow-kart">
            Öne Çıkan
          </span>
        )}
      </div>

      {/* ---------- İçerik ---------- */}
      <div className="flex flex-1 flex-col p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-altin-500">
          {urun.kategori.ad}
        </p>

        <h3 className="mt-3 font-baslik text-2xl font-semibold leading-snug transition-colors duration-200 group-hover:text-muhur-600">
          {urun.ad}
        </h3>

        <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-murekkep-700">
          {urun.aciklama}
        </p>

        <div className="mt-7 flex items-center justify-between border-t border-parsomen-200 pt-4">
          <span className="text-xs text-murekkep-500">
            {tarihBicimi.format(urun.olusturma)}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muhur-600 opacity-0 transition duration-200 group-hover:opacity-100">
            İncele
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}