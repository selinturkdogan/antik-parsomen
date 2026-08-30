import { headers } from "next/headers";

/**
 * Ziyaretçi telefonda mı? Tarayıcının kendi tanıttığı bilgiye bakıyoruz.
 *
 * Neden sunucuda:
 * E-posta bağlantısı cihaza göre değişmek zorunda — telefonda `mailto:`
 * Gmail uygulamasının yazma ekranını açıyor, masaüstünde ise Gmail'in web
 * arayüzü gerekiyor. Bunu tarayıcıda `matchMedia` ile yapıyorduk ama o
 * ancak sayfa yüklendikten sonra devreye giriyordu: sunucudan gelen ilk
 * hâlde adres hâlâ masaüstü sürümüydü ve erken dokunan kullanıcı yanlış
 * ekrana düşüyordu.
 *
 * Sunucuda karar verince sayfa daha ilk andan doğru adresle geliyor.
 */
export async function telefonMu() {
  const ua = (await headers()).get("user-agent") ?? "";
  return /Android|iPhone|iPod|Windows Phone|IEMobile|Opera Mini|Mobile Safari/i.test(
    ua
  );
}
