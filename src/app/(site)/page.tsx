export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-muhur-600">
        Tasarım Sistemi Testi
      </p>

      <h1 className="mt-3 font-baslik text-6xl font-semibold">
        Antik Parşömen
      </h1>

      <p className="mt-2 font-baslik text-2xl italic text-murekkep-700">
        El Yapımı Parşömen Sanatı ve Kişiye Özel Tasarımlar
      </p>

      <hr className="my-10 border-parsomen-300" />

      {/* Türkçe karakter testi */}
      <h2 className="font-baslik text-3xl font-semibold">Türkçe Karakterler</h2>
      <p className="mt-3 font-baslik text-4xl">ÇĞİÖŞÜ — çğıöşü</p>
      <p className="mt-1 text-2xl">ÇĞİÖŞÜ — çğıöşü</p>
      <p className="mt-2 text-murekkep-500">
        Üstteki satır başlık fontu, alttaki gövde fontu. İkisinde de harfler
        bozulmadan görünmeli.
      </p>

      <hr className="my-10 border-parsomen-300" />

      {/* Renk paleti */}
      <h2 className="font-baslik text-3xl font-semibold">Renk Paleti</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["bg-parsomen-50", "parsomen-50"],
          ["bg-parsomen-100", "parsomen-100"],
          ["bg-parsomen-200", "parsomen-200"],
          ["bg-parsomen-300", "parsomen-300"],
          ["bg-parsomen-400", "parsomen-400"],
          ["bg-murekkep-900", "murekkep-900"],
          ["bg-murekkep-700", "murekkep-700"],
          ["bg-murekkep-500", "murekkep-500"],
          ["bg-muhur-600", "muhur-600"],
          ["bg-altin-500", "altin-500"],
        ].map(([sinif, ad]) => (
          <div key={ad}>
            <div
              className={`h-16 rounded-md border border-parsomen-300 ${sinif}`}
            />
            <p className="mt-1 text-xs text-murekkep-500">{ad}</p>
          </div>
        ))}
      </div>

      <hr className="my-10 border-parsomen-300" />

      {/* Örnek kart ve buton */}
      <h2 className="font-baslik text-3xl font-semibold">Örnek Ürün Kartı</h2>
      <div className="mt-4 max-w-sm rounded-lg border border-parsomen-300 bg-parsomen-50 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-altin-500">
          Kişiye Özel
        </p>
        <h3 className="mt-2 font-baslik text-2xl font-semibold">
          İsme Özel Parşömen
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-murekkep-700">
          El yapımı parşömen üzerine, istediğiniz metin hat sanatıyla yazılır.
        </p>
        <button className="mt-5 rounded-md bg-muhur-600 px-5 py-2.5 text-sm font-medium text-parsomen-50 transition hover:bg-muhur-700">
          Ürünleri İncele
        </button>
      </div>
    </main>
  );
}