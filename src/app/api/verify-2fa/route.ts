import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { method } = await req.json();

    if (!["email", "sms", "authenticator", "webauthn"].includes(method)) {
      return NextResponse.json({ message: "Método de autenticación inválido" }, { status: 400 });
    }

    let message = `Código enviado a través de ${method}`;

    if (method === "email") {
      // 📌 Aquí enviaría el código por email
      console.log("📧 Enviando código por Email...");
    } else if (method === "sms") {
      // 📌 Aquí enviaría el código por SMS
      console.log("📱 Enviando código por SMS...");
    } else if (method === "authenticator") {
      // 📌 Generar código de Google Authenticator (TOTP)
      console.log("🔐 Generando código con Google Authenticator...");
    } else if (method === "webauthn") {
      // 📌 WebAuthn no requiere código, solo autenticación biométrica
      message = "Usa tu huella o Face ID para autenticarte.";
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
