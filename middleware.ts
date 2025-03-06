import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

export function middleware(req: NextRequest) {
  console.log("📌 Middleware activado en:", req.nextUrl.pathname);

  const accessToken = req.headers.get("authorization")?.split(" ")[1];
  console.log("📌 AccessToken recibido en middleware:", accessToken);

  if (!accessToken) {
    console.warn("🚨 No se encontró un AccessToken válido. Redirigiendo al login...");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(accessToken, ACCESS_SECRET);
    console.log("✅ AccessToken válido. Permitiendo acceso.");
    return NextResponse.next();
  } catch (error) {
    console.warn("⚠️ AccessToken inválido o expirado:", (error as Error).message);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
