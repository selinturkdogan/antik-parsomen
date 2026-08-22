import type { Metadata } from "next";
import GirisFormu from "./GirisFormu";

export const metadata: Metadata = {
  title: "Yönetici Girişi",
  robots: { index: false, follow: false }, // Google bu sayfayı dizine almasın
};

export default function GirisSayfasi() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="font-baslik text-3xl font-semibold">Antik Parşömen</p>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.25em] text-altin-500">
            Yönetim Paneli
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-parsomen-300 bg-parsomen-50 p-8 shadow-kart sm:p-10">
          <GirisFormu />
        </div>

        <p className="mt-6 text-center text-xs text-murekkep-500">
          Bu alan yalnızca dükkan yöneticisi içindir.
        </p>
      </div>
    </main>
  );
}
