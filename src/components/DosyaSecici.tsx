"use client";

import { useId, useState } from "react";

/**
 * Dosya seçme alanı.
 *
 * Girdi neden gizlenmiyor da şeffaf bir katman olarak duruyor?
 * WebKit (Safari), görünmez veya sıfır boyutlu bir dosya girdisi için
 * seçiciyi açmayı güvenlik gereği reddediyor. `sr-only` ile gizleyip
 * <label> ile tetiklemek Chrome'da çalışıyor, Safari'de hiçbir şey
 * açmıyordu. Bu yüzden girdiyi kutunun tamamını kaplayacak şekilde
 * bırakıp yalnızca saydam yapıyoruz: tıklama doğrudan girdiye iniyor.
 */
export default function DosyaSecici({
  name,
  coklu = false,
  etiket = "Fotoğraf Seç",
  ipucu,
}: {
  name: string;
  coklu?: boolean;
  etiket?: string;
  ipucu?: string;
}) {
  const id = useId();
  const [secilenler, setSecilenler] = useState<string[]>([]);

  return (
    <div>
      <div className="group relative rounded-xl border border-dashed border-parsomen-400 bg-parsomen-100 transition hover:border-muhur-600 hover:bg-parsomen-50 focus-within:border-muhur-600 focus-within:ring-4 focus-within:ring-muhur-600/10">
        {/* Gerçek girdi: kutunun tamamını kaplıyor, saydam.
            Tıklama buraya iniyor — Safari dahil her tarayıcıda açılır. */}
        <input
          id={id}
          type="file"
          name={name}
          multiple={coklu}
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) =>
            setSecilenler(Array.from(e.target.files ?? []).map((f) => f.name))
          }
          aria-label={etiket}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />

        {/* Görsel içerik: tıklamaları yutmasın diye pointer-events kapalı */}
        <div className="pointer-events-none flex flex-col items-center justify-center px-6 py-9 text-center">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-murekkep-500"
          >
            <path d="M12 16V4M7 9l5-5 5 5" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>

          <span className="mt-3 rounded-lg bg-muhur-600 px-5 py-2.5 text-sm font-medium text-parsomen-50 transition group-hover:bg-muhur-700">
            {etiket}
          </span>

          {secilenler.length > 0 ? (
            <span className="mt-3 text-sm font-medium text-murekkep-900">
              {secilenler.length === 1
                ? secilenler[0]
                : `${secilenler.length} fotoğraf seçildi`}
            </span>
          ) : (
            <span className="mt-3 text-xs text-murekkep-500">
              JPEG, PNG, WebP veya AVIF · dosya başına en fazla 10 MB
            </span>
          )}
        </div>
      </div>

      {secilenler.length > 1 && (
        <ul className="mt-3 space-y-1">
          {secilenler.map((ad) => (
            <li key={ad} className="truncate text-xs text-murekkep-500">
              · {ad}
            </li>
          ))}
        </ul>
      )}

      {ipucu && <p className="mt-3 text-xs text-murekkep-500">{ipucu}</p>}
    </div>
  );
}
