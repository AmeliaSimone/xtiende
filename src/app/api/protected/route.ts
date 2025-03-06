import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Usamos CommonJS para evitar problemas de importación en algunos entornos
const jwt = require("jsonwebtoken");

// Clave secreta para firmar y verificar tokens
const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";

/**
 * Maneja las peticiones GET a /api/protected
 * 
 * 1. Obtiene el token del header Authorization (formato Bearer).
 * 2. Verifica si el token es válido usando la clave secreta.
 * 3. Responde con 200 si el token es válido, o con 401 si no lo es.
 */
export async function GET(req: NextRequest) {
  console.log("📌 Se recibió una solicitud GET en /api/protected");

  // 1. Tomar el header: "Authorization: Bearer <token>"
  const authHeader = req.headers.get("authorization"); 
  const accessToken = authHeader?.split(" ")[1];

  // 2. Revisar si existe token
  if (!accessToken) {
    return NextResponse.json(
      { message: "No autorizado. Falta el token." },
      { status: 401 }
    );
  }

  // 3. Verificar el token
  try {
    const decoded = jwt.verify(accessToken, ACCESS_SECRET);
    console.log("✅ Token válido. Payload decodificado:", decoded);

    // 4. Responder con 200 si todo está bien
    return NextResponse.json({ message: "Acceso permitido", user: decoded });
  } catch (error) {
    console.error("❌ Token inválido o expirado:", (error as Error).message);
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}
