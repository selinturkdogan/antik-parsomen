// Türkçe harfleri adres dostu karşılıklarına çeviriyoruz.
// Bunu yapmasak "İsme Özel Parşömen" → "sme-zel-parmen" gibi bozuk
// bir adres çıkardı, çünkü Türkçe harfler ASCII değil.
const turkceHarfler: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/**
 * Bir başlığı adres parçasına çevirir.
 * "Besmele Hat Levhası" → "besmele-hat-levhasi"
 */
export function slugYap(metin: string): string {
  return metin
    .split("")
    .map((harf) => turkceHarfler[harf] ?? harf)
    .join("")
    .toLowerCase()
    .normalize("NFD") // kalan aksanlı harfleri ayrıştır
    .replace(/[\u0300-\u036f]/g, "") // aksan işaretlerini at
    .replace(/[^a-z0-9]+/g, "-") // harf/rakam dışındaki her şey tire
    .replace(/^-+|-+$/g, "") // baştaki ve sondaki tireleri temizle
    .slice(0, 80);
}
