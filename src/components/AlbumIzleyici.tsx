"use client";

import Image from "next/image";
import { useState } from "react";
import IsikKutusu from "./IsikKutusu";

type Foto = {
  id: string;
  url: string;
  aciklama: string | null;
};

export default function AlbumIzleyici({
  fotograflar,
  albumAdi,
}: {
  fotograflar: Foto[];
  albumAdi: string;
}) {
  const [aktif, setAktif] = useState(0);
  const [acik, setAcik] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {fotograflar.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setAktif(i);
              setAcik(true);
            }}
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-parsomen-300 bg-parsomen-200 shadow-kart transition hover:border-parsomen-400 hover:shadow-kart-havada"
            aria-label={f.aciklama ?? `${i + 1}. fotoğraf`}
          >
            <Image
              src={f.url}
              alt={f.aciklama ?? ""}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />

            {f.aciklama && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-murekkep-900/80 to-transparent p-3 text-left text-[11px] leading-snug text-parsomen-50 opacity-0 transition group-hover:opacity-100">
                {f.aciklama}
              </span>
            )}
          </button>
        ))}
      </div>

      {acik && (
        <IsikKutusu
          fotograflar={fotograflar}
          aktif={aktif}
          setAktif={setAktif}
          kapat={() => setAcik(false)}
          baslik={albumAdi}
        />
      )}
    </>
  );
}
