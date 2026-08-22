export const GALERI_TURLERI = [
  { deger: "ATOLYE", ad: "Atölye", aciklama: "Atölyemizden kareler" },
  { deger: "URETIM", ad: "Üretim", aciklama: "Üretim aşamaları" },
  { deger: "ETKINLIK", ad: "Etkinlik", aciklama: "Sergi, kermes, festival" },
  { deger: "STAND", ad: "Stand", aciklama: "Fuar ve stand fotoğrafları" },
  { deger: "MUSTERI", ad: "Müşterilerimiz", aciklama: "İzinleriyle paylaşılan" },
  { deger: "DIGER", ad: "Diğer", aciklama: "" },
] as const;

export type GaleriTuruDegeri = (typeof GALERI_TURLERI)[number]["deger"];

export function turAdi(deger: string): string {
  return GALERI_TURLERI.find((t) => t.deger === deger)?.ad ?? "Diğer";
}
