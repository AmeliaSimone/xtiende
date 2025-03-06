import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// 🔹 Definir la estructura de un usuario
interface User {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  idNumber: string;
  businessActivity: string;
  industry: string;
  company: string;
}

// 🔹 Simulación de base de datos en memoria
const users: User[] = [];

const SECRET_KEY = process.env.ACCESS_SECRET || "secret_key";

export async function POST(req: Request) {
  try {
    const userData: User = await req.json();

    // Simulación: Guardar usuario en la base de datos temporal
    users.push(userData);

    // 🔹 Mostrar en la terminal la lista de usuarios registrados en memoria
    console.log("🔹 Usuarios registrados en memoria:", users);

    // Generar token de verificación (Simulación)
    const token = jwt.sign({ email: userData.email }, SECRET_KEY, { expiresIn: "1d" });

    console.log(`📧 Enlace de verificación: http://localhost:3000/verify?token=${token}`);

    return NextResponse.json({ message: "Registro exitoso. Revisa tu correo para verificar tu cuenta." });
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    return NextResponse.json({ message: "Error en el servidor." }, { status: 500 });
  }
}
