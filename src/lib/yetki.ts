import { redirect } from "next/navigation";
import { oturumOku } from "./oturum";

/**
 * Admin sayfalarının ve işlemlerinin başında çağrılır.
 * Oturum geçersizse kullanıcıyı giriş sayfasına atar.
 *
 * Asıl güvenlik kontrolü burasıdır — proxy.ts sadece hızlı ön kontrol yapar.
 */
export async function adminGerekli() {
  const oturum = await oturumOku();

  if (!oturum) {
    redirect("/admin/giris");
  }

  return oturum;
}