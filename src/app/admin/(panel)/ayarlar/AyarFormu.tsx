"use client";

import Image from "next/image";
import { useActionState } from "react";
import DosyaSecici from "@/components/DosyaSecici";
import { ayarlariKaydet, type AyarDurumu } from "./actions";

type Ayar = {
  slogan: string | null;
  kapakAciklama: string | null;
  kapakUrl: string | null;
  telefon: string | null;
  whatsapp: string | null;
  email: string | null;
  adres: string | null;
  mapsUrl: string | null;
  calismaSaatleri: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  sahipAdi: string | null;
  sahipFotoUrl: string | null;
  sahipBiyografi: string | null;
  hikaye: string | null;
  malzemeBilgi: string | null;
};

const baslangic: AyarDurumu = {};

const etiket =
  "block text-[11px] font-semibold uppercase tracking-[0.15em] text-murekkep-500";
const kutu =
  "mt-2 w-full appearance-none rounded-xl border border-parsomen-300 bg-parsomen-50 px-4 py-3 text-[15px] outline-none transition focus:border-muhur-600 focus:ring-4 focus:ring-muhur-600/10";
const yardim = "mt-2 text-xs leading-relaxed text-murekkep-500";

/** Tam adresten kullanıcı adını çıkarır: girişte kısa hâli görünsün */
function kullaniciAdi(url: string | null) {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?[^/]+\//i, "").replace(/\/$/, "");
}

