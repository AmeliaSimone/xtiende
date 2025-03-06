import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Simulación de base de datos
const users = [
  { id: 1, email: "usuario@example.com", password: "hashed_password" }
];

const RESET_SECRET = process.env.RESET_SECRET || "reset_secret";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1️⃣ Validar si el email es correcto
    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Formato de email inválido." }, { status: 400 });
    }

    // 2️⃣ Buscar usuario en la "base de datos"
    const user = users.find((u) => u.email === email);

    // 🔹 Mensaje genérico para evitar filtraciones
    if (!user) {
      return NextResponse.json({ message: "Si el email está registrado, recibirás un enlace de recuperación." });
    }

    // 3️⃣ Generar token único de recuperación (válido por 30 minutos)
    const resetToken = jwt.sign({ userId: user.id, email }, RESET_SECRET, { expiresIn: "30m" });

    // 📧 Aquí se enviaría el email con el enlace de recuperación
    console.log(`🔗 Enlace de recuperación: http://localhost:3000/password-reset/reset?token=${resetToken}`);

    return NextResponse.json({ message: "Si el email está registrado, recibirás un enlace de recuperación." });
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor." }, { status: 500 });
  }
}
