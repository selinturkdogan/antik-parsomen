const gunBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const saatliBicim = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const kisaBicim = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Tarihi Türkçe biçimde yazar.
 * Saat 00:00 ise saati göstermez — kullanıcı saat girmemiş demektir,
 * "12 Eylül 2026 00:00" yazmak yanıltıcı olurdu.
 */
export function tarihYaz(tarih: Date): string {
  const saatVar = tarih.getHours() !== 0 || tarih.getMinutes() !== 0;
  return saatVar ? saatliBicim.format(tarih) : gunBicimi.format(tarih);
}

export function kisaTarih(tarih: Date): string {
  return kisaBicim.format(tarih);
}

/** Etkinlik henüz gelmedi mi? */
export function gelecekteMi(tarih: Date): boolean {
  return tarih.getTime() >= Date.now();
}

/**
 * <input type="datetime-local"> alanının beklediği biçim: "2026-09-12T14:30".
 * toISOString() UTC'ye çevirip saati kaydırdığı için elle kuruyoruz.
 */
export function girdiIcinTarih(tarih: Date | null): string {
  if (!tarih) return "";
  const ikiHane = (n: number) => String(n).padStart(2, "0");
  return (
    `${tarih.getFullYear()}-${ikiHane(tarih.getMonth() + 1)}-${ikiHane(tarih.getDate())}` +
    `T${ikiHane(tarih.getHours())}:${ikiHane(tarih.getMinutes())}`
  );
}
