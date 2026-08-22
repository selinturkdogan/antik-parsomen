"use client";

import { useState, useTransition } from "react";
import { oneCikanDegistir, urunSil, yayindaDegistir } from "./actions";

/** Öne çıkan / yayında için küçük açma-kapama anahtarı. */
export function HizliAnahtar({
  id,
  alan,
  deger,
  etiket,
}: {
  id: string;
  alan: "oneCikan" | "yayinda";
  deger: boolean;
  etiket: string;
}) {
  const [bekliyor, baslat] = useTransition();

  return (
    <button
      type="button"
      disabled={bekliyor}
      onClick={() =>
        baslat(() =>
          alan === "oneCikan"
            ? oneCikanDegistir(id, !deger)
            : yayindaDegistir(id, !deger)
        )
      }
      aria-pressed={deger}
      title={`${etiket}: ${deger ? "açık" : "kapalı"} — değiştirmek için tıklayın`}
      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition disabled:opacity-50 ${
        deger
          ? alan === "oneCikan"
            ? "border-altin-500 bg-altin-500 text-parsomen-50"
            : "border-parsomen-400 bg-parsomen-200 text-murekkep-700"
          : "border-parsomen-300 bg-parsomen-50 text-murekkep-500"
      }`}
    >
      {etiket}
    </button>
  );
}

/** İki adımlı silme: yanlışlıkla silmeyi zorlaştırır. */
export function SilButonu({ id, ad }: { id: string; ad: string }) {
  const [onayIstendi, setOnayIstendi] = useState(false);
  const [bekliyor, baslat] = useTransition();

  if (!onayIstendi) {
    return (
      <button
        type="button"
        onClick={() => setOnayIstendi(true)}
        className="text-xs text-murekkep-500 underline-offset-4 transition hover:text-muhur-600 hover:underline"
      >
        Sil
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-murekkep-700">
        &ldquo;{ad}&rdquo; silinsin mi?
      </span>
      <button
        type="button"
        disabled={bekliyor}
        onClick={() => baslat(() => urunSil(id))}
        className="rounded-md bg-muhur-600 px-2.5 py-1 text-[11px] font-medium text-parsomen-50 transition hover:bg-muhur-700 disabled:opacity-60"
      >
        {bekliyor ? "Siliniyor..." : "Evet, sil"}
      </button>
      <button
        type="button"
        onClick={() => setOnayIstendi(false)}
        className="text-[11px] text-murekkep-500 underline-offset-4 hover:underline"
      >
        Vazgeç
      </button>
    </span>
  );
}
