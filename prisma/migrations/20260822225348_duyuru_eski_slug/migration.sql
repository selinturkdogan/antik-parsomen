-- CreateTable
CREATE TABLE "DuyuruEskiSlug" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "duyuruId" TEXT NOT NULL,
    "olusturma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuyuruEskiSlug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DuyuruEskiSlug_slug_key" ON "DuyuruEskiSlug"("slug");

-- CreateIndex
CREATE INDEX "DuyuruEskiSlug_duyuruId_idx" ON "DuyuruEskiSlug"("duyuruId");

-- AddForeignKey
ALTER TABLE "DuyuruEskiSlug" ADD CONSTRAINT "DuyuruEskiSlug_duyuruId_fkey" FOREIGN KEY ("duyuruId") REFERENCES "Duyuru"("id") ON DELETE CASCADE ON UPDATE CASCADE;
