import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // ✅ Importar correctamente
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

export async function POST() {
  try {
    // ✅ Obtener cookies usando `await`
    const cookieStore = await cookies(); // ✅ Asegurar que usamos `await`
    const refreshToken = await cookieStore.get("refreshToken")?.value;

    console.log("📌 RefreshToken recibido en /refresh:", refreshToken);

    if (!refreshToken) {
      return NextResponse.json({ message: "No autorizado - No se encontró refreshToken" }, { status: 401 });
    }

    // ✅ Verificar el refreshToken
    const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET);

    // ✅ Generar un nuevo accessToken
    const newAccessToken = jwt.sign({ userId: decoded.userId }, ACCESS_SECRET, { expiresIn: "15m" });

    console.log("🔄 Nuevo AccessToken generado en /refresh:", newAccessToken);

    // ✅ Responder con el nuevo token
    return NextResponse.json({ accessToken: newAccessToken });

  } catch (error) {
    console.error("❌ Error al refrescar el token:", (error as Error).message);
    return NextResponse.json({ message: "Error interno del servidor", error: (error as Error).message }, { status: 500 });
  }
}
