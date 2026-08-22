"use client";

import { useId, useState } from "react";

/**
 * Dosya seçme alanı.
 *
 * Neden gerçek <input type="file"> gizli?
 * Safari, dosya girdilerini kendi iç düzeniyle çiziyor ve verdiğimiz
 * padding yüzünden görünen düğme ile gerçek tıklama alanı kayabiliyor —
 * kullanıcı düğmeyi görüyor ama tıklaması işe yaramıyor.
 * Girdiyi gizleyip <label> ile tetiklemek her tarayıcıda güvenilir çalışır.
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
      {/* Gerçek girdi: görünmez ama forma dahil ve erişilebilir.
          display:none yerine sr-only kullanıyoruz ki form gönderiminde
          ve klavye erişiminde sorun çıkmasın. */}
      <input
        id={id}
        type="file"
        name={name}
        multiple={coklu}
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) =>
          setSecilenler(Array.from(e.target.files ?? []).map((f) => f.name))
        }
        className="sr-only"
      />

      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-parsomen-400 bg-parsomen-100 px-6 py-9 text-center transition hover:border-muhur-600 hover:bg-parsomen-50 focus-within:border-muhur-600"
      >
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

        <span className="mt-3 rounded-lg bg-muhur-600 px-5 py-2.5 text-sm font-medium text-parsomen-50">
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
      </label>

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
