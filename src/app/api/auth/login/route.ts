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

// Función para generar tokens
const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Buscar usuario en la base de datos
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ message: "Credenciales incorrectas" }, { status: 401 });
    }

    // Generar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Guardar Refresh Token en una Cookie HTTP-only
    const response = NextResponse.json({ accessToken });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 604800 });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
