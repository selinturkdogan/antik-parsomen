import Image from "next/image";
import Link from "next/link";
import { tarihYaz } from "@/lib/tarih";

type Props = {
  duyuru: {
    slug: string;
    tur: "DUYURU" | "ETKINLIK";
    baslik: string;
    aciklama: string;
    kapakUrl: string | null;
    tarih: Date | null;
    yer: string | null;
  };
  /** Geçmiş etkinlikler biraz soluk gösterilir */
  soluk?: boolean;
};

export default function DuyuruKart({ duyuru, soluk = false }: Props) {
  const etkinlik = duyuru.tur === "ETKINLIK";

  return (
    <Link
      href={`/duyurular/${duyuru.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-parsomen-300 bg-parsomen-50 shadow-kart transition duration-300 hover:-translate-y-1.5 hover:border-parsomen-400 hover:shadow-kart-havada ${
        soluk ? "opacity-80 hover:opacity-100" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-parsomen-200">
        {duyuru.kapakUrl ? (
          <Image
            src={duyuru.kapakUrl}
            alt={duyuru.baslik}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-parsomen-400">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="5" width="18" height="16" rx="2.5" />
              <path d="M8 3v4M16 3v4M3 11h18" />
            </svg>
          </div>
        )}

        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-kart ${
            etkinlik
              ? "bg-altin-500 text-parsomen-50"
              : "bg-parsomen-50 text-murekkep-700"
          }`}
        >
          {etkinlik ? "Etkinlik" : "Duyuru"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        {duyuru.tarih && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muhur-600">
            {tarihYaz(duyuru.tarih)}
          </p>
        )}

        <h3 className="mt-2.5 font-baslik text-2xl font-semibold leading-snug transition-colors duration-200 group-hover:text-muhur-600">
          {duyuru.baslik}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-murekkep-700">
          {duyuru.aciklama}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-parsomen-200 pt-4">
          <span className="truncate text-xs text-murekkep-500">
            {duyuru.yer ?? ""}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muhur-600 opacity-0 transition duration-200 group-hover:opacity-100">
            Detaylar
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
