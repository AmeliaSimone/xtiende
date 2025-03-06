import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Simulación de base de datos
const users = [
  { id: 1, email: "usuario@example.com", password: bcrypt.hashSync("password123", 10) }
];

const RESET_SECRET = process.env.RESET_SECRET || "reset_secret";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token y nueva contraseña son obligatorios." }, { status: 400 });
    }

    let decoded: JwtPayload;
    try {
      const decodedToken = jwt.verify(token, RESET_SECRET);
      
      if (typeof decodedToken === "string") {
        return NextResponse.json({ message: "Token inválido." }, { status: 400 });
      }
      decoded = decodedToken as JwtPayload;
    } catch (err) {
      return NextResponse.json({ message: "Token inválido o expirado." }, { status: 400 });
    }

    if (!decoded.email) {
      return NextResponse.json({ message: "Token inválido: falta email." }, { status: 400 });
    }

    // Buscar usuario por email
    const user = users.find(u => u.email === decoded.email);
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }


// 🔹 Cifrar nueva contraseña antes de guardarla
const hashedPassword = bcrypt.hashSync(password, 10);
user.password = hashedPassword;

// 🔹 Mostrar en consola la nueva contraseña cifrada
console.log(`🔑 Nueva contraseña (hasheada) para ${user.email}: ${user.password}`);

    

    return NextResponse.json({ message: "Contraseña restablecida con éxito." });
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor." }, { status: 500 });
  }
}
