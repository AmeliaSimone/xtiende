export async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Credenciales incorrectas");
    return res.json(); // Devuelve el Access Token
  }
  
  export async function refreshToken() {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) throw new Error("No autorizado");
    return res.json();
  }
  
  export async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
  }
  