export default function AyarFormu({ ayar }: { ayar: Ayar | null }) {
  const [durum, formGonder, bekliyor] = useActionState(
    ayarlariKaydet,
    baslangic
  );

  return (
    <form action={formGonder} className="space-y-7">
      {/* ---------- Ana sayfa ---------- */}
      <Bolum
        baslik="Ana Sayfa Kapağı"
        aciklama="Ziyaretçinin siteye girdiğinde ilk gördüğü bölüm."
      >
        <div>
          <label htmlFor="slogan" className={etiket}>
            Slogan
          </label>
          <input
            id="slogan"
            name="slogan"
            type="text"
            defaultValue={ayar?.slogan ?? ""}
            placeholder="El Yapımı Parşömen Sanatı ve Kişiye Özel Tasarımlar"
            className={kutu}
          />
          <p className={yardim}>
            Boş bırakırsanız varsayılan slogan kullanılır.
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="kapakAciklama" className={etiket}>
            Slogan altındaki açıklama
          </label>
          <textarea
            id="kapakAciklama"
            name="kapakAciklama"
            rows={3}
            defaultValue={ayar?.kapakAciklama ?? ""}
            placeholder="Her parçası elde hazırlanan parşömenler, hat ve kaligrafi çalışmaları, size özel tasarımlar."
            className={`${kutu} resize-y leading-relaxed`}
          />
          <p className={yardim}>
            Sloganın altında, düğmelerin üstünde görünen kısa metin.
          </p>
        </div>

        <div className="mt-6">
          <p className={etiket}>Kapak fotoğrafı</p>

          {ayar?.kapakUrl && (
            <div className="relative mt-3 h-44 w-full overflow-hidden rounded-xl border border-parsomen-300 bg-parsomen-200 sm:w-96">
              <Image
                src={ayar.kapakUrl}
                alt="Mevcut kapak"
                fill
                sizes="384px"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-3">
            <DosyaSecici
              name="kapak"
              etiket={ayar?.kapakUrl ? "Kapağı Değiştir" : "Kapak Fotoğrafı Seç"}
              ipucu="Yatay ve geniş bir fotoğraf en iyi sonucu verir. Yenisini yüklerseniz eskisi otomatik silinir. Kapak yoksa ana sayfa yazıyla açılır."
            />
          </div>
        </div>
      </Bolum>

      {/* ---------- İletişim ---------- */}
      <Bolum
        baslik="İletişim Bilgileri"
        aciklama="Bu bilgiler iletişim sayfasında ve sayfa altındaki bilgi şeridinde görünür."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="telefon" className={etiket}>
              Telefon
            </label>
            <input
              id="telefon"
              name="telefon"
              type="text"
              defaultValue={ayar?.telefon ?? ""}
              placeholder="0532 111 22 33"
              className={kutu}
            />
            <p className={yardim}>
              Ziyaretçi tıklayınca doğrudan arama başlar.
            </p>
          </div>

          <div>
            <label htmlFor="whatsapp" className={etiket}>
              WhatsApp numarası
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              defaultValue={ayar?.whatsapp ?? ""}
              placeholder="0532 111 22 33"
              className={kutu}
            />
            <p className={yardim}>
              Normal yazın, ülke kodunu biz ekliyoruz. Ürün sayfalarındaki
              &ldquo;WhatsApp&apos;tan Sipariş Ver&rdquo; düğmesi de bu numarayı
              kullanır.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="email" className={etiket}>
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={ayar?.email ?? ""}
            placeholder="iletisim@antikparsomen.com"
            className={kutu}
          />
        </div>

        <div className="mt-6">
          <label htmlFor="adres" className={etiket}>
            Adres
          </label>
          <textarea
            id="adres"
            name="adres"
            rows={3}
            defaultValue={ayar?.adres ?? ""}
            placeholder="Mahalle, Sokak No, İlçe / İl"
            className={`${kutu} resize-y leading-relaxed`}
          />
          <p className={yardim}>
            Haritayı bu adresten oluşturuyoruz. Ne kadar açık yazarsanız
            harita o kadar doğru yeri gösterir.
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="mapsUrl" className={etiket}>
            Google Maps bağlantısı (isteğe bağlı)
          </label>
          <input
            id="mapsUrl"
            name="mapsUrl"
            type="url"
            defaultValue={ayar?.mapsUrl ?? ""}
            placeholder="https://maps.app.goo.gl/..."
            className={kutu}
          />
          <p className={yardim}>
            Haritada dükkanınızın tam yerini bulup <strong>Paylaş</strong> ile
            aldığınız bağlantıyı buraya koyabilirsiniz. Boş bırakırsanız adrese
            göre arama yapılır.
          </p>
        </div>
      </Bolum>

      {/* ---------- Çalışma saatleri ---------- */}
      <Bolum
        baslik="Çalışma Saatleri"
        aciklama="Her günü ayrı satıra yazın; sitede de aynı düzende görünür."
      >
        <textarea
          id="calismaSaatleri"
          name="calismaSaatleri"
          rows={4}
          defaultValue={ayar?.calismaSaatleri ?? ""}
          placeholder={"Pazartesi - Cuma: 10:00 - 19:00\nCumartesi: 10:00 - 17:00\nPazar: Kapalı"}
          className={`${kutu} resize-y leading-relaxed`}
        />
      </Bolum>

      {/* ---------- Sosyal medya ---------- */}
      <Bolum
        baslik="Sosyal Medya"
        aciklama="Sadece kullanıcı adınızı yazmanız yeterli — tam adresi biz oluşturuyoruz. Boş bıraktığınız hesap sitede hiç görünmez."
      >
        <div className="space-y-5">
          <SosyalAlan
            id="instagram"
            ad="Instagram"
            onEk="instagram.com/"
            deger={kullaniciAdi(ayar?.instagram ?? null)}
            ornek="antikparsomen"
          />
          <SosyalAlan
            id="facebook"
            ad="Facebook"
            onEk="facebook.com/"
            deger={kullaniciAdi(ayar?.facebook ?? null)}
            ornek="antikparsomen"
          />
          <SosyalAlan
            id="youtube"
            ad="YouTube"
            onEk="youtube.com/"
            deger={kullaniciAdi(ayar?.youtube ?? null)}
            ornek="@antikparsomen"
          />
        </div>
      </Bolum>

      {/* ---------- Hakkımızda ---------- */}
      <Bolum
        baslik="Hakkımızda Sayfası"
        aciklama="Boş bıraktığınız bölümler sitede hiç görünmez."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="sahipAdi" className={etiket}>
              Dükkan sahibinin adı
            </label>
            <input
              id="sahipAdi"
              name="sahipAdi"
              type="text"
              defaultValue={ayar?.sahipAdi ?? ""}
              className={kutu}
            />
          </div>
        </div>

        <div className="mt-6">
          <p className={etiket}>Fotoğraf</p>

          {ayar?.sahipFotoUrl && (
            <div className="relative mt-3 h-28 w-28 overflow-hidden rounded-full border border-parsomen-300 bg-parsomen-200">
              <Image
                src={ayar.sahipFotoUrl}
                alt="Mevcut fotoğraf"
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-3">
            <DosyaSecici
              name="sahipFoto"
              etiket={ayar?.sahipFotoUrl ? "Fotoğrafı Değiştir" : "Fotoğraf Seç"}
              ipucu="Hakkımızda sayfasında yuvarlak olarak, adın solunda görünür. Yüzün ortada olduğu bir kare fotoğraf en iyi sonucu verir."
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="sahipBiyografi" className={etiket}>
            Kısa biyografi
          </label>
          <textarea
            id="sahipBiyografi"
            name="sahipBiyografi"
            rows={4}
            defaultValue={ayar?.sahipBiyografi ?? ""}
            placeholder="Ne zamandır bu işi yapıyorsunuz, nasıl başladınız..."
            className={`${kutu} resize-y leading-relaxed`}
          />
        </div>

        <div className="mt-6">
          <label htmlFor="hikaye" className={etiket}>
            Dükkanın hikâyesi
          </label>
          <textarea
            id="hikaye"
            name="hikaye"
            rows={6}
            defaultValue={ayar?.hikaye ?? ""}
            placeholder="Antik Parşömen nasıl kuruldu, neyi amaçlıyor..."
            className={`${kutu} resize-y leading-relaxed`}
          />
        </div>

        <div className="mt-6">
          <label htmlFor="malzemeBilgi" className={etiket}>
            Kullanılan malzemeler
          </label>
          <textarea
            id="malzemeBilgi"
            name="malzemeBilgi"
            rows={4}
            defaultValue={ayar?.malzemeBilgi ?? ""}
            placeholder="Parşömen kağıdı, is mürekkebi, kamış kalem..."
            className={`${kutu} resize-y leading-relaxed`}
          />
        </div>
      </Bolum>

      {/* ---------- Kaydet ---------- */}
      {durum.hata && (
        <p
          role="alert"
          className="rounded-lg border border-muhur-600/30 bg-muhur-600/10 px-4 py-3 text-sm text-muhur-700"
        >
          {durum.hata}
        </p>
      )}

      {durum.basari && (
        <p className="rounded-lg border border-parsomen-400 bg-parsomen-200 px-4 py-3 text-sm text-murekkep-900">
          Bilgiler kaydedildi. Sitede hemen görünür.
        </p>
      )}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border border-parsomen-300 bg-parsomen-50/95 p-4 shadow-kart backdrop-blur">
        <button
          type="submit"
          disabled={bekliyor}
          className="rounded-xl bg-muhur-600 px-7 py-3 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bekliyor ? "Kaydediliyor..." : "Bilgileri Kaydet"}
        </button>
        <span className="text-xs text-murekkep-500">
          Tüm bölümler tek seferde kaydedilir.
        </span>
      </div>
    </form>
  );
}

function Bolum({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-parsomen-300 bg-parsomen-50 p-6 shadow-kart sm:p-7">
      <h2 className="font-baslik text-2xl font-semibold">{baslik}</h2>
      {aciklama && (
        <p className="mt-2 text-sm leading-relaxed text-murekkep-500">
          {aciklama}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SosyalAlan({
  id,
  ad,
  onEk,
  deger,
  ornek,
}: {
  id: string;
  ad: string;
  onEk: string;
  deger: string;
  ornek: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={etiket}>
        {ad}
      </label>
      <div className="mt-2 flex items-stretch overflow-hidden rounded-xl border border-parsomen-300 bg-parsomen-50 transition focus-within:border-muhur-600 focus-within:ring-4 focus-within:ring-muhur-600/10">
        <span className="flex items-center border-r border-parsomen-300 bg-parsomen-200 px-3.5 text-sm text-murekkep-500">
          {onEk}
        </span>
        <input
          id={id}
          name={id}
          type="text"
          defaultValue={deger}
          placeholder={ornek}
          className="min-w-0 flex-1 appearance-none bg-transparent px-4 py-3 text-[15px] outline-none"
        />
      </div>
    </div>
  );
}
