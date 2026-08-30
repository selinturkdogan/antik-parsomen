import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import IletisimFormu from "./IletisimFormu";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Antik Parşömen ile iletişime geçin: telefon, WhatsApp, e-posta, adres ve çalışma saatleri.",
};

export const dynamic = "force-dynamic";

const EPOSTA_KONUSU = "Antik Parşömen — Bilgi talebi";

/**
 * Ana e-posta bağlantısı: mailto.
 *
 * Önce Gmail'in web adresini kullanıyorduk ama telefonlarda o adres
 * Gmail uygulaması tarafından yakalanıyor ve uygulama parametreleri
 * anlamadığı için yazma ekranı yerine gelen kutusu açılıyordu.
 * mailto ise telefonda da masaüstünde de doğrudan yazma ekranını açar.
 */
function mailtoBaglantisi(adres: string) {
  return `mailto:${adres}?subject=${encodeURIComponent(EPOSTA_KONUSU)}`;
}

/** Kurulu mail programı olmayan masaüstü kullanıcıları için alternatif. */
function gmailBaglantisi(adres: string) {
  return (
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(adres)}` +
    `&su=${encodeURIComponent(EPOSTA_KONUSU)}`
  );
}

/** "0532 111 22 33" → "tel:+905321112233" */
function telefonBaglantisi(numara: string) {
  const rakamlar = numara.replace(/\D/g, "");
  if (rakamlar.startsWith("90")) return `tel:+${rakamlar}`;
  if (rakamlar.startsWith("0")) return `tel:+9${rakamlar}`;
  return `tel:+90${rakamlar}`;
}

export default async function IletisimSayfasi() {
  const ayar = await prisma.siteAyar.findUnique({ where: { id: "tek" } });

  const adres = ayar?.adres?.trim() || "";

  // Harita için API anahtarı gerekmiyor: adresi Google'ın gömme
  // adresine veriyoruz. Yönetici kendi Maps bağlantısını girdiyse
  // tıklama onu açıyor, girmediyse adresle arama yapılıyor.
  const haritaGomme = adres
    ? `https://www.google.com/maps?q=${encodeURIComponent(adres)}&output=embed`
    : null;

  const haritaAcilis =
    ayar?.mapsUrl?.trim() ||
    (adres
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adres)}`
      : null);

  const waMetni = encodeURIComponent(
    "Merhaba, Antik Parşömen hakkında bilgi almak istiyorum."
  );

  const sosyal = [
    { ad: "Instagram", url: ayar?.instagram, ikon: "instagram" as const },
    { ad: "Facebook", url: ayar?.facebook, ikon: "facebook" as const },
    { ad: "YouTube", url: ayar?.youtube, ikon: "youtube" as const },
  ].filter((s) => s.url && s.url.trim());

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <nav className="text-sm text-murekkep-500">
        <Link href="/" className="transition hover:text-muhur-600">
          Ana Sayfa
        </Link>
        <span className="mx-2.5 text-parsomen-400">/</span>
        <span className="text-murekkep-700">İletişim</span>
      </nav>

      <header className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muhur-600">
          Bize Ulaşın
        </p>
        <h1 className="mt-4 font-baslik text-5xl font-semibold leading-tight sm:text-6xl">
          İletişim
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-murekkep-700">
          Kişiye özel siparişler, toplu siparişler ve merak ettiğiniz her şey
          için bize yazabilir veya doğrudan arayabilirsiniz.
        </p>
        <div className="mt-8 h-px w-24 bg-altin-500/50" />
      </header>

      {/* ---------- Hızlı iletişim ---------- */}
      <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ayar?.whatsapp?.trim() && (
          <HizliKart
            href={`https://wa.me/${ayar.whatsapp.replace(/\D/g, "")}?text=${waMetni}`}
            dis
            baslik="WhatsApp"
            deger="Hemen yazın"
            aciklama="En hızlı yanıt için"
            vurgulu
            ikon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.53.07-.8.38-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 004.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.13h-.01a8.23 8.23 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24z" />
              </svg>
            }
          />
        )}

        {ayar?.telefon?.trim() && (
          <HizliKart
            href={telefonBaglantisi(ayar.telefon)}
            baslik="Telefon"
            deger={ayar.telefon}
            aciklama="Aramak için dokunun"
            ikon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 1.9.6 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.1a2 2 0 012.1-.5c.9.3 1.8.5 2.8.6a2 2 0 011.7 2z" />
              </svg>
            }
          />
        )}

        {ayar?.email?.trim() && (
          <HizliKart
            href={mailtoBaglantisi(ayar.email)}
            baslik="E-posta"
            deger={ayar.email}
            aciklama="Yazma ekranı açılır"
            ikon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            }
          />
        )}
      </section>

      {/* ---------- Bilgiler + Form ---------- */}
      <div className="mt-14 grid gap-10 lg:grid-cols-5 lg:gap-12">
        {/* Sol: bilgiler */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-7 shadow-kart">
            <h2 className="font-baslik text-2xl font-semibold">
              İletişim Bilgileri
            </h2>

            <dl className="mt-6 space-y-5">
              {ayar?.sahipAdi?.trim() && (
                <Satir baslik="Dükkan sahibi">{ayar.sahipAdi}</Satir>
              )}

              {ayar?.email?.trim() && (
                <Satir baslik="E-posta">
                  <a
                    href={mailtoBaglantisi(ayar.email)}
                    className="break-all transition hover:text-muhur-600"
                  >
                    {ayar.email}
                  </a>
                  <a
                    href={gmailBaglantisi(ayar.email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 block text-sm text-muhur-600 underline-offset-4 transition hover:underline"
                  >
                    Gmail&apos;de yaz ↗
                  </a>
                </Satir>
              )}

              {adres && (
                <Satir baslik="Adres">
                  <span className="whitespace-pre-line">{adres}</span>
                </Satir>
              )}
            </dl>

            {/* Harita doğrudan adresin altında — yazılı bağlantı yerine
                konumun kendisi görünüyor. Tıklayınca Maps'te açılıyor. */}
            {haritaGomme && (
              <div className="mt-5">
                <div className="overflow-hidden rounded-xl border border-parsomen-300">
                  <iframe
                    src={haritaGomme}
                    title="Antik Parşömen konumu"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block h-[260px] w-full border-0"
                  />
                </div>

                {haritaAcilis && (
                  <a
                    href={haritaAcilis}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-parsomen-400 px-4 py-2.5 text-sm text-murekkep-700 transition hover:border-muhur-600 hover:text-muhur-600"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Google Maps&apos;te aç ↗
                  </a>
                )}
              </div>
            )}

            {ayar?.calismaSaatleri?.trim() && (
              <div className="mt-6 border-t border-parsomen-200 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
                  Çalışma saatleri
                </p>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-murekkep-900">
                  {ayar.calismaSaatleri}
                </p>
              </div>
            )}

            {sosyal.length > 0 && (
              <div className="mt-7 border-t border-parsomen-200 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
                  Sosyal medya
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {sosyal.map((s) => (
                    <a
                      key={s.ad}
                      href={s.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full border border-parsomen-300 bg-parsomen-100 px-4 py-2 text-sm text-murekkep-700 transition hover:border-muhur-600 hover:text-muhur-600"
                    >
                      <SosyalIkon tur={s.ikon} />
                      {s.ad}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ: form */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-7 shadow-kart sm:p-9">
            <h2 className="font-baslik text-2xl font-semibold">
              Bizimle İletişime Geçin
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-murekkep-700">
              Formu doldurun, mesajınız doğrudan bize ulaşsın.
            </p>

            <div className="mt-7">
              <IletisimFormu />
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}

function Satir({
  baslik,
  children,
}: {
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
        {baslik}
      </dt>
      <dd className="mt-1.5 leading-relaxed text-murekkep-900">{children}</dd>
    </div>
  );
}

function HizliKart({
  href,
  baslik,
  deger,
  aciklama,
  ikon,
  vurgulu = false,
  dis = false,
}: {
  href: string;
  baslik: string;
  deger: string;
  aciklama: string;
  ikon: React.ReactNode;
  vurgulu?: boolean;
  dis?: boolean;
}) {
  return (
    <a
      href={href}
      {...(dis ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group flex items-start gap-4 rounded-2xl border p-6 shadow-kart transition duration-300 hover:-translate-y-1 hover:shadow-kart-havada ${
        vurgulu
          ? "border-muhur-600/30 bg-muhur-600/5 hover:border-muhur-600"
          : "border-parsomen-300 bg-parsomen-50 hover:border-parsomen-400"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          vurgulu
            ? "bg-muhur-600 text-parsomen-50"
            : "bg-parsomen-200 text-murekkep-700"
        }`}
      >
        {ikon}
      </span>

      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500">
          {baslik}
        </span>
        <span className="mt-1 block truncate font-medium text-murekkep-900 transition group-hover:text-muhur-600">
          {deger}
        </span>
        <span className="mt-0.5 block text-xs text-murekkep-500">
          {aciklama}
        </span>
      </span>
    </a>
  );
}

function SosyalIkon({ tur }: { tur: "instagram" | "facebook" | "youtube" }) {
  if (tur === "instagram") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (tur === "facebook") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13v-2c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5 3-5 3z" />
    </svg>
  );
}
