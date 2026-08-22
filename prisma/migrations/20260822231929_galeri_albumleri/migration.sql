/*
  Warnings:

  - You are about to drop the column `tur` on the `GaleriFoto` table. All the data in the column will be lost.
  - Added the required column `albumId` to the `GaleriFoto` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GaleriFoto_tur_idx";

-- AlterTable
ALTER TABLE "GaleriFoto" DROP COLUMN "tur",
ADD COLUMN     "albumId" TEXT NOT NULL,
ADD COLUMN     "genislik" INTEGER,
ADD COLUMN     "yukseklik" INTEGER;

-- CreateTable
CREATE TABLE "GaleriAlbum" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "aciklama" TEXT,
    "tur" "GaleriTuru" NOT NULL DEFAULT 'DIGER',
    "tarih" TIMESTAMP(3),
    "yayinda" BOOLEAN NOT NULL DEFAULT true,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GaleriAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GaleriAlbum_slug_key" ON "GaleriAlbum"("slug");

-- CreateIndex
CREATE INDEX "GaleriAlbum_tur_idx" ON "GaleriAlbum"("tur");

-- CreateIndex
CREATE INDEX "GaleriFoto_albumId_idx" ON "GaleriFoto"("albumId");

-- AddForeignKey
ALTER TABLE "GaleriFoto" ADD CONSTRAINT "GaleriFoto_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GaleriAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
