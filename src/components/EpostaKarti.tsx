"use client";

import { useEffect, useState } from "react";

const KONU = "Antik Parşömen — Bilgi talebi";

/**
 * E-posta kartı.
 *
 * Neden cihaza göre farklı davranıyor:
 * - Telefonda Gmail'in web adresi (`view=cm`) Gmail uygulaması tarafından
 *   yakalanıyor; uygulama parametreleri anlamadığı için yazma ekranı
 *   yerine gelen kutusu açılıyor. Orada doğru olan `mailto:`.
 * - Masaüstünde `mailto:` işletim sisteminin varsayılan mail programını
 *   açıyor. Kurulu değilse veya kullanılmıyorsa boş/kullanışsız bir ekran
 *   çıkıyor. Orada doğru olan Gmail'in web arayüzü.
 *
 * Sunucuda hangi cihaz olduğunu bilemiyoruz. Bu yüzden Gmail adresiyle
 * başlıyor, bileşen yüklendikten sonra telefonsa mailto'ya geçiyoruz —
 * böylece sunucu ve tarayıcı çıktısı ilk anda uyuşuyor.
 */
export default function EpostaKarti({ adres }: { adres: string }) {
  const [telefon, setTelefon] = useState(false);

  useEffect(() => {
    const kucukEkran = window.matchMedia("(max-width: 820px)").matches;
    const dokunmatik = window.matchMedia("(pointer: coarse)").matches;
    setTelefon(kucukEkran && dokunmatik);
  }, []);

  const mailto = `mailto:${adres}?subject=${encodeURIComponent(KONU)}`;
  const gmail =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(adres)}` +
    `&su=${encodeURIComponent(KONU)}`;

  const hedef = telefon ? mailto : gmail;

  return (
    <a
      href={hedef}
      {...(telefon ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className="group flex items-start gap-4 rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart transition duration-300 hover:-translate-y-1 hover:border-parsomen-400 hover:shadow-kart-havada"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-parsomen-200 text-murekkep-700">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      </span>

      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
          E-posta
        </span>
        <span className="mt-1 block truncate font-medium text-murekkep-900 transition group-hover:text-muhur-600">
          {adres}
        </span>
        <span className="mt-0.5 block text-xs text-murekkep-500">
          {telefon ? "Yazma ekranı açılır" : "Gmail'de yazma ekranı açılır"}
        </span>
      </span>
    </a>
  );
}
