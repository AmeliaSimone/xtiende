import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

export function middleware(req: NextRequest) {
  console.log("📌 Middleware activado en:", req.nextUrl.pathname);
  console.log("📌 Headers recibidos:", req.headers);

  const accessToken = req.headers.get("authorization")?.split(" ")[1];
  const refreshToken = req.cookies.get("refreshToken")?.value;

  console.log("📌 RefreshToken recibido en el middleware:", refreshToken);

  if (accessToken) {
    try {
      jwt.verify(accessToken, ACCESS_SECRET);
      console.log("✅ AccessToken válido. Permitiendo acceso.");
      return NextResponse.next();
    } catch (error) {
      console.warn("⚠️ AccessToken expirado. Intentando refrescar...");
    }
  }

  if (refreshToken) {
    try {
      const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET);
      const newAccessToken = jwt.sign({ userId: decoded.userId }, ACCESS_SECRET, { expiresIn: "15m" });

      console.log("🔄 Nuevo AccessToken generado:", newAccessToken);

      const response = NextResponse.next();
      response.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return response;
    } catch (error) {
      console.error("❌ Error al verificar RefreshToken:", (error as Error).message);
      return NextResponse.json({ message: "RefreshToken inválido", error: (error as Error).message }, { status: 401 });
    }
  }

  console.warn("🚨 No se encontró un AccessToken ni un RefreshToken válido. Redirigiendo al login...");
  return NextResponse.redirect(new URL("/login", req.url));
}

// 🔥 Forzar Next.js a usar Node.js en lugar de Edge
export const config = {
  matcher: ["/dashboard/:path*"],
  runtime: "nodejs",
};
