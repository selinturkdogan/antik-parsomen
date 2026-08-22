import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";


// Başlıklar için: klasik el yazması havası veren zarif bir serif
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"], // latin-ext = Türkçe karakterler
  display: "swap",
});

// Gövde metni için: ekranda çok okunaklı modern bir font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Google'da ve tarayıcı sekmesinde görünecek bilgiler
export const metadata: Metadata = {
  title: {
    default: "Antik Parşömen — El Yapımı Parşömen Sanatı",
    template: "%s | Antik Parşömen", // alt sayfalarda: "İletişim | Antik Parşömen"
  },
  description:
    "El yapımı parşömen sanatı ve kişiye özel tasarımlar. Hat sanatı, kaligrafi, davetiye ve dekoratif parşömenler.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
                 <body className="flex min-h-full flex-col bg-parsomen-100 text-murekkep-900">
        {children}
      </body>
    </html>
  );
}