"use client";

import { useId, useRef, useState } from "react";

/** Küçültme sonrası en uzun kenar. Web için fazlasıyla yeterli. */
const EN_UZUN_KENAR = 2000;
const KALITE = 0.82;

/** Vercel istek gövdesini 4.5 MB'da kesiyor; kendimize pay bırakıyoruz. */
const TOPLAM_UYARI_SINIRI = 3.6 * 1024 * 1024;

function mb(bayt: number) {
  return (bayt / 1024 / 1024).toFixed(1);
}

/**
 * Fotoğrafı tarayıcıda küçültür.
 *
 * Neden gerekli: Vercel, bir isteğin gövdesini 4.5 MB'da kesiyor ve
 * fazlasını sunucuya hiç ulaştırmadan reddediyor. Telefon fotoğrafları
 * tek başına 3-8 MB olduğu için yüklemeler yayında başarısız olurdu.
 * Küçültme aynı zamanda yüklemeyi belirgin biçimde hızlandırıyor.
 *
 * Bir sorun çıkarsa dosyanın orijinali kullanılır; yükleme hiç
 * yapılamamaktansa büyük dosyayla denenmesi daha iyi.
 */
async function kucult(dosya: File): Promise<File> {
  if (!dosya.type.startsWith("image/")) return dosya;

  try {
    const resim = await createImageBitmap(dosya);
    const olcek = Math.min(
      1,
      EN_UZUN_KENAR / Math.max(resim.width, resim.height)
    );

    // Zaten küçük ve hafifse dokunma
    if (olcek === 1 && dosya.size <= 900 * 1024) {
      resim.close?.();
      return dosya;
    }

    const g = Math.round(resim.width * olcek);
    const y = Math.round(resim.height * olcek);

    const kanvas = document.createElement("canvas");
    kanvas.width = g;
    kanvas.height = y;

    const ctx = kanvas.getContext("2d");
    if (!ctx) {
      resim.close?.();
      return dosya;
    }

    // Şeffaf bölgeler JPEG'de siyaha dönüyor; önce beyaz zemin basıyoruz
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, g, y);
    ctx.drawImage(resim, 0, 0, g, y);
    resim.close?.();

    const blob = await new Promise<Blob | null>((coz) =>
      kanvas.toBlob(coz, "image/jpeg", KALITE)
    );

    if (!blob || blob.size >= dosya.size) return dosya;

    return new File(
      [blob],
      dosya.name.replace(/\.[^.]+$/, "") + ".jpg",
      { type: "image/jpeg", lastModified: Date.now() }
    );
  } catch {
    return dosya;
  }
}

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
  const girdiRef = useRef<HTMLInputElement>(null);
  const [secilenler, setSecilenler] = useState<string[]>([]);
  const [toplamBoyut, setToplamBoyut] = useState(0);
  const [hazirlaniyor, setHazirlaniyor] = useState(false);

  async function dosyalarDegisti(e: React.ChangeEvent<HTMLInputElement>) {
    const secilen = Array.from(e.target.files ?? []);
    if (secilen.length === 0) {
      setSecilenler([]);
      setToplamBoyut(0);
      return;
    }

    setHazirlaniyor(true);
    setSecilenler(secilen.map((f) => f.name));

    const kucukler = await Promise.all(secilen.map(kucult));

    // Küçültülmüş dosyaları girdiye geri yazıyoruz ki form bunları göndersin
    const aktarim = new DataTransfer();
    kucukler.forEach((f) => aktarim.items.add(f));
    if (girdiRef.current) girdiRef.current.files = aktarim.files;

    setSecilenler(kucukler.map((f) => f.name));
    setToplamBoyut(kucukler.reduce((t, f) => t + f.size, 0));
    setHazirlaniyor(false);
  }

  const cokBuyuk = toplamBoyut > TOPLAM_UYARI_SINIRI;

  return (
    <div>
      <div className="group relative rounded-xl border border-dashed border-parsomen-400 bg-parsomen-100 transition hover:border-muhur-600 hover:bg-parsomen-50 focus-within:border-muhur-600 focus-within:ring-4 focus-within:ring-muhur-600/10">
        {/* Girdi kutunun tamamını kaplıyor ve saydam.
            WebKit, görünmez veya sıfır boyutlu bir dosya girdisi için
            seçiciyi açmayı reddediyor; bu yüzden gizlemiyoruz. */}
        <input
          ref={girdiRef}
          id={id}
          type="file"
          name={name}
          multiple={coklu}
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={dosyalarDegisti}
          aria-label={etiket}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />

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

          {hazirlaniyor ? (
            <span className="mt-3 text-sm text-murekkep-700">
              Fotoğraflar hazırlanıyor...
            </span>
          ) : secilenler.length > 0 ? (
            <span className="mt-3 text-sm font-medium text-murekkep-900">
              {secilenler.length === 1
                ? secilenler[0]
                : `${secilenler.length} fotoğraf seçildi`}
              <span className="ml-2 font-normal text-murekkep-500">
                ({mb(toplamBoyut)} MB)
              </span>
            </span>
          ) : (
            <span className="mt-3 text-xs text-murekkep-500">
              JPEG, PNG, WebP veya AVIF
            </span>
          )}
        </div>
      </div>

      {cokBuyuk && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-muhur-600/30 bg-muhur-600/10 px-4 py-3 text-xs leading-relaxed text-muhur-700"
        >
          Seçtiğiniz fotoğraflar toplam {mb(toplamBoyut)} MB. Tek seferde
          gönderilebilecek sınıra yaklaştınız; birkaçını çıkarıp kaydedin,
          kalanları sonra ekleyin.
        </p>
      )}

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

      <p className="mt-2 text-xs text-murekkep-500">
        Fotoğraflar gönderilmeden önce web için otomatik küçültülür — kalite
        korunur, yükleme hızlanır.
      </p>
    </div>
  );
}
