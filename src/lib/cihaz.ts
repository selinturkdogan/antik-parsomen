import { useEffect, useState } from "react";

/**
 * Ziyaretçi telefonda mı?
 *
 * E-posta bağlantılarında gerekiyor: telefonda `mailto:` mail
 * uygulamasının yazma ekranını açıyor, Gmail'in web adresi ise ya gelen
 * kutusuna düşüyor ya da sıkışık bir web formu gösteriyor. Masaüstünde
 * tam tersi: `mailto:` kurulu olmayan bir programı açmaya çalışıyor,
 * Gmail'in web arayüzü ise düzgün çalışıyor.
 *
 * Sunucu hangi cihaz olduğunu bilemez; bu yüzden `false` ile başlayıp
 * bileşen yüklendikten sonra güncelliyoruz. İlk render sunucuyla aynı
 * olduğu için hydration uyuşmazlığı olmuyor.
 */
export function useTelefonMu() {
  const [telefon, setTelefon] = useState(false);

  useEffect(() => {
    const kucukEkran = window.matchMedia("(max-width: 820px)").matches;
    const dokunmatik = window.matchMedia("(pointer: coarse)").matches;
    setTelefon(kucukEkran && dokunmatik);
  }, []);

  return telefon;
}
