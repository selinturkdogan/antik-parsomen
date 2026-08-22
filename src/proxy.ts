import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Not: Next.js 16'da "Middleware" bu isme geçti (proxy.ts).
const OTURUM_CEREZ_ADI = "ap_oturum";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cerezVar = Boolean(request.cookies.get(OTURUM_CEREZ_ADI)?.value);
  const girisSayfasi = pathname === "/admin/giris";

  // Girişliyken giriş sayfasına gitmeye çalışırsa panele yolla
  if (girisSayfasi && cerezVar) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Girişsizken panele girmeye çalışırsa giriş sayfasına yolla
  if (!girisSayfasi && !cerezVar) {
    const hedef = new URL("/admin/giris", request.url);
    return NextResponse.redirect(hedef);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};