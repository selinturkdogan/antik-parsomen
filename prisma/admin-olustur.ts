import "dotenv/config";
import { createInterface } from "node:readline/promises";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL bulunamadı.");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const soru = createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n🔐 Admin hesabı oluşturma\n");

  const ad = (await soru.question("Adınız: ")).trim();
  const email = (await soru.question("E-posta: ")).trim().toLowerCase();
  const sifre = await soru.question("Şifre (en az 8 karakter): ");
  const sifreTekrar = await soru.question("Şifre (tekrar): ");

  soru.close();

  if (!ad || !email) {
    console.error("\n❌ Ad ve e-posta boş bırakılamaz.");
    process.exit(1);
  }

  if (sifre.length < 8) {
    console.error("\n❌ Şifre en az 8 karakter olmalı.");
    process.exit(1);
  }

  if (sifre !== sifreTekrar) {
    console.error("\n❌ Şifreler birbiriyle uyuşmuyor.");
    process.exit(1);
  }

  // 12 tur: kırılması pahalı, girişte fark edilmeyecek kadar hızlı
  const sifreHash = await bcrypt.hash(sifre, 12);

  const kullanici = await prisma.kullanici.upsert({
    where: { email },
    update: { ad, sifreHash }, // hesap zaten varsa şifreyi günceller
    create: { ad, email, sifreHash },
  });

  console.log(`\n✅ Hazır: ${kullanici.ad} <${kullanici.email}>`);
  console.log("   Giriş adresi: http://localhost:3000/admin/giris\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Hata:", e);
    await prisma.$disconnect();
    process.exit(1);
  });