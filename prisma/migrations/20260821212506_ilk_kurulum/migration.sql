-- CreateEnum
CREATE TYPE "DuyuruTuru" AS ENUM ('DUYURU', 'ETKINLIK');

-- CreateEnum
CREATE TYPE "GaleriTuru" AS ENUM ('ATOLYE', 'URETIM', 'ETKINLIK', 'STAND', 'MUSTERI', 'DIGER');

-- CreateTable
CREATE TABLE "Kullanici" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sifreHash" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kullanici_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Urun" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "oneCikan" BOOLEAN NOT NULL DEFAULT false,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Urun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrunGorsel" (
    "id" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "alt" TEXT,
    "sira" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UrunGorsel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duyuru" (
    "id" TEXT NOT NULL,
    "tur" "DuyuruTuru" NOT NULL DEFAULT 'DUYURU',
    "baslik" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "kapakUrl" TEXT,
    "kapakPublicId" TEXT,
    "tarih" TIMESTAMP(3),
    "yer" TEXT,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Duyuru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GaleriFoto" (
    "id" TEXT NOT NULL,
    "tur" "GaleriTuru" NOT NULL DEFAULT 'DIGER',
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "aciklama" TEXT,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GaleriFoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesaj" (
    "id" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "konu" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mesaj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoruCevap" (
    "id" TEXT NOT NULL,
    "soru" TEXT NOT NULL,
    "cevap" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "yayinda" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SoruCevap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteAyar" (
    "id" TEXT NOT NULL DEFAULT 'tek',
    "telefon" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "adres" TEXT,
    "mapsUrl" TEXT,
    "calismaSaatleri" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "youtube" TEXT,
    "hikaye" TEXT,
    "sahipAdi" TEXT,
    "sahipBiyografi" TEXT,
    "malzemeBilgi" TEXT,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAyar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kullanici_email_key" ON "Kullanici"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_ad_key" ON "Kategori"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_slug_key" ON "Kategori"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_slug_key" ON "Urun"("slug");

-- CreateIndex
CREATE INDEX "Urun_kategoriId_idx" ON "Urun"("kategoriId");

-- CreateIndex
CREATE INDEX "Urun_oneCikan_idx" ON "Urun"("oneCikan");

-- CreateIndex
CREATE INDEX "UrunGorsel_urunId_idx" ON "UrunGorsel"("urunId");

-- CreateIndex
CREATE UNIQUE INDEX "Duyuru_slug_key" ON "Duyuru"("slug");

-- CreateIndex
CREATE INDEX "GaleriFoto_tur_idx" ON "GaleriFoto"("tur");

-- CreateIndex
CREATE INDEX "Mesaj_okundu_idx" ON "Mesaj"("okundu");

-- AddForeignKey
ALTER TABLE "Urun" ADD CONSTRAINT "Urun_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrunGorsel" ADD CONSTRAINT "UrunGorsel_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
