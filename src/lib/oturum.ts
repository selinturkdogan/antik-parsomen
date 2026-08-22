import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const gizliAnahtar = process.env.OTURUM_SIFRESI;

if (!gizliAnahtar) {
  throw new Error(
    "OTURUM_SIFRESI bulunamadı. .env dosyasına eklediğinizden emin olun."
  );
}

const anahtar = new TextEncoder().encode(gizliAnahtar);

export const OTURUM_CEREZ_ADI = "ap_oturum";
const SURE_SANIYE = 60 * 60 * 24 * 7; // 7 gün

export type OturumVerisi = {
  kullaniciId: string;
  email: string;
  ad: string;
};

/** Giriş başarılı olunca imzalı çerezi yazar. */
export async function oturumOlustur(veri: OturumVerisi) {
  const jeton = await new SignJWT({ ...veri })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SURE_SANIYE}s`)
    .sign(anahtar);

  const cerezler = await cookies();

  cerezler.set(OTURUM_CEREZ_ADI, jeton, {
    httpOnly: true, // JavaScript okuyamaz — XSS saldırılarına karşı
    secure: process.env.NODE_ENV === "production", // canlıda sadece https
    sameSite: "lax", // başka sitelerden gelen isteklerde gönderilmez
    path: "/",
    maxAge: SURE_SANIYE,
  });
}

/** Çerezi doğrular. Geçersiz veya süresi dolmuşsa null döner. */
export async function oturumOku(): Promise<OturumVerisi | null> {
  const cerezler = await cookies();
  const jeton = cerezler.get(OTURUM_CEREZ_ADI)?.value;

  if (!jeton) return null;

  try {
    const { payload } = await jwtVerify(jeton, anahtar, {
      algorithms: ["HS256"],
    });
    return payload as unknown as OturumVerisi;
  } catch {
    // İmza tutmuyor veya süresi dolmuş — girişsiz say
    return null;
  }
}

/** Çıkış yaparken çerezi siler. */
export async function oturumKapat() {
  const cerezler = await cookies();
  cerezler.delete(OTURUM_CEREZ_ADI);
}