# Antik Parşömen

El yapımı parşömen sanatı, hat ve kaligrafi ürünleri satan **Antik Parşömen** dükkanı için tanıtım sitesi.

## Özellikler

- **Ürün galerisi** — kategori filtresi, arama, ürün detay sayfası, ışık kutusu (lightbox)
- **Duyurular ve etkinlikler** — atölye çalışmaları, sergiler, kermesler
- **Foto galeri** — atölye, üretim aşamaları ve etkinlik fotoğrafları
- **İletişim formu** — gelen mesajlar panele düşer
- **Admin paneli** — ürün, duyuru, galeri ve site ayarlarının yönetimi

## Teknolojiler

| Katman | Araç |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Dil | TypeScript |
| Stil | Tailwind CSS 4 |
| Veritabanı | PostgreSQL (Neon) |
| ORM | Prisma 7 |
| Görseller | Cloudinary |

## Kurulum

```bash
npm install
```

Proje kökünde bir `.env` dosyası oluşturun:

```
DATABASE_URL="postgresql://..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Veritabanı tablolarını oluşturun ve başlangıç verilerini ekleyin:

```bash
npx prisma migrate dev
npx prisma db seed
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Site [http://localhost:3000](http://localhost:3000) adresinde çalışır.

## Yardımcı komutlar

```bash
npx prisma studio                                  # veritabanını tarayıcıda görüntüle
npx tsx prisma/gorsel-ekle.ts <urun-slug> <dosya>  # ürüne fotoğraf yükle
```

## Proje yapısı

```
src/
├── app/           # sayfalar (klasör adı = adres)
├── components/    # yeniden kullanılan arayüz parçaları
├── lib/           # veritabanı ve Cloudinary bağlantıları
└── generated/     # Prisma'nın ürettiği kod (git'e dahil değil)
prisma/
├── schema.prisma  # veritabanı tabloları
├── migrations/    # veritabanı değişiklik geçmişi
└── seed.ts        # başlangıç verileri
```
