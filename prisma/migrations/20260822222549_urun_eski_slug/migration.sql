-- CreateTable
CREATE TABLE "UrunEskiSlug" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrunEskiSlug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrunEskiSlug_slug_key" ON "UrunEskiSlug"("slug");

-- CreateIndex
CREATE INDEX "UrunEskiSlug_urunId_idx" ON "UrunEskiSlug"("urunId");

-- AddForeignKey
ALTER TABLE "UrunEskiSlug" ADD CONSTRAINT "UrunEskiSlug_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
