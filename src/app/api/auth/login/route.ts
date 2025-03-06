import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Simulación de una base de datos
const users = [
  { id: 1, email: "usuario@example.com", password: bcrypt.hashSync("password123", 10) }
];

// Claves secretas
const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

// Función para generar tokens seguros
const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son obligatorios." }, { status: 400 });
    }

    // Buscar usuario en la base de datos simulada
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ message: "Credenciales incorrectas." }, { status: 401 });
    }
    
    // 🔍 Debugging: Imprimir contraseñas en la terminal
    console.log(`🔍 Contraseña ingresada: ${password}`);
    console.log(`🔍 Contraseña almacenada (hash): ${user.password}`);

    const isMatch = bcrypt.compareSync(password, user.password);
console.log(`✅ Coinciden?: ${isMatch}`);

if (!isMatch) {
  return NextResponse.json({ message: "Credenciales incorrectas." }, { status: 401 });
}

    // Generar tokens seguros
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Configurar cookies seguras para autenticación
    const response = NextResponse.json({
      message: "Inicio de sesión exitoso",
      expiresIn: 15 * 60, // 15 minutos en segundos
    });

    // Guardar Access Token en Cookie segura (httpOnly)
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutos
      path: "/",
    });

    // Guardar Refresh Token en Cookie segura (httpOnly)
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("❌ Error en el login:", error);
    return NextResponse.json({ message: "Error en el servidor." }, { status: 500 });
  }
}
