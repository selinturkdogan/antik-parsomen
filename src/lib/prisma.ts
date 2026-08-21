import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7'de veritabanına bir "sürücü adaptörü" üzerinden bağlanıyoruz.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL bulunamadı. .env dosyasında tanımlı olduğundan emin olun."
  );
}

// Geliştirme sırasında Next.js dosyaları sürekli yeniden yüklüyor.
// Önlem almazsak her yüklemede yeni bağlantı açılır ve
// kısa sürede "too many connections" hatası alırız.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function istemciOlustur() {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
}

export const prisma = globalForPrisma.prisma ?? istemciOlustur();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}