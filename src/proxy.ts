import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Not: Next.js 16'da "Middleware" bu isme geçti (proxy.ts).
const OTURUM_CEREZ_ADI = "ap_oturum";

/**
 * Çerezin imzasını ve süresini doğrular.
 *
 * Sadece "çerez var mı" diye bakmak yetmiyordu: süresi dolmuş bir
 * çerezle panele girilmeye çalışıldığında proxy geçiriyor, sayfa
 * reddedip giriş sayfasına atıyor, proxy oradan tekrar panele
 * yolluyordu — sonsuz yönlendirme döngüsü. Kullanıcı çerezlerini elle
 * temizlemeden panele giremiyordu.
 *
 * Burada veritabanına gitmiyoruz, sadece imzayı kontrol ediyoruz;
 * hızlı ve yan etkisiz. Asıl yetki kontrolü yine (panel) grubunun
 * layout'unda ve her işlemin içinde yapılıyor.
 */
async function oturumGecerliMi(jeton: string | undefined) {
  if (!jeton) return false;

  const gizliAnahtar = process.env.OTURUM_SIFRESI;
  if (!gizliAnahtar) return false;

  try {
    await jwtVerify(jeton, new TextEncoder().encode(gizliAnahtar), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false; // imza tutmuyor veya süresi dolmuş
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const jeton = request.cookies.get(OTURUM_CEREZ_ADI)?.value;
  const gecerli = await oturumGecerliMi(jeton);
  const girisSayfasi = pathname === "/admin/giris";

  // Girişliyken giriş sayfasına gitmeye çalışırsa panele yolla
  if (girisSayfasi && gecerli) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Girişsizken panele girmeye çalışırsa giriş sayfasına yolla.
  //
  // Çerezi burada SİLMİYORUZ. Bir denememizde siliyorduk ve bu, tek bir
  // isteğin doğrulanamaması hâlinde geçerli oturumu da uçuruyordu.
  // Silmeye gerek de yok: artık çerezi doğruladığımız için, geçersiz
  // çerezle giriş sayfasına gelindiğinde `gecerli` false kalıyor ve
  // tekrar yönlendirilmiyor — döngü zaten oluşamıyor.
  if (!girisSayfasi && !gecerli) {
    return NextResponse.redirect(new URL("/admin/giris", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
