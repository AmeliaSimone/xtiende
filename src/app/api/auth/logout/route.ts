import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión cerrada" });
  response.cookies.set("refreshToken", "", { httpOnly: true, secure: true, sameSite: "strict", maxAge: 0 });
  return response;
}
