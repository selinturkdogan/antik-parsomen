import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Cloudinary bilgileri eksik. .env dosyasındaki CLOUDINARY_* satırlarını kontrol edin."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true, // adresler hep https olsun
});

/**
 * Bir dosyayı Cloudinary'ye yükler.
 * Geriye görselin adresini ve silmek için gereken kimliğini döner.
 */
export function gorselYukle(
  dosya: Buffer,
  klasor = "antik-parsomen"
): Promise<{ url: string; publicId: string }> {
  return new Promise((cozumle, reddet) => {
    const akis = cloudinary.uploader.upload_stream(
      { folder: klasor, resource_type: "image" },
      (hata, sonuc) => {
        if (hata || !sonuc) {
          return reddet(hata ?? new Error("Yükleme başarısız"));
        }
        cozumle({ url: sonuc.secure_url, publicId: sonuc.public_id });
      }
    );
    akis.end(dosya);
  });
}

/** Cloudinary'den bir görseli kalıcı olarak siler. */
export async function gorselSil(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };