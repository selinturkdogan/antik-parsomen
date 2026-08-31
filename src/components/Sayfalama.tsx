import Link from "next/link";

/**
 * Sayfa numaraları.
 *
 * Mevcut arama/filtre seçimleri korunsun diye adresteki diğer
 * parametreleri olduğu gibi taşıyor; yalnızca "sayfa" değişiyor.
 */
export default function Sayfalama({
  simdiki,
  toplamSayfa,
  parametreler,
  temelYol,
}: {
  simdiki: number;
  toplamSayfa: number;
  /** Adresteki mevcut parametreler (q, kategori...) */
  parametreler: Record<string, string>;
  temelYol: string;
}) {
  if (toplamSayfa <= 1) return null;

  const adres = (sayfa: number) => {
    const p = new URLSearchParams(parametreler);
    // 1. sayfada "?sayfa=1" yazmıyoruz; adres gereksiz uzamasın
    if (sayfa > 1) p.set("sayfa", String(sayfa));
    else p.delete("sayfa");
    const sorgu = p.toString();
    return sorgu ? `${temelYol}?${sorgu}` : temelYol;
  };

  // Çok sayfa varsa hepsini basmıyoruz: baş, son ve etraftakiler
  const gosterilecek = new Set<number>([1, toplamSayfa]);
  for (let s = simdiki - 1; s <= simdiki + 1; s++) {
    if (s >= 1 && s <= toplamSayfa) gosterilecek.add(s);
  }
  const sayfalar = [...gosterilecek].sort((a, b) => a - b);

  return (
    <nav
      aria-label="Sayfalar"
      className="mt-14 flex flex-wrap items-center justify-center gap-2"
    >
      <YonDugmesi
        yon="onceki"
        hedef={simdiki > 1 ? adres(simdiki - 1) : null}
      />

      {sayfalar.map((s, i) => {
        const oncekiSayfa = sayfalar[i - 1];
        const bosluk = oncekiSayfa !== undefined && s - oncekiSayfa > 1;

        return (
          <span key={s} className="flex items-center gap-2">
            {bosluk && (
              <span className="px-1 text-murekkep-500" aria-hidden="true">
                …
              </span>
            )}

            {s === simdiki ? (
              <span
                aria-current="page"
                className="flex h-11 min-w-11 items-center justify-center rounded-full bg-muhur-600 px-4 text-sm font-medium text-parsomen-50 shadow-kart"
              >
                {s}
              </span>
            ) : (
              <Link
                href={adres(s)}
                className="flex h-11 min-w-11 items-center justify-center rounded-full border border-parsomen-300 bg-parsomen-50 px-4 text-sm text-murekkep-700 transition hover:border-muhur-600 hover:text-muhur-600"
              >
                {s}
              </Link>
            )}
          </span>
        );
      })}

      <YonDugmesi
        yon="sonraki"
        hedef={simdiki < toplamSayfa ? adres(simdiki + 1) : null}
      />
    </nav>
  );
}

function YonDugmesi({
  yon,
  hedef,
}: {
  yon: "onceki" | "sonraki";
  hedef: string | null;
}) {
  const onceki = yon === "onceki";
  const etiket = onceki ? "Önceki sayfa" : "Sonraki sayfa";

  const ok = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {onceki ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );

  // Gidilecek yer yoksa bağlantı değil, soluk bir işaret gösteriyoruz
  if (!hedef) {
    return (
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-parsomen-300 text-parsomen-400"
      >
        {ok}
      </span>
    );
  }

  return (
    <Link
      href={hedef}
      aria-label={etiket}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-parsomen-300 bg-parsomen-50 text-murekkep-700 transition hover:border-muhur-600 hover:text-muhur-600"
    >
      {ok}
    </Link>
  );
}